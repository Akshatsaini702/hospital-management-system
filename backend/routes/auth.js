const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');
const { sendSmsOtp, hasTwilioConfig } = require('../utils/sms');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();
const OTP_EXPIRY_MINUTES = 10;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sanitizeUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  token: generateToken(user._id),
});

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const sendOtpEmail = async ({ to, name, otp, title }) => {
  await sendEmail({
    to,
    subject: `${title} - Mediflix+`,
    text: `Hi ${name || 'there'}, your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Hi ${name || 'there'},</p><p>Your OTP is <b>${otp}</b>.</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  });
};

const sendWelcomeEmailIfNeeded = async (user) => {
  if (user.welcomeEmailSentAt) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Mediflix+',
    text: `Hi ${user.name}, welcome to Mediflix+. Your account is now active.`,
    html: `<p>Hi ${user.name},</p><p>Welcome to <b>Mediflix+</b>. Your account is now active.</p>`,
  });

  user.welcomeEmailSentAt = new Date();
  await user.save();
};

const clearOtpState = (user) => {
  user.otpCodeHash = null;
  user.otpExpiresAt = null;
  user.otpPurpose = null;
};

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      // Update role if provided and user's current role differs
      if (role && ['admin', 'receptionist', 'doctor', 'patient'].includes(role)) {
        user.role = role;
      }
      await user.save();
    } else {
      // Create new user from Google — use selected role or default to patient
      const selectedRole = (role && ['admin', 'receptionist', 'doctor', 'patient'].includes(role)) ? role : 'patient';
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        role: selectedRole,
      });
    }

    await sendWelcomeEmailIfNeeded(user);

    res.json(sanitizeUserResponse(user));
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Capitalize each word of the name
    const capitalizedName = name ? name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : name;
    const user = await User.create({ name: capitalizedName, email: normalizedEmail, password, role: role || 'receptionist', phone });

    await sendWelcomeEmailIfNeeded(user);

    res.status(201).json(sanitizeUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await sendWelcomeEmailIfNeeded(user);

    res.json(sanitizeUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login-otp/request
router.post('/login-otp/request', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOtp();
    user.otpCodeHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpPurpose = 'login';
    await user.save();

    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      title: 'Your login OTP',
    });

    const response = { message: 'OTP sent to your email' };
    if (process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login-otp/verify
router.post('/login-otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = String(email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpCodeHash || !user.otpExpiresAt || user.otpPurpose !== 'login') {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    if (user.otpExpiresAt < new Date() || user.otpCodeHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    clearOtpState(user);
    await user.save();
    await sendWelcomeEmailIfNeeded(user);

    res.json(sanitizeUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/phone-otp/request — send OTP via SMS (Twilio) or fallback to email
router.post('/phone-otp/request', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const normalizedPhone = String(phone).replace(/\s|-/g, '').trim();
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this phone number' });
    }

    const otp = generateOtp();
    user.otpCodeHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpPurpose = 'login';
    await user.save();

    // Try sending real SMS via Twilio first
    let smsSent = false;
    try {
      const smsResult = await sendSmsOtp(normalizedPhone, otp);
      smsSent = !smsResult.fallback;
    } catch (smsError) {
      console.error('[SMS Error]', smsError.message);
    }

    // Fallback to email if SMS fails or Twilio not configured
    if (!smsSent && user.email) {
      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        title: 'Your phone login OTP',
      });
    }

    const response = {
      message: smsSent
        ? 'OTP sent to your phone via SMS'
        : 'OTP sent to your registered email (SMS not configured)',
      viaSms: smsSent,
    };
    if (process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/phone-otp/verify — verify phone OTP and login
router.post('/phone-otp/verify', async (req, res) => {
  try {
    const { phone, otp, role } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const normalizedPhone = String(phone).replace(/\s|-/g, '').trim();
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user || !user.otpCodeHash || !user.otpExpiresAt || user.otpPurpose !== 'login') {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    if (user.otpExpiresAt < new Date() || user.otpCodeHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    // Update role if provided
    if (role && ['admin', 'receptionist', 'doctor', 'patient'].includes(role)) {
      user.role = role;
    }

    clearOtpState(user);
    await user.save();
    await sendWelcomeEmailIfNeeded(user);

    res.json(sanitizeUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/forgot-password/request
router.post('/forgot-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOtp();
    user.otpCodeHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpPurpose = 'forgot-password';
    await user.save();

    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      title: 'Password reset OTP',
    });

    const response = { message: 'Password reset OTP sent to your email' };
    if (process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/forgot-password/verify
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpCodeHash || !user.otpExpiresAt || user.otpPurpose !== 'forgot-password') {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    if (user.otpExpiresAt < new Date() || user.otpCodeHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    user.password = newPassword;
    clearOtpState(user);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/change-email/request
router.post('/change-email/request', protect, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      return res.status(400).json({ message: 'New email and password are required' });
    }

    const normalizedNewEmail = String(newEmail).toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedNewEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    const otp = generateOtp();
    user.pendingEmail = normalizedNewEmail;
    user.otpCodeHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpPurpose = 'email-change';
    await user.save();

    await sendOtpEmail({
      to: user.pendingEmail,
      name: user.name,
      otp,
      title: 'Confirm your new email',
    });

    const response = { message: 'OTP sent to your new email address' };
    if (process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/change-email/verify
router.post('/change-email/verify', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.pendingEmail || !user.otpCodeHash || !user.otpExpiresAt || user.otpPurpose !== 'email-change') {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    if (user.otpExpiresAt < new Date() || user.otpCodeHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    clearOtpState(user);
    const updatedUser = await user.save();

    res.json(sanitizeUserResponse(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json(sanitizeUserResponse(updatedUser));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
