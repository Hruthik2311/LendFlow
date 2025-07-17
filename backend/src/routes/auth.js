const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);

// Protected routes
router.get('/profile', auth(), authController.getProfile);
router.put('/profile', auth(), authController.updateProfile);

module.exports = router;
