// Import user model functions.
const UserModel = require('../models/userModel');
const OtpModel = require('../models/otpModel');
const mailer = require('../config/mail');

// Generate a 6-digit OTP.
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// OTP configuration.
const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;

// Apply rate-limit rules using existing OTP row.
const computeRateLimit = (otpRow) => {
  const now = Date.now();
  const lastSent = otpRow?.lastSentAt ? new Date(otpRow.lastSentAt).getTime() : 0;
  const windowStart = otpRow?.windowStart ? new Date(otpRow.windowStart).getTime() : now;
  const requestCount = Number(otpRow?.requestCount || 0);

  if (now - lastSent < RESEND_COOLDOWN_MS) {
    return { blocked: true, message: 'Please wait before requesting another OTP' };
  }

  if (now - windowStart > 60 * 60 * 1000) {
    return { blocked: false, requestCount: 1, windowStart: new Date(now).toISOString() };
  }

  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    return { blocked: true, message: 'Too many OTP requests. Try again later.' };
  }

  return { blocked: false, requestCount: requestCount + 1, windowStart: new Date(windowStart).toISOString() };
};

// GET /api/users/profile/:id
// Returns: user details, profileImage, createdAt, totalOrders, and full
// orders list with food name + price, sorted newest first.
const getUserProfile = (request, response) => {
  UserModel.getUserProfile(request.params.id, (error, profileData) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!profileData) return response.status(404).json({ message: 'User not found' });
    return response.json(profileData);
  });
};

// GET /api/users
const getUsers = (request, response) => {
  UserModel.getAllUsers((error, rows) => {
    if (error) return response.status(500).json({ message: error.message });
    return response.json(rows);
  });
};

// GET /api/users/:id
const getUser = (request, response) => {
  UserModel.getUserById(request.params.id, (error, row) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!row) return response.status(404).json({ message: 'User not found' });
    return response.json(row);
  });
};

// POST /api/users
const createUser = (request, response) => {
  UserModel.createUser(request.body, (error, user) => {
    if (error) return response.status(400).json({ message: error.message });
    return response.status(201).json(user);
  });
};

// POST /api/users/register
// Sends OTP and stores temporary registration data.
const requestOtpRegistration = (request, response) => {
  const { name, email } = request.body;

  if (!name || !email) {
    return response.status(400).json({ message: 'Name and email are required' });
  }

  UserModel.getUserByEmail(email, (error, existingUser) => {
    if (error) return response.status(500).json({ message: error.message });
    if (existingUser && existingUser.isVerified) {
      return response.status(400).json({ message: 'Email already registered' });
    }

    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return response.status(500).json({ message: 'Email service not configured' });
    }

    OtpModel.getOtpRequest(email, (otpFetchError, otpRow) => {
      if (otpFetchError) return response.status(500).json({ message: otpFetchError.message });

      const rateLimit = computeRateLimit(otpRow);
      if (rateLimit.blocked) {
        return response.status(429).json({ message: rateLimit.message });
      }

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
      const lastSentAt = new Date().toISOString();

      OtpModel.upsertOtpRequest(
        {
          name,
          email,
          otp,
          expiresAt,
          lastSentAt,
          requestCount: rateLimit.requestCount,
          windowStart: rateLimit.windowStart
        },
        (otpError) => {
          if (otpError) return response.status(500).json({ message: otpError.message });

          const mailOptions = {
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to: email,
            subject: 'Your OTP for Online Food Delivery Registration',
            text: `Your OTP is ${otp}. It expires in 5 minutes.`
          };

          mailer.sendMail(mailOptions, (mailError) => {
            if (mailError) {
              console.warn(`[EMAIL SEND FAILED] ${mailError.message}`);
              console.log(`\n========================================\n[DEV OTP] For ${email}: OTP is ${otp}\n========================================\n`);
              return response.json({ 
                message: `OTP sent! (Note: Email delivery failed, your OTP is: ${otp})`,
                devOtp: otp 
              });
            }
            return response.json({ message: 'OTP sent to email' });
          });
        }
      );
    });
  });
};

