const express = require('express');
const {
    createApplication,
    getAllApplications,
    applicationStatus,
} = require('../controllers/application');
const companyProtect = require('../middleware/companyAuth');
const studentProtect = require('../middleware/studentAuth');
const upload = require('../middleware/multer');

const router = express.Router();

router
    .route('/createApplication')
    .post(studentProtect, upload.single('resume'), createApplication);
router.route('/getAllApplications').get(companyProtect, getAllApplications);
router.route('/applicationStatus').patch(companyProtect, applicationStatus);

module.exports = router;
