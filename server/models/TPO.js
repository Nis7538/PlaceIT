const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const TPOSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User Name is required'],
        trim: true,
    },
    userEmail: {
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
    userPassword: {
        type: String,
        required: [true, 'Password is required'],
        maxLength: [15, 'Password cannot be more than 15 characters'],
        minLength: [7, 'Password cannot be less than 7 characters'],
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Hashing the user entered password before storing in the database
TPOSchema.pre('save', async function (next) {
    if (!this.isModified('userPassword')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.userPassword = await bcrypt.hash(this.userPassword, salt);
});

//
TPOSchema.methods.getSignedJWTToken = function () {
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
TPOSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.userPassword);
};

// Get the reset password token
TPOSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('TPO', TPOSchema);
