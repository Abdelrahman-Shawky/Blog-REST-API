const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// middleware
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json()) // appplication/json

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
    next();
});

app.use('/feed', feedRoutes);

const MONGODB_URI = process.env.DB_URI;
const port = process.env.PORT || 8080;

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(port);
})
.catch(err => console.log(err));


