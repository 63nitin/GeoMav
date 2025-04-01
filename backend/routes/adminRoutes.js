// adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
    registerEmployee, 
    getOrganizationEmployees, 
    getEmployeeAttendance 
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Apply auth middleware to all admin routes
router.use(auth);
router.use(checkRole('admin'));

// Register new employee
router.post('/register-employee', async (req, res, next) => {
    try {
        await registerEmployee(req, res);
    } catch (error) {
        next(error);
    }
});

// Get all employees in the organization
router.get('/employees', async (req, res, next) => {
    try {
        await getOrganizationEmployees(req, res);
    } catch (error) {
        next(error);
    }
});

// Get attendance history for a specific employee
router.get('/employee-attendance/:employeeId', async (req, res, next) => {
    try {
        await getEmployeeAttendance(req, res);
    } catch (error) {
        next(error);
    }
});

module.exports = router;