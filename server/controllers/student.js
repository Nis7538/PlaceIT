const Student = require('../models/Student');
const asyncWrapper = require('../middleware/async');
const createCustomAPIError = require('../errors/error-handler');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//@description Register a new student
//@route POST /api/v1/student/register
//@access public
const addStudent = asyncWrapper(async (req, res, next) => {
    const student = await Student.create(req.body);
    sendTokenResponse(student, 200, res);
});

//@description Login a Student
//@route POST /api/v1/student/login
//@access public
const login = asyncWrapper(async (req, res, next) => {
    const { studentID, studentPassword } = req.body;

    //Validation
    if (!studentID || !studentPassword) {
        return next(
            createCustomAPIError('Please add student ID and Password'),
            400
        );
    }

    // Check if student exists in the database
    const student = await Student.findOne({ studentID }).select(
        '+studentPassword'
    );
    if (!student) {
        return next(
            createCustomAPIError(
                'Student with these credentials does not exist',
                401
            )
        );
    }

    // Check if password matches the hashes password in DB
    const isMatch = await student.matchPassword(studentPassword);
    if (!isMatch) {
        return next(createCustomAPIError('Incorrect Password', 401));
    }

    sendTokenResponse(student, 200, res);
});

//@description Logout a student
//@route POST /api/v1/student/logout
//@access private
const logout = asyncWrapper(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, data: {} });
});

//@description Get current logged in student token
//@route GET /api/v1/student/getStudentToken
//@access private
const getStudentToken = asyncWrapper(async (req, res, next) => {
    // const company = await Company.findById(req.company._id.toString());
    const token = req.cookies.token;
    res.status(200).json({ success: true, data: req.student, token });
});

//@description Update currently logged in student's details
//@route PATCH /api/v1/student/updateDetails
//@access private
const updateDetails = asyncWrapper(async (req, res, next) => {
    let fieldsToUpdate = {};
    const {
        studentID,
        studentName,
        studentEmail,
        studentContact,
        studentBranch,
    } = req.body;

    if (studentID) {
        fieldsToUpdate = { ...fieldsToUpdate, studentID };
    }

    if (studentName) {
        fieldsToUpdate = { ...fieldsToUpdate, studentName };
    }

    if (studentEmail) {
        fieldsToUpdate = { ...fieldsToUpdate, studentEmail };
    }

    if (studentContact) {
        fieldsToUpdate = { ...fieldsToUpdate, studentContact };
    }

    if (studentBranch) {
        fieldsToUpdate = { ...fieldsToUpdate, studentBranch };
    }

    const student = await Student.findByIdAndUpdate(
        req.student._id.toString(),
        fieldsToUpdate,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({ success: true, data: student });
});

//@description Forgot Password
//@route POST /api/v1/student/forgotPassword
//@access public
const forgotPassword = asyncWrapper(async (req, res, next) => {
    const student = await Student.findOne({
        studentEmail: req.body.studentEmail,
    });
    if (!student) {
        return next(
            createCustomAPIError('There is no student with that email', 404)
        );
    }

    // Get reset token
    const resetToken = student.getResetPasswordToken();

    await student
        .save({ validateBeforeSave: false })
        .then(student => {
            let link =
                'http://' +
                req.headers.host +
                '/api/v1/student/auth/reset/' +
                resetToken;
            const mailOptions = {
                to: student.studentEmail,
                from: process.env.FROM_EMAIL,
                subject: 'Password change request',
                text: `Hi ${student.studentName} \n 
        Please click on the following link ${link} to reset your password. \n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };

            sgMail.send(mailOptions, (error, result) => {
                if (error)
                    return res.status(500).json({ message: error.message });

                res.status(200).json({
                    message:
                        'A reset email has been sent to ' +
                        student.studentEmail +
                        '.',
                });
            });
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

//@description Update Password
//@route PUT /api/v1/student/updatePassword
//@access private
const updatePassword = asyncWrapper(async (req, res, next) => {
    const student = await Student.findById(req.student._id.toString()).select(
        '+studentPassword'
    );

    // Check if both current and new passwords are sent
    if (!req.body.currentStudentPassword || !req.body.newStudentPassword) {
        return next(createCustomAPIError('Incomplete details', 401));
    }

    // Check current Password
    if (!(await student.matchPassword(req.body.currentStudentPassword))) {
        return next(createCustomAPIError('Password is incorrect', 401));
    }

    student.studentPassword = req.body.newStudentPassword;
    student.save();

    sendTokenResponse(student, 200, res);
});

// Get token from model, create a cookie and send response
const sendTokenResponse = (student, statusCode, res) => {
    // Create a token
    const token = student.getSignedJWTToken();
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
    addStudent,
    login,
    logout,
    getStudentToken,
    updateDetails,
    forgotPassword,
    updatePassword,
};
