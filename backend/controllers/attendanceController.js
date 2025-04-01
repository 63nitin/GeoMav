const Attendance = require('../models/Attendance');

const markAttendance = async (req, res) => {
    try {
        const { location } = req.body;
        console.log('Mark Attendance Request:', {
            userId: req.user?._id,
            location: location
        });

        // Validate user authentication
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please login to mark attendance'
            });
        }

        // Validate location data
        if (!location) {
            return res.status(400).json({ 
                error: 'Location data missing',
                message: 'Location data is required to mark attendance'
            });
        }

        if (!location.longitude || !location.latitude) {
            return res.status(400).json({ 
                error: 'Invalid location data',
                message: 'Both longitude and latitude are required'
            });
        }

        // Validate coordinates are numbers
        const longitude = parseFloat(location.longitude);
        const latitude = parseFloat(location.latitude);

        if (isNaN(longitude) || isNaN(latitude)) {
            return res.status(400).json({ 
                error: 'Invalid coordinates',
                message: 'Longitude and latitude must be valid numbers'
            });
        }

        // Create attendance record
        const attendance = new Attendance({
            userId: req.user._id,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        });

        await attendance.save();
        console.log('Attendance marked successfully for user:', req.user._id);

        res.status(201).json({ 
            message: 'Attendance marked successfully',
            attendance: {
                id: attendance._id,
                timestamp: attendance.timestamp,
                location: attendance.location
            }
        });
    } catch (err) {
        console.error('Mark Attendance Error:', err);
        res.status(500).json({ 
            error: 'Failed to mark attendance',
            message: err.message
        });
    }
};

const getAttendanceHistory = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please login to view attendance history'
            });
        }

        const attendanceHistory = await Attendance.find({ userId: req.user._id })
            .sort({ timestamp: -1 });

        res.json(attendanceHistory);
    } catch (err) {
        console.error('Error fetching attendance history:', err);
        res.status(500).json({ 
            error: 'Failed to fetch attendance history',
            message: err.message
        });
    }
};

module.exports = { markAttendance, getAttendanceHistory };