const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');

// middleware
app.use(express.static('public'));
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()) // appplication/json
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Header', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.listen(8080);

