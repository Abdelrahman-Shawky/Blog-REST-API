const express = require('express');
const feedController = require('../controllers/feed');
const {body} = require('express-validator/check');

const router = express.Router();


router.get('/posts', feedController.getPosts);
router.post('/post', feedController.createPost);



module.exports = router;
