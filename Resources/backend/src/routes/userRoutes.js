const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { userRegistrationValidation, userUpdateValidation, validate } = require('../utils/validators');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userRegistrationValidation, validate, UserController.register);
router.post('/login', UserController.login);

// Protected routes (no JWT, just placeholder)
router.put('/update', authenticateToken, userUpdateValidation, validate, UserController.updateProfile);
router.get('/history', UserController.getTransactionHistory);
router.get('/total-spent', UserController.getTotalSpent);
router.get('/:email', UserController.getUserByEmail);

module.exports = router;