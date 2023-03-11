const Company = require('../models/Company');
const asyncWrapper = require('../middleware/async');
const createCustomAPIError = require('../errors/error-handler');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//@description Get all companies
//@route GET /api/v1/company/getAllCompanies
//@access public
const getAllCompanies = asyncWrapper(async (req, res) => {
    const { sort } = req.query;
    let sortList;

    // Sort
    if (sort) {
        sortList = sort.split(',').join(' ');
    }
    const companies = await Company.find({}).sort(sortList);
    res.status(200).json({ success: true, data: companies });
});

//@description Get Single Company
//@route POST /api/v1/company/getOneCompany
//@access public
const getOneCompany = asyncWrapper(async (req, res, next) => {
    const company = await Company.findOne(req.body);
    if (company === null) {
        return next(
            createCustomAPIError(
                'Company with this company name does not exist',
                401
            )
        );
    }
    res.status(200).json({ success: true, data: company });
});

//@description Register a new company
//@route POST /api/v1/company/register
//@access public
const addCompany = asyncWrapper(async (req, res) => {
    const company = await Company.create(req.body);
    sendTokenResponse(company, 200, res);
});

//@description Login a company
//@route POST /api/v1/company/login
//@access public
const login = asyncWrapper(async (req, res, next) => {
    const { companyID, companyPassword } = req.body;

    // Validation
    if (!companyID || !companyPassword) {
        return next(
            createCustomAPIError('Please add company ID and Password', 400)
        );
    }

    // Check if company exists in the database
    const company = await Company.findOne({ companyID }).select(
        '+companyPassword'
    );
    if (!company) {
        return next(
            createCustomAPIError(
                'Company with these credentials does not exist',
                401
            )
        );
    }

    // Check if password matches the hashes password in DB
    const isMatch = await company.matchPassword(companyPassword);
    if (!isMatch) {
        return next(createCustomAPIError('Incorrect Password', 401));
    }

    sendTokenResponse(company, 200, res);
});

//@description Logout a company
//@route POST /api/v1/company/logout
//@access private
const logout = asyncWrapper(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, data: {} });
});

//@description Get current logged in company token
//@route GET /api/v1/company/getCompanyToken
//@access private
const getCompanyToken = asyncWrapper(async (req, res, next) => {
    // const company = await Company.findById(req.company._id.toString());
    const token = req.cookies.token;
    res.status(200).json({ success: true, data: req.company, token });
});

//@description Update currently logged in company's details
//@route PATCH /api/v1/company/updateDetails
//@access private
const updateDetails = asyncWrapper(async (req, res, next) => {
    let fieldsToUpdate = {};
    const {
        companyID,
        companyName,
        companyEmail,
        companyDescription,
        jobTitle,
        packageOffering,
        jobLocation,
        hiringBranches,
    } = req.body;

    if (companyID) {
        fieldsToUpdate = { ...fieldsToUpdate, companyID };
    }

    if (companyName) {
        fieldsToUpdate = { ...fieldsToUpdate, companyName };
    }

    if (companyEmail) {
        fieldsToUpdate = { ...fieldsToUpdate, companyEmail };
    }

    if (companyDescription) {
        fieldsToUpdate = { ...fieldsToUpdate, companyDescription };
    }

    if (jobTitle) {
        fieldsToUpdate = { ...fieldsToUpdate, jobTitle };
    }

    if (packageOffering) {
        fieldsToUpdate = { ...fieldsToUpdate, packageOffering };
    }

    if (jobLocation) {
        fieldsToUpdate = { ...fieldsToUpdate, jobLocation };
    }

    if (hiringBranches) {
        fieldsToUpdate = { ...fieldsToUpdate, hiringBranches };
    }

    const company = await Company.findByIdAndUpdate(
        req.company._id.toString(),
        fieldsToUpdate,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({ success: true, data: company });
});

//@description Update Password
//@route PUT /api/v1/company/updatePassword
//@access private
const updatePassword = asyncWrapper(async (req, res, next) => {
    const company = await Company.findById(req.company._id.toString()).select(
        '+companyPassword'
    );

    // Check if both current and new passwords are sent
    if (!req.body.currentCompanyPassword || !req.body.newCompanyPassword) {
        return next(createCustomAPIError('Incomplete details', 401));
    }

    // Check current Password
    if (!(await company.matchPassword(req.body.currentCompanyPassword))) {
        return next(createCustomAPIError('Password is incorrect', 401));
    }

    company.companyPassword = req.body.newCompanyPassword;
    company.save();

    sendTokenResponse(company, 200, res);
});

//@description Forgot Password
//@route POST /api/v1/company/forgotPassword
//@access public
const forgotPassword = asyncWrapper(async (req, res, next) => {
    const company = await Company.findOne({
        companyEmail: req.body.companyEmail,
    });
    if (!company) {
        return next(
            createCustomAPIError('There is no company with that email', 404)
        );
    }

    // Get reset token
    const resetToken = company.getResetPasswordToken();

    await company
        .save({ validateBeforeSave: false })
        .then(company => {
            let link =
                'http://' +
                req.headers.host +
                '/api/v1/company/auth/reset/' +
                resetToken;
            const mailOptions = {
                to: company.companyEmail,
                from: process.env.FROM_EMAIL,
                subject: 'Password change request',
                text: `Hi ${company.companyName} \n 
        Please click on the following link ${link} to reset your password. \n\n 
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };

            sgMail.send(mailOptions, (error, result) => {
                if (error)
                    return res.status(500).json({ message: error.message });

                res.status(200).json({
                    message:
                        'A reset email has been sent to ' +
                        company.companyEmail +
                        '.',
                });
            });
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

// Get token from model, create a cookie and send response
const sendTokenResponse = (company, statusCode, res) => {
    // Create a token
    const token = company.getSignedJWTToken();
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
    getAllCompanies,
    getOneCompany,
    addCompany,
    login,
    logout,
    getCompanyToken,
    updateDetails,
    updatePassword,
    forgotPassword,
};
