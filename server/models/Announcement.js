const mongoose = require('mongoose');

const AnnouncementSchema = mongoose.Schema({
    companyID: {
        type: String,
        required: [true, 'Company ID is required'],
        trim: true,
        maxLength: [20, 'Company ID cannot be more than 30 characters'],
    },
    announcementText: {
        type: String,
        required: [true, 'Announcement text is required'],
        trim: true,
    },
    // announcementPDF: {
    //     type: Buffer,
    //     contentType: String,
    // },
    announcementFileLink: {
        type: String,
        required: false,
        trim: true,
    },
    announcementImage: {
        type: Buffer,
        contentType: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
