const User = require('../models/User');
const Attendance = require('../models/Attendance');

const registerEmployee = async (req, res) => {
    try {
        const { name, email, password, biometricEnabled } = req.body;
        const adminId = req.user._id;

        // Get admin user to get organization ID
        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            return res.status(404).json({ error: 'Admin user not found' });
        }

        if (!adminUser.organizationId) {
            return res.status(400).json({ error: 'Admin user has no organization assigned' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const employee = new User({
            name,
            email,
            password,
            role: 'employee',
            organizationId: adminUser.organizationId,
            biometricEnabled: biometricEnabled || false,
        });

        await employee.save();

        // Create response without password
        const userResponse = {
            id: employee._id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            organizationId: employee.organizationId,
            biometricEnabled: employee.biometricEnabled
        };

        res.status(201).json({ 
            message: 'Employee registered successfully',
            user: userResponse
        });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation Error',
                details: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ 
            error: 'Registration failed',
            message: err.message 
        });
    }
};

const getOrganizationEmployees = async (req, res) => {
    try {
        // Get the admin's organization ID
        const admin = await User.findById(req.user._id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only administrators can access this endpoint'
            });
        }

        // Find all employees in the organization
        const employees = await User.find({
            organizationId: admin.organizationId,
            role: 'employee'
        }).select('-password');

        res.json({ employees });
    } catch (err) {
        console.error('Get Organization Employees Error:', err);
        res.status(500).json({
            error: 'Failed to fetch employees',
            message: err.message
        });
    }
};

const getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Get the admin's organization ID
        const admin = await User.findById(req.user._id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Only administrators can access this endpoint'
            });
        }

        // Verify the employee belongs to the admin's organization
        const employee = await User.findOne({
            _id: employeeId,
            organizationId: admin.organizationId
        });

        if (!employee) {
            return res.status(404).json({
                error: 'Employee not found',
                message: 'Employee does not belong to your organization'
            });
        }

        // Get attendance records for the employee
        const attendance = await Attendance.find({ userId: employeeId })
            .sort({ timestamp: -1 });

        res.json({ attendance });
    } catch (err) {
        console.error('Get Employee Attendance Error:', err);
        res.status(500).json({
            error: 'Failed to fetch attendance',
            message: err.message
        });
    }
};

module.exports = {
    registerEmployee,
    getOrganizationEmployees,
    getEmployeeAttendance
};