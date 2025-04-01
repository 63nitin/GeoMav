const Organization = require('../models/Organization');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new organization
const registerOrganization = async (req, res) => {
    try {
        const { name, email, password, organizationName } = req.body;
        console.log('Registration request:', { name, email, organizationName });

        // Check if organization with this email already exists
        const existingOrg = await Organization.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ 
                error: 'Registration failed', 
                details: 'Organization with this email already exists' 
            });
        }

        // Create new organization
        const organization = new Organization({
            name: organizationName || name,
            email,
            password
        });

        await organization.save();
        console.log('Organization saved successfully:', organization._id);

        // Create admin user for the organization
        const adminUser = new User({
            name,
            email,
            password,
            role: 'admin',
            organizationId: organization._id
        });

        await adminUser.save();
        console.log('Admin user created successfully:', adminUser._id);

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: adminUser._id,
                role: 'admin',
                organizationId: organization._id
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'Organization registered successfully', 
            token,
            user: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                organizationId: adminUser.organizationId
            }
        });
    } catch (err) {
        console.error('Organization registration error:', err);
        res.status(400).json({ 
            error: 'Registration failed', 
            details: err.message 
        });
    }
};

// Login an organization
const loginOrganization = async (req, res) => {
    const { email, password } = req.body;

    try {
        const organization = await Organization.findOne({ email });
        if (!organization) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const isMatch = await organization.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: organization._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.send({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).send({ error: 'Server error', details: err.message });
    }
};

// Get organization details
const getOrganizationDetails = async (req, res) => {
    try {
        const organizationId = req.params.id;
        console.log('Fetching organization details for ID:', organizationId);

        // Find the organization
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Get the admin user for this organization
        const adminUser = await User.findOne({ 
            organizationId: organizationId,
            role: 'admin'
        });

        // Create response object
        const response = {
            _id: organization._id,
            name: organization.name,
            email: organization.email,
            adminName: adminUser ? adminUser.name : null,
            createdAt: organization.createdAt
        };

        res.json(response);
    } catch (error) {
        console.error('Get organization details error:', error);
        res.status(500).json({ error: 'Failed to fetch organization details' });
    }
};

module.exports = {
    registerOrganization,
    loginOrganization,
    getOrganizationDetails
};