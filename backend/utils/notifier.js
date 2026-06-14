const nodemailer = require('nodemailer');

const hasBrevoConfig = () => {
  return !!process.env.BREVO_API_KEY;
};

const hasSmtpConfig = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const hasTwilioConfig = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
};

/**
 * Sends a real email using Brevo HTTP API or SMTP configuration.
 * Returns true if sent successfully, false otherwise.
 */
const sendMail = async (to, subject, text) => {
  // 1. Try Brevo HTTP API (highly recommended for Render environment)
  if (hasBrevoConfig()) {
    try {
      console.log(`[Notifier] Attempting to send email via Brevo HTTP API to: ${to}`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'StudyCircle Support',
            email: process.env.SMTP_USER || 'hanumanthuswathi24@gmail.com'
          },
          to: [{ email: to }],
          subject: subject,
          textContent: text
        })
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.message || `HTTP ${response.status}`);
      }

      console.log(`[Notifier] Real email sent successfully via Brevo HTTP API.`);
      return { success: true, method: 'brevo' };
    } catch (error) {
      console.error('[Notifier] Failed to send email via Brevo HTTP API:', error);
      console.log('[Notifier] Brevo API failed, attempting fallback SMTP/FormSubmit...');
    }
  }

  // 2. Try SMTP
  if (hasSmtpConfig()) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000, // 5 seconds connection timeout
        greetingTimeout: 5000,   // 5 seconds greeting timeout
        socketTimeout: 8000,     // 8 seconds socket inactivity timeout
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"StudyCircle Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });

      console.log(`[Notifier] Real email sent successfully via SMTP. MessageId: ${info.messageId}`);
      return { success: true, method: 'smtp' };
    } catch (error) {
      console.error('[Notifier] Failed to send real email via SMTP:', error);
      console.log('[Notifier] SMTP failed or timed out. Attempting FormSubmit.co fallback...');
    }
  } else {
    console.warn('[Notifier] SMTP configuration is missing. Attempting FormSubmit.co fallback...');
  }

  // Fallback to FormSubmit.co for free zero-config real email delivery (Dev/Testing only)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

  try {
    console.log(`[Notifier] Using FormSubmit.co fallback to send email to: ${to}`);
    const response = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://studycircle-v2-frontend-standalone.vercel.app',
        'Referer': 'https://studycircle-v2-frontend-standalone.vercel.app/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        _subject: subject,
        message: text,
        _captcha: 'false' // Disables recaptcha verification screen
      })
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok || data.success === 'false' || data.success === false) {
      throw new Error(data.message || `FormSubmit returned success false`);
    }

    console.log(`[Notifier] Real email sent successfully via FormSubmit.co. Success: ${data.success}`);
    return { success: true, method: 'fallback' };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[Notifier] FormSubmit.co request timed out after 15 seconds.');
      return { success: false, error: 'Request timed out' };
    }
    console.error('[Notifier] Failed to send email via FormSubmit.co:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Sends a real SMS using Twilio's REST API with native fetch.
 * Returns true if sent successfully, false otherwise.
 */
const sendSMS = async (to, body) => {
  if (!hasTwilioConfig()) {
    console.warn('[Notifier] Twilio configuration is missing. Falling back to console log.');
    return false;
  }

  let timeoutId;
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    // Standardize to E.164 phone format if needed
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      // If it looks like a standard 10 digit Indian number, prefix with +91
      if (formattedTo.length === 10) {
        formattedTo = `+91${formattedTo}`;
      } else {
        formattedTo = `+${formattedTo}`;
      }
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams({
      To: formattedTo,
      From: fromPhone,
      Body: body
    });

    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error ${response.status}`);
    }

    console.log(`[Notifier] Real SMS sent successfully. Sid: ${data.sid}`);
    return true;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[Notifier] Twilio request timed out after 5 seconds.');
    } else {
      console.error('[Notifier] Failed to send real SMS via Twilio:', error);
    }
    return false;
  }
};

module.exports = {
  sendMail,
  sendSMS,
  hasSmtpConfig,
  hasTwilioConfig
};
