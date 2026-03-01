const twilio = require('twilio');

let twilioClient = null;

const hasTwilioConfig = () => {
  return (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
};

const getTwilioClient = () => {
  if (!twilioClient && hasTwilioConfig()) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

/**
 * Send an SMS OTP to the given phone number
 * @param {string} phone - Phone number (10 digits, Indian format assumed)
 * @param {string} otp - The OTP code to send
 * @returns {Promise<object>} Twilio message response or fallback info
 */
const sendSmsOtp = async (phone, otp) => {
  // Ensure phone has country code (default India +91)
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  if (!hasTwilioConfig()) {
    console.log(`[SMS Fallback] OTP for ${formattedPhone}: ${otp}`);
    console.log('[SMS Fallback] Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
    return { fallback: true, message: 'Twilio not configured, OTP logged to console' };
  }

  const client = getTwilioClient();
  const message = await client.messages.create({
    body: `Your Mediflix+ login OTP is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedPhone,
  });

  console.log(`[SMS] OTP sent to ${formattedPhone}, SID: ${message.sid}`);
  return { success: true, sid: message.sid };
};

module.exports = { sendSmsOtp, hasTwilioConfig };
