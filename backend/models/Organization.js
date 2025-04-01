const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
organizationSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
organizationSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove any existing indexes
organizationSchema.index({ name: 1 }, { unique: false });

module.exports = mongoose.model('Organization', organizationSchema);