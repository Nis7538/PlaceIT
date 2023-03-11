const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const StudentSchema = new mongoose.Schema({
    studentID: {
        type: String,
        trim: true,
        required: [true, 'Student ID is required'],
        unique: true,
        maxLength: [20, 'Student ID cannot be more than 20 characters'],
    },
    studentPassword: {
        type: String,
        required: [true, 'Password is required'],
        maxLength: [15, 'Password cannot be more than 15 characters'],
        minLength: [7, 'Password cannot be less than 7 characters'],
        select: false,
    },
    studentName: {
        type: String,
        required: [true, 'Student Name is required'],
        trim: true,
        maxLength: [30, 'Student Name cannot be more than 30 characters'],
    },
    studentEmail: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
        ],
    },
    studentGender: {
        type: String,
        enum: ['Male', 'Female', 'Others'],
        required: [true, 'Student Gender is required'],
        trim: true,
    },
    studentContact: {
        type: String,
        required: [true, 'Student Contact is required'],
        trim: true,
        unique: true,
        minLength: [10, 'Contact cannot be less than 10 digits'],
        maxLength: [10, 'Contact cannot be more than 10 digits'],
    },
    studentBranch: {
        type: String,
        required: [true, 'Student Branch is required'],
        trim: true,
        enum: [
            'Computer',
            'Information Technology',
            'Mechanical',
            'Civil',
            'Electronics',
            'Electronics and Telecommunications',
            'Mechatronics',
        ],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Hashing the user entered password before storing in the database
StudentSchema.pre('save', async function (next) {
    if (!this.isModified('studentPassword')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.studentPassword = await bcrypt.hash(this.studentPassword, salt);
});

StudentSchema.methods.getSignedJWTToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRE,
        }
    );
};

// Match hashed password with the user entered password
StudentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.studentPassword);
};

// Get the reset password token
StudentSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('Student', StudentSchema);
