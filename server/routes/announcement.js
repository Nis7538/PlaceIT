const express = require('express');
const multer = require('multer');
const {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcement');

const companyProtect = require('../middleware/companyAuth');
const upload = require('../middleware/multerAnnouncement');

const router = express.Router();

router.route('/createAnnouncement').post(
    companyProtect,
    upload.fields([
        { name: 'announcementPDF', maxCount: 1 },
        { name: 'announcementImage', maxCount: 1 },
    ]),
    createAnnouncement
);
router.route('/getAnnouncements').post(getAnnouncements);
router.route('/updateAnnouncement').patch(companyProtect, updateAnnouncement);
router.route('/deleteAnnouncement').delete(companyProtect, deleteAnnouncement);

module.exports = router;
