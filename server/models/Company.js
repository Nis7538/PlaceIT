const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const CompanySchema = new mongoose.Schema({
    companyID: {
        type: String,
        required: [true, 'Company ID is required'],
        trim: true,
        unique: true,
        maxLength: [20, 'Company ID cannot be more than 30 characters'],
    },
    companyPassword: {
        type: String,
        required: [true, 'Password is required'],
        maxLength: [15, 'Password cannot be more than 15 characters'],
        minLength: [7, 'Password cannot be less than 7 characters'],
        select: false,
    },
    companyName: {
        type: String,
        required: [true, 'Company Name is required'],
        trim: true,
        maxLength: [30, 'Company Name cannot be more than 30 characters'],
    },
    companyEmail: {
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
    companyDescription: {
        type: String,
        required: [true, 'Company Description is required'],
        maxLength: [100, 'Description cannot be more than 100 characters'],
    },
    jobTitle: {
        type: String,
        required: [true, 'Job Title is required'],
        maxLength: [20, 'Job Title cannot be more than 20 characters'],
    },
    packageOffering: {
        type: Number,
        required: [true, 'Package Offering is required'],
    },
    jobLocation: {
        type: String,
        required: [true, 'Job location is required'],
        trim: true,
    },
    jobDescription: {
        type: String,
        required: [true, 'Job Description is required'],
        trim: true,
        maxLength: [1000, 'Length can be maximum of 1000 characters'],
    },
    hiringProcess: {
        type: String,
        required: [true, 'Link to the Hiring Process is required'],
        trim: true,
    },
    hiringBranches: {
        type: [String],
        enum: [
            'Computer',
            'InformationTechnology',
            'Mechanical',
            'Mechatronics',
            'Civil',
            'Electronics',
            'Electronics and Telecommunications',
        ],
        required: [true],
    },
    lastDateToApply: {
        type: Date,
        min: Date.now(),
        required: [true, 'Last Date to Apply is required'],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Hashing the user entered password before storing in the database
CompanySchema.pre('save', async function (next) {
    if (!this.isModified('companyPassword')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.companyPassword = await bcrypt.hash(this.companyPassword, salt);
});

//
CompanySchema.methods.getSignedJWTToken = function () {
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
CompanySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.companyPassword);
};

// Get the reset password token
CompanySchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('Company', CompanySchema);
