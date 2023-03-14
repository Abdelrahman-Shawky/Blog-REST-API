const {validationResult} = require('express-validator/check');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'First Post',
            content: 'This is the first post',
            imageUrl:'images/pizza.png',
            creator: {
                name: 'John doe'
            },
            createdAt: new Date()
        }]
    });
};

exports.createPost = (req, res, next) => {
    console.log(req);
    const title = req.body.title;
    const content = req.body.content;
    console.log(title);

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(422).json({message: 'Validation Failed', error: errors.array()});
    }
    
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: 'images/pizza.png',
        creator: {
            name: "John Doe"
        }
    });
    post.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "Post created successfully",
            post: result
        });
    })
    .catch(err => console.log(err))
};