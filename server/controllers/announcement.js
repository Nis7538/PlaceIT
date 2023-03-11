const Announcment = require('../models/Announcement');
const asyncWrapper = require('../middleware/async');
const createCustomAPIError = require('../errors/error-handler');
const Announcement = require('../models/Announcement');
require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlinkSync);
const path = require('path');

//@description Create an Announcement
//@route POST /api/v1/announcement/createAnnouncement
//@access company access
const createAnnouncement = asyncWrapper(async (req, res) => {
    var obj = {
        companyID: req.company.companyID,
        announcementText: req.body.announcementText,
        announcementFileLink: req.body.announcementFileLink,
    };
    // if (req.files.announcementPDF) {
    //     excelToPDF(req.files.announcementPDF[0].filename);
    //     obj = {
    //         ...obj,
    //         announcementPDF: {
    //             data: fs.readFileSync(
    //                 path.join(
    //                     __dirname.split('\\').slice(0, -1).join('\\') +
    //                         '/announcements/' +
    //                         req.files.announcementPDF[0].filename +
    //                         '- Converted.pdf'
    //                 )
    //             ),
    //             contentType: 'announcement/pdf',
    //         },
    //     };
    // }
    if (req.files.announcementImage) {
        obj = {
            ...obj,
            announcementImage: {
                data: fs.readFileSync(
                    path.join(
                        __dirname.split('\\').slice(0, -1).join('\\') +
                            '/announcements/' +
                            req.files.announcementImage[0].filename
                    )
                ),
                contentType: 'announcement/jpeg',
            },
        };
    }
    const announcement = await Announcement.create(obj);
    // Delete the file like normal
    // await unlinkAsync(req.file.path);
    res.status(200).json({ success: true, data: announcement });
});

//@description Get Announcements
//@route POST /api/v1/announcement/getAnnouncements
//@acccess student access
const getAnnouncements = asyncWrapper(async (req, res) => {
    const announcements = await Announcement.find({
        companyID: req.body.companyID,
    }).sort('createdAt');
    res.status(200).json({ success: true, data: announcements });
});

//@description Update Announcements
//@route PATCH /api/v1/announcement/updateAnnouncement
//@access company access
const updateAnnouncement = asyncWrapper(async (req, res) => {
    const { updatedAnnouncement, _id } = req.body;
    const announcement = await Announcement.findOneAndUpdate(
        _id,
        { announcementText: updatedAnnouncement },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({ success: true, data: announcement });
});

//@description Delete an Announcement
//@route DELETE /api/v1/announcement/deleteAnnouncement
//@access company access
const deleteAnnouncement = asyncWrapper(async (req, res) => {
    const { _id } = req.body;
    const announcement = await Announcement.findByIdAndDelete(_id);
    res.status(200).json({ success: true, data: announcement });
});

const excelToPDF = filename => {
    const { PdfSaveOptions, Workbook, PdfCompliance } = require('aspose.cells');

    const path =
        __dirname.split('\\').slice(0, -1).join('\\') + '/announcements/';
    // load a workbook
    var workbook = Workbook(path + filename);

    // create and set PDF options
    pdfOptions = PdfSaveOptions();
    pdfOptions.setCompliance(PdfCompliance.PDF_A_1_B);

    // convert Excel to PDF
    workbook.save(path + filename + '- Converted.pdf', pdfOptions);
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
};
