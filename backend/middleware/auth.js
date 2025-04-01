const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Check if the Authorization header exists
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: 'Please authenticate. No token provided.' });
        }

        // Extract the token
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Please authenticate. Invalid token format.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(401).json({ error: 'Please authenticate. User not found.' });
        }

        // Attach the user and token to the request object
        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication Error:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Please authenticate. Invalid token.' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Please authenticate. Token expired.' });
        }
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

module.exports = auth;