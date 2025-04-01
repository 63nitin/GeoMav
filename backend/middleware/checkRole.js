const checkRole = (role) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please login to access this resource'
                });
            }

            if (req.user.role !== role) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: `Only ${role}s can access this resource`
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Error checking user role'
            });
        }
    };
};

module.exports = checkRole; 