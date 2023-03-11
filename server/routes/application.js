const express = require('express');
const {
    createApplication,
    getAllApplications,
    tpoStatus,
    companyStatus,
    generateCSV,
} = require('../controllers/application');
const companyProtect = require('../middleware/companyAuth');
const studentProtect = require('../middleware/studentAuth');
const tpoProtect = require('../middleware/tpoAuth');
const mergedProtect = require('../middleware/mergedAuth');
const upload = require('../middleware/multerResume');

const router = express.Router();

router
    .route('/createApplication')
    .post(studentProtect, upload.single('resume'), createApplication);
router.route('/getAllApplications').get(mergedProtect, getAllApplications);
router.route('/tpoStatus').patch(tpoProtect, tpoStatus);
router.route('/applicationStatus').patch(companyProtect, companyStatus);
router.route('/generateCSV').get(mergedProtect, generateCSV);

module.exports = router;
