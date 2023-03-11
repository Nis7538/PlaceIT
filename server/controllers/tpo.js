const TPO = require('../models/TPO');
const asyncWrapper = require('../middleware/async');
const createCustomAPIError = require('../errors/error-handler');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//@description Register a new TPO
//@route POST /api/v1/company/register
//@access public
const addTPO = asyncWrapper(async (req, res) => {
    const tpo = await TPO.create(req.body);
    sendTokenResponse(tpo, 200, res);
});

//@description TPO Login
//@route POST /api/v1/TPO/login
//@access public
const login = asyncWrapper(async (req, res, next) => {
    const { userName, userPassword } = req.body;

    // Validation
    if (!userName || !userPassword) {
        return next(
            createCustomAPIError('Please add TPO username and password', 400)
        );
    }

    // Check if TPO exists in the database
    const tpo = await TPO.findOne({ userName }).select('+userPassword');
    if (!tpo) {
        return next(
            createCustomAPIError(
                'TPO with these credentials does not exist',
                401
            )
        );
    }

    //check if password matches the hashed password in db
    const isMatch = await tpo.matchPassword(userPassword);
    if (!isMatch) {
        return next(createCustomAPIError('Incorrect Password', 401));
    }
    sendTokenResponse(tpo, 200, res); //the company has successfully logged in correct credentials!
});

//@description Logout a TPO
//@route POST /api/v1/TPO/logout
//@access private
const logout = asyncWrapper(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, data: {} });
});

//@description Update Password
//@route PUT /api/v1/company/updatePassword
//@access private
const updatePassword = asyncWrapper(async (req, res, next) => {
    const tpo = await TPO.findById(req.tpo._id.toString()).select(
        '+userPassword'
    );

    // Check if both current and new passwords are sent
    if (!req.body.currentUserPassword || !req.body.newUserPassword) {
        return next(createCustomAPIError('Incomplete details', 401));
    }

    // Check current Password
    if (!(await tpo.matchPassword(req.body.currentUserPassword))) {
        return next(createCustomAPIError('Password is incorrect', 401));
    }

    tpo.userPassword = req.body.newUserPassword;
    tpo.save();

    sendTokenResponse(tpo, 200, res);
});

//@description Forgot Password
//@route POST /api/v1/tpo/forgotPassword
//@access public
const forgotPassword = asyncWrapper(async (req, res, next) => {
    const tpo = await TPO.findOne({
        userEmail: req.body.userEmail,
    });
    if (!tpo) {
        return next(
            createCustomAPIError('There is no TPO with that email', 404)
        );
    }

    // Get reset token
    const resetToken = tpo.getResetPasswordToken();

    await tpo
        .save({ validateBeforeSave: false })
        .then(tpo => {
            let link =
                'http://' +
                req.headers.host +
                '/api/v1/tpo/auth/reset/' +
                resetToken;
            const mailOptions = {
                to: tpo.userEmail,
                from: process.env.FROM_EMAIL,
                subject: 'Password change request',
                text: `Hi ${tpo.userName} \n 
        Please click on the following link ${link} to reset your password. \n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };

            sgMail.send(mailOptions, (error, result) => {
                if (error)
                    return res.status(500).json({ message: error.message });

                res.status(200).json({
                    message:
                        'A reset email has been sent to ' + tpo.userEmail + '.',
                });
            });
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

// Get token from model, create a cookie and send response
const sendTokenResponse = (tpo, statusCode, res) => {
    // Create a token
    const token = tpo.getSignedJWTToken();
    const expireTime = new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    );

    const options = {
        expires: expireTime,
        httpOnly: true,
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
    });
};

module.exports = {
    addTPO,
    login,
    logout,
    updatePassword,
    forgotPassword,
};
