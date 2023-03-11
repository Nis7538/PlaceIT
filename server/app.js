const express = require('express');
const connectDB = require('./db/connect');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const company = require('./routes/company');
const student = require('./routes/student');
const application = require('./routes/application');
const tpo = require('./routes/tpo');
const announcement = require('./routes/announcement');

const colors = require('colors');
require('dotenv').config();

const notFound = require('./middleware/not-found');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/company', company);
app.use('/api/v1/student', student);
app.use('/api/v1/application', application);
app.use('/api/v1/tpo', tpo);
app.use('/api/v1/announcement', announcement);

app.use(notFound);

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(
            port,
            console.log(`Server is listening on ${port}`.green.bold)
        );
    } catch (error) {
        console.log(error);
    }
};

const port = process.env.PORT || 3000;

start();
