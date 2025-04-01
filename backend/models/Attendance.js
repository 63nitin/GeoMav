const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});

// Create a geospatial index for the location field
AttendanceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Attendance', AttendanceSchema);