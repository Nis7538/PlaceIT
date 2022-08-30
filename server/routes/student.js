const express = require('express');
const {
    addStudent,
    login,
    getStudentToken,
    updateDetails,
    updatePassword,
    logout,
    forgotPassword,
} = require('../controllers/student');
const protect = require('../middleware/studentAuth');

const router = express.Router();

router.route('/register').post(addStudent);
router.route('/login').post(login);
router.route('/getStudentToken').get(protect, getStudentToken);
router.route('/updateDetails').patch(protect, updateDetails);
router.route('/updatePassword').put(protect, updatePassword);
router.route('/forgotPassword').post(forgotPassword);
router.route('/logout').get(protect, logout);

module.exports = router;
