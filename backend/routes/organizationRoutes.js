const express = require('express');
const { registerOrganization, loginOrganization, getOrganizationDetails } = require('../controllers/organizationController');
const auth = require('../middleware/auth');
const router = express.Router();

// Register an organization
router.post('/register', registerOrganization);

// Login an organization
router.post('/login', loginOrganization);

// Get organization details (protected route)
router.get('/:id', auth, getOrganizationDetails);

module.exports = router;