// Create user routes for CRUD APIs.
const express = require('express');
const UserController = require('../controllers/userController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', UserController.getUsers);
router.post('/register', UserController.requestOtpRegistration);
router.post('/resend-otp', UserController.resendOtp);
router.post('/verify-otp', UserController.verifyOtp);
// /profile/:id must be defined before /:id to avoid Express treating 'profile' as an id.
router.get('/profile/:id', UserController.getUserProfile);
router.put('/profile/:id', UserController.updateUserProfile);
router.post('/profile/:id/image', upload.single('image'), UserController.updateUserProfileImage);
router.get('/:id', UserController.getUser);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
