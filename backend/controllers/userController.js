const User = require('../models/User');

const getUserDetails = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please login to get user details'
            });
        }

        // Find user by ID but exclude password
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User details not found'
            });
        }

        res.json(user);
    } catch (err) {
        console.error('Get User Details Error:', err);
        res.status(500).json({
            error: 'Failed to get user details',
            message: err.message
        });
    }
};

module.exports = { getUserDetails }; 