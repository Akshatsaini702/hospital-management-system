const nodemailer = require('nodemailer');

const hasSmtpConfig = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const createTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@medcare.local';
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n[MAIL_FALLBACK] SMTP is not configured. Email content preview:');
    console.log({ to, from, subject, text });
    return { sent: false, reason: 'SMTP not configured' };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

module.exports = { sendEmail };
