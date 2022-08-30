const express = require('express');
const {
    getAllCompanies,
    addCompany,
    getCompanyToken,
    login,
    updateDetails,
    logout,
    forgotPassword,
    updatePassword,
    getOneCompany,
} = require('../controllers/company');
const protect = require('../middleware/companyAuth');

const router = express.Router();

router.route('/getAllCompanies').get(getAllCompanies);
router.route('/getOneCompany').post(getOneCompany);
router.route('/register').post(addCompany);
router.route('/login').post(login);
router.route('/getCompanyToken').get(protect, getCompanyToken);
router.route('/updateDetails').patch(protect, updateDetails);
router.route('/updatePassword').put(protect, updatePassword);
router.route('/forgotPassword').post(forgotPassword);
router.route('/logout').get(protect, logout);

module.exports = router;
