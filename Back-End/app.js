const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// middleware
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
    // res.setHeader('Access-Control-Allow-Headers', "Content-Type, Authorization");
    next();
});
app.use(express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json()) // appplication/json

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
    file.mimetype === 'image/jgg' ||
    file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else {
        cb(null, false);
    }
};
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));



app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({message: message, data:data});
})

const MONGODB_URI = process.env.DB_URI;
const port = process.env.PORT || 8080;

mongoose.connect(MONGODB_URI)
.then(result => {
    const server = app.listen(port);
    const io = require('./socket').init(server); //
    io.on('connection', socket => {
        // for every new client that connects
        console.log('Client connected');
    });
})
.catch(err => console.log(err));


