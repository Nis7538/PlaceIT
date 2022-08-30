const express = require('express');
const connectDB = require('./db/connect');
const cookieParser = require('cookie-parser');

const company = require('./routes/company');
const student = require('./routes/student');

const colors = require('colors');
require('dotenv').config();

const notFound = require('./middleware/not-found');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/company', company);
app.use('/api/v1/student', student);

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
