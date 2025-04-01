const express = require('express');
const router = express.Router();
const { getUserDetails } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get user details - protected route
router.get('/details', auth, getUserDetails);

module.exports = router; 