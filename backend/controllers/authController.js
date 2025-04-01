const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerOrganization = async (req, res) => {
    try {
        const { name, email, password, organizationName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create organization
        const organization = new Organization({
            name: organizationName
        });
        await organization.save();

        // Create admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            organizationId: organization._id
        });
        await admin.save();

        // Generate token
        const token = jwt.sign(
            { userId: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24d' }
        );

        res.status(201).json({
            message: 'Organization registered successfully',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                organizationId: admin.organizationId
            }
        });
    } catch (err) {
        console.error('Organization Registration Error:', err);
        res.status(500).json({
            error: 'Registration failed',
            message: err.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify role
        if (user.role !== role) {
            return res.status(403).json({ 
                error: 'Access denied',
                message: `This account is registered as ${user.role}`
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            error: 'Login failed',
            message: err.message
        });
    }
};

module.exports = {
    registerOrganization,
    login
};