const nodemailer = require('nodemailer');

let transporter = null;

try {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (emailUser && emailPass && !emailPass.includes('PLACEHOLDER')) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });
    console.log('Email transporter initialized');
  } else {
    console.warn('[Email] Credentials not configured — emails will be skipped');
  }
} catch (e) {
  console.warn('[Email] Transporter init failed:', e.message);
}

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!transporter) {
      console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
      return { success: false, reason: 'Email not configured' };
    }
    await transporter.sendMail({
      from: `"SAFELLE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('[Email] Send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
