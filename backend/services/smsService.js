const twilio = require('twilio');

let client;
try {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token && sid.startsWith('AC') && !sid.includes('PLACEHOLDER')) {
    client = twilio(sid, token);
    console.log('Twilio client initialized');
  } else {
    console.warn('[SMS] Twilio credentials not configured — SMS will be mocked');
  }
} catch (e) {
  console.warn('[SMS] Twilio client init failed:', e.message);
}

const sendSMS = async ({ to, body }) => {
  try {
    if (!client) {
      console.log(`[SMS Mock] To: ${to}, Body: ${body}`);
      return { success: false, reason: 'SMS not configured', mock: true };
    }
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('[SMS] Send error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