// POST /api/users/resend-otp
// Resends OTP using existing OTP request data.
const resendOtp = (request, response) => {
  const { email } = request.body;

  if (!email) return response.status(400).json({ message: 'Email is required' });

  OtpModel.getOtpRequest(email, (otpFetchError, otpRow) => {
    if (otpFetchError) return response.status(500).json({ message: otpFetchError.message });
    if (!otpRow) return response.status(400).json({ message: 'No pending OTP. Please register first.' });

    const rateLimit = computeRateLimit(otpRow);
    if (rateLimit.blocked) return response.status(429).json({ message: rateLimit.message });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
    const lastSentAt = new Date().toISOString();

    OtpModel.upsertOtpRequest(
      {
        name: otpRow.name,
        email: otpRow.email,
        otp,
        expiresAt,
        lastSentAt,
        requestCount: rateLimit.requestCount,
        windowStart: rateLimit.windowStart
      },
      (otpError) => {
        if (otpError) return response.status(500).json({ message: otpError.message });

        const mailOptions = {
          from: process.env.MAIL_FROM || process.env.MAIL_USER,
          to: email,
          subject: 'Your OTP for Online Food Delivery Registration',
          text: `Your OTP is ${otp}. It expires in 5 minutes.`
        };

        mailer.sendMail(mailOptions, (mailError) => {
          if (mailError) {
            console.warn(`[EMAIL RESEND FAILED] ${mailError.message}`);
            console.log(`\n========================================\n[DEV RESEND OTP] For ${email}: OTP is ${otp}\n========================================\n`);
            return response.json({ 
              message: `OTP resent! (Note: Email delivery failed, your OTP is: ${otp})`,
              devOtp: otp 
            });
          }
          return response.json({ message: 'OTP resent to email' });
        });
      }
    );
  });
};

// POST /api/users/verify-otp
// Verifies OTP and creates user with password.
const verifyOtp = (request, response) => {
  const { email, otp, password, confirmPassword } = request.body;

  if (!email || !otp || !password || !confirmPassword) {
    return response.status(400).json({ message: 'Email, OTP, password, and confirm password are required' });
  }

  if (password !== confirmPassword) {
    return response.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return response.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  OtpModel.getOtpRequest(email, (error, otpRow) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!otpRow) return response.status(400).json({ message: 'OTP not found or expired' });

    if (otpRow.otp !== String(otp)) {
      return response.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date(otpRow.expiresAt).getTime() < Date.now()) {
      return response.status(400).json({ message: 'OTP expired' });
    }

    UserModel.getUserByEmail(email, (checkError, existingUser) => {
      if (checkError) return response.status(500).json({ message: checkError.message });

      if (existingUser && existingUser.isVerified) {
        return response.status(400).json({ message: 'Email already registered' });
      }

      const userPayload = {
        name: otpRow.name,
        email: otpRow.email,
        password,
        isVerified: 1
      };

      UserModel.createUser(userPayload, (createError) => {
        if (createError) return response.status(400).json({ message: createError.message });

        OtpModel.deleteOtpRequest(email, () => {
          return response.json({ message: 'OTP verified. Registration complete.' });
        });
      });
    });
  });
};

// PUT /api/users/:id
const updateUser = (request, response) => {
  UserModel.updateUser(request.params.id, request.body, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'User not found' });
    return response.json({ message: 'User updated successfully' });
  });
};

// PUT /api/users/profile/:id
// Updates profile fields only (name, email, profileImage).
const updateUserProfile = (request, response) => {
  UserModel.updateUserProfile(request.params.id, request.body, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'User not found' });
    return response.json({ message: 'Profile updated successfully' });
  });
};

// POST /api/users/profile/:id/image
// Saves uploaded file and updates profileImage path.
const updateUserProfileImage = (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: 'No image uploaded' });
  }

  const imagePath = `/uploads/${request.file.filename}`;

  UserModel.updateUserProfileImage(request.params.id, imagePath, (error, changes) => {
    if (error) return response.status(400).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'User not found' });
    return response.json({ message: 'Profile image updated', profileImage: imagePath });
  });
};

// DELETE /api/users/:id
const deleteUser = (request, response) => {
  UserModel.deleteUser(request.params.id, (error, changes) => {
    if (error) return response.status(500).json({ message: error.message });
    if (!changes) return response.status(404).json({ message: 'User not found' });
    return response.json({ message: 'User deleted successfully' });
  });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  requestOtpRegistration,
  resendOtp,
  verifyOtp,
  updateUser,
  updateUserProfile,
  updateUserProfileImage,
  deleteUser,
  getUserProfile
};
