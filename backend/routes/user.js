const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const { upload } = require('../services/uploadService');

const router = express.Router();

router.use(verifyToken);

router.get('/me', userController.getProfile);

router.put('/me', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('age').optional().isInt({ min: 13 }).withMessage('Age must be at least 13')
], userController.updateProfile);

router.put('/password', [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], userController.changePassword);

router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
