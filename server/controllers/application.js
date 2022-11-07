const Application = require('../models/Application');
const asyncWrapper = require('../middleware/async');
const createCustomAPIError = require('../errors/error-handler');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

//@description Create application
//@route POST /api/v1/application/createApplication
//@access student access
const createApplication = asyncWrapper(async (req, res) => {
    var obj = {
        companyID: req.body.companyID,
        studentID: req.body.studentID,
        studentName: req.body.studentName,
        studentBranch: req.body.studentBranch,
        studentContact: req.body.studentContact,
        studentEmail: req.body.studentEmail,
        averageCGPA: req.body.averageCGPA,
        keySkills: req.body.keySkills,
        studentAddress: req.body.studentAddress,
        uploadResume: {
            data: fs.readFileSync(
                path.join(
                    __dirname.split('\\').slice(0, -1).join('\\') +
                        '/resumes/' +
                        req.file.filename
                )
            ),
            contentType: 'image/png',
        },
    };
    console.log(obj);
    const application = await Application.create(obj);
    res.status(200).json({ success: true, data: application });
});

//@description Get all Applications
//@route GET /api/v1/applications/getAllApplications
//@access company access
const getAllApplications = asyncWrapper(async (req, res) => {
    const applications = await Application.find({});
    res.status(200).json({ success: true, data: applications });
});

//@description Change Application Status
//@route PATCH /api/v1/application/applicationStatus
//@access company access
const applicationStatus = asyncWrapper(async (req, res) => {
    const { applicationID, newStatus } = req.body;

    const application = await Application.findByIdAndUpdate(
        applicationID.toString(),
        { applicationStatus: newStatus },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).json({ success: true, data: application });
});

module.exports = {
    createApplication,
    getAllApplications,
    applicationStatus,
};
