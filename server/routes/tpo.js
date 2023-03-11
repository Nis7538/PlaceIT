const express = require('express');
const {
    login,
    logout,
    updatePassword,
    forgotPassword,
    addTPO,
} = require('../controllers/tpo');
const protect = require('../middleware/tpoAuth');

const router = express.Router();

router.route('/register').post(addTPO);
router.route('/login').post(login);
router.route('/logout').get(protect, logout);
router.route('/updatePassword').put(protect, updatePassword);
router.route('/forgotPassword').post(forgotPassword);

module.exports = router;
