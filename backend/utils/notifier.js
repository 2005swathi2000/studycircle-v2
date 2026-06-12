const nodemailer = require('nodemailer');

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
 * Sends a real email using SMTP configuration.
 * Returns true if sent successfully, false otherwise.
 */
const sendMail = async (to, subject, text) => {
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
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"StudyCircle Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`[Notifier] Real email sent successfully via SMTP. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Notifier] Failed to send real email via SMTP, attempting FormSubmit.co fallback:', error);
  }
}

  // Fallback to FormSubmit.co for free zero-config real email delivery
  try {
    console.log(`[Notifier] Using FormSubmit.co fallback to send email to: ${to}`);
    const response = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://studycircle-v2-frontend-standalone.vercel.app',
        'Referer': 'https://studycircle-v2-frontend-standalone.vercel.app/'
      },
      body: JSON.stringify({
        _subject: subject,
        message: text,
        _captcha: 'false' // Disables recaptcha verification screen
      })
    });

    const data = await response.json();
    if (!response.ok || data.success === 'false' || data.success === false) {
      throw new Error(data.message || `FormSubmit returned success false`);
    }

    console.log(`[Notifier] Real email sent successfully via FormSubmit.co. Success: ${data.success}`);
    return true;
  } catch (error) {
    console.error('[Notifier] Failed to send email via FormSubmit.co:', error);
    return false;
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error ${response.status}`);
    }

    console.log(`[Notifier] Real SMS sent successfully. Sid: ${data.sid}`);
    return true;
  } catch (error) {
    console.error('[Notifier] Failed to send real SMS via Twilio:', error);
    return false;
  }
};

module.exports = {
  sendMail,
  sendSMS,
  hasSmtpConfig,
  hasTwilioConfig
};
