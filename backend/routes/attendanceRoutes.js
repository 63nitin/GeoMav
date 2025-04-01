const express = require('express');
const { markAttendance, getAttendanceHistory } = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const router = express.Router();

// Mark attendance (protected route)
router.post('/mark-attendance', auth, markAttendance);
router.get('/attendance-history', auth, getAttendanceHistory);

module.exports = router;