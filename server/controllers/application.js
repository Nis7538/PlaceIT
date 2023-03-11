const Application = require('../models/Application');
const asyncWrapper = require('../middleware/async');
const createCustomAPIError = require('../errors/error-handler');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const { promisify } = require('util');
const Json2csvParser = require('json2csv').Parser;

const unlinkAsync = promisify(fs.unlink);

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
            contentType: 'resume/pdf',
        },
    };
    console.log(obj);
    const application = await Application.create(obj);
    await fs.unlink(
        path.join(
            __dirname.split('\\').slice(0, -1).join('\\') +
                '/resumes/' +
                req.file.filename
        ),
        err => {
            if (err) throw err;
        }
    );
    res.status(200).json({ success: true, data: application });
});

//@description Get all Applications
//@route GET /api/v1/applications/getAllApplications
//@access company access
const getAllApplications = asyncWrapper(async (req, res) => {
    const { sort } = req.query;
    let fields = {};
    const { tpoStatus, companyStatus } = req.body;
    if (tpoStatus) {
        fields = { ...fields, tpoStatus };
    }
    if (companyStatus) {
        fields = { ...fields, companyStatus };
    }
    let result = Application.find(fields);

    // sort
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    }

    const applications = await result;
    res.status(200).json({ success: true, data: applications });
});

//@description Change TPO Status
//@route PATCH /api/v1/application/applicationStatus
//@access company access
const tpoStatus = asyncWrapper(async (req, res) => {
    const { applicationID, newTPOStatus } = req.body;

    const application = await Application.findByIdAndUpdate(
        applicationID.toString(),
        { tpoStatus: newTPOStatus },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).json({ success: true, data: application });
});

//@description Change Company Status
//@route PATCH /api/v1/application/applicationStatus
//@access company access
const companyStatus = asyncWrapper(async (req, res) => {
    const { applicationID, newCompanyStatus } = req.body;

    const application = await Application.findByIdAndUpdate(
        applicationID.toString(),
        { tpoStatus: newCompanyStatus },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).json({ success: true, data: application });
});

//@description Generate CSV Data of applications
//@route GET /api/v1/application/generateCSV
//@access TPO and company access
const generateCSV = asyncWrapper(async (req, res, next) => {
    if (req.company) {
        var { companyID } = req.company;
        var applications = await Application.find({
            companyStatus: 'Accepted',
            tpoStatus: 'Accepted',
            companyID: companyID,
        }).select(['-uploadResume', '-_id', '-__v']);
    } else if (req.tpo) {
        var { companyID } = req.query;
        var applications = await Application.find({
            tpoStatus: 'Accepted',
            companyID: companyID,
        }).select(['-uploadResume', '-_id', '-__v']);
    }
    const json2csvParser = new Json2csvParser({ header: true });
    const csvData = json2csvParser.parse(
        JSON.parse(JSON.stringify(applications))
    );

    const filename = companyID + '-' + Date.now() + '.csv';
    fs.writeFile('./applications/' + filename, csvData, function (error) {
        if (error) throw error;
        console.log('Ho gaya bhai ho gaya');
    });
    res.download(
        path.join(
            __dirname.split('\\').slice(0, -1).join('\\') +
                '/applications/' +
                filename
        )
    );
});

module.exports = {
    createApplication,
    getAllApplications,
    tpoStatus,
    companyStatus,
    generateCSV,
};
