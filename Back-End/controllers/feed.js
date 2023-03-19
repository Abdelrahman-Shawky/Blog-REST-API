const {validationResult} = require('express-validator/check');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');


exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
    totalItems = await Post.find().countDocuments();
    const posts = await Post.find().skip((currentPage-1) * perPage).limit(perPage);
    res.status(200).json({message:'Fetched Successfully', posts: posts, totalItems: totalItems});
    } catch(err){
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = (req, res, next) => {
    // console.log(req);
    const title = req.body.title;
    const content = req.body.content;
    let creator;
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
        creator: req.userId
    });
    post
    .save()
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user => {
        creator = user;
        user.posts.push(post);
        return user.save();
    })
    .then(result => {
        res.status(201).json({
            message: "Post created successfully",
            post: post,
            creator: {_id: creator._id, name: creator.name}
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

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        throw error
        // return res.status(422).json({message: 'Validation Failed', error: errors.array()});
    }
    
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    console.log(req.body);
    if(req.file){
        imageUrl = req.file.path.replace("\\" ,"/");
    }

    if(!imageUrl){
        const error = new Error('No file picked. ')
        erorr.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
    .then(post => {
        if (!post) {
            const error = new Error('Could not Find Post');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized');
            error.statusCode = 403; // authorization issue
            throw error
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save()
    })
    .then(result => {
        res.status(200).json({message: 'Post Updated', post: result})
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    // console.log(postId);
    Post.findById(postId)
    .then(post => {
        if (!post) {
            const error = new Error('Could not Find Post');
            error.statusCode = 404;
            throw error;
        }
        // check logged in user
        if (post.creator.toString() !== req.userId){
            const error = new Error('Not Authorized');
            error.statusCode = 403; // authorization issue
            throw error
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        res.status(200).json({message: 'Deleted Post'});
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}
