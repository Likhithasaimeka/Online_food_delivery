// Multer configuration for profile image uploads.
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (request, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}_${safeName}`;
    callback(null, uniqueName);
  }
});

const fileFilter = (request, file, callback) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) return callback(null, true);
  return callback(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = upload;
