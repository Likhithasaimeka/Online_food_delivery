// OTP model handles temporary registration data.
const db = require('../config/db');

// Upsert OTP request for a given email.
const upsertOtpRequest = (payload, callback) => {
  const { email, name, otp, expiresAt, lastSentAt, requestCount, windowStart } = payload;
  db.run(
    `INSERT INTO otp_requests (email, name, otp, expiresAt, lastSentAt, requestCount, windowStart)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email)
     DO UPDATE SET name = excluded.name,
                   otp = excluded.otp, expiresAt = excluded.expiresAt,
                   lastSentAt = excluded.lastSentAt,
                   requestCount = excluded.requestCount,
                   windowStart = excluded.windowStart`,
    [email, name, otp, expiresAt, lastSentAt, requestCount, windowStart],
    function (error) {
      callback(error, this?.changes);
    }
  );
};

// Fetch OTP request by email.
const getOtpRequest = (email, callback) => {
  db.get('SELECT * FROM otp_requests WHERE email = ?', [email], callback);
};

// Delete OTP request by email.
const deleteOtpRequest = (email, callback) => {
  db.run('DELETE FROM otp_requests WHERE email = ?', [email], function (error) {
    callback(error, this?.changes);
  });
};

module.exports = {
  upsertOtpRequest,
  getOtpRequest,
  deleteOtpRequest
};
