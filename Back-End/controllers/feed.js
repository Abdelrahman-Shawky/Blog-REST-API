const {validationResult} = require('express-validator/check');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts => {
        res.status(200).json({message:'Fetched Successfully', posts: posts});
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.createPost = (req, res, next) => {
    console.log(req);
    const title = req.body.title;
    const content = req.body.content;
    console.log(title);

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        throw error
        // return res.status(422).json({message: 'Validation Failed', error: errors.array()});
    }

    if(!req.file){
        const error = new Error('No Image Provided');
        error.statusCode=  422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\" ,"/");


    
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl,
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
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    console.log(postId);
    Post.findById(postId)
    .then(post => {
        if (!post) {
            const error = new Error('Could not Find Post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message:'Post Fetched', post: post})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};
