const mongoose = require('mongoose');
require('dotenv').config();

const ApplicationSchema = new mongoose.Schema({
    companyID: {
        type: String,
        required: [true, 'Company ID is required'],
        trim: true,
        maxLength: [20, 'Company ID cannot be more than 20 characters'],
    },
    studentID: {
        type: String,
        required: [true, 'Student ID is required'],
        trim: true,
        maxLength: [20, 'Student ID cannot be more than 20 characters'],
    },
    studentName: {
        type: String,
        required: [true, 'Student Name is required'],
        trim: true,
        maxLength: [30, 'Student Name cannot be more than 30 characters'],
    },
    studentContact: {
        type: String,
        required: [true, 'Student Contact is required'],
        trim: true,
        minLength: [10, 'Contact cannot be less than 10 digits'],
        maxLength: [10, 'Contact cannot be more than 10 digits'],
    },
    studentEmail: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
        ],
    },
    averageCGPA: {
        type: Number,
        required: [true, 'CGPA is required'],
        trim: true,
        min: [0, 'CGPA cannot be less than 0'],
        max: [10, 'CGPA cannot be more than 10'],
    },
    keySkills: {
        type: String,
        required: [true, 'Key Skills are required'],
        trim: true,
        minLength: [1, 'Key Skills cannot be less than 1 character'],
    },
    studentAddress: {
        type: String,
        required: [true, 'Student Address is required'],
        trim: true,
        maxLength: [100, 'Student Address cannot be more than 100 characters'],
        minLength: [5, 'Student Address cannot be less than 5 characters'],
    },
    studentBranch: {
        type: String,
        required: [true, 'Student Branch is required'],
        trim: true,
    },
    tpoStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
    },
    companyStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
    },
    uploadResume: {
        data: Buffer,
        contentType: String,
        // required: [true, 'Resume is required'],
    },
});

module.exports = mongoose.model('Application', ApplicationSchema);
