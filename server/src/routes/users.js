const express = require('express');
const { body } = require('express-validator');
const { updateProfile, changePassword, getStorageInfo } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.patch(
  '/profile',
  [body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 })],
  updateProfile
);

router.patch(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  changePassword
);

router.get('/storage', getStorageInfo);

module.exports = router;
