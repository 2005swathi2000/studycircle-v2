import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = body;

    if (!to || !subject || !text || !smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters for relaying SMTP email.' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
    });

    const info = await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to,
      subject,
      text,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      method: 'vercel-proxy'
    });
  } catch (error: any) {
    console.error('[Vercel SMTP Relay Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
