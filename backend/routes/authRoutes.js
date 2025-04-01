// authRoutes.js
const express = require('express');
const router = express.Router();
const { login, registerOrganization } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/register-organization', registerOrganization);

module.exports = router;