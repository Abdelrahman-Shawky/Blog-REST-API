const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const io = require('../socket');


exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
        totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
        .populate('creator')
        .sort({createdAt: -1})
        .skip((currentPage - 1) * perPage).limit(perPage);
        res.status(200).json({ message: 'Fetched Successfully', posts: posts, totalItems: totalItems });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    // console.log(req);
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    console.log(title);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        throw error
        // return res.status(422).json({message: 'Validation Failed', error: errors.array()});
    }

    if (!req.file) {
        const error = new Error('No Image Provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\", "/");

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    try {
        await post.save();
        const user = await User.findById(req.userId);
        creator = user;
        user.posts.push(post);
        await user.save();

        // send it to all users
        io.getIO().emit('posts', {action: 'create', post: {...post._doc, creator: {_id: req.userId, name: user.name}}});

        res.status(201).json({
            message: "Post created successfully",
            post: post,
            creator: { _id: user._id, name: user.name }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    console.log(postId);
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error('Could not Find Post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Post Fetched', post: post })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        throw error
        // return res.status(422).json({message: 'Validation Failed', error: errors.array()});
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    // const imageUrl = req.file.path.replace("\\", "/");

    console.log(req.body);
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }

    if (!imageUrl) {
        const error = new Error('No file picked. ')
        erorr.statusCode = 422;
        throw error;
    }
    try {
        const post = await Post.findById(postId)
        .populate('creator');
        if (!post) {
            const error = new Error('Could not Find Post');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator._id.toString() !== req.userId) {
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
        const result = await post.save()

        io.getIO().emit('posts', {action: 'update', post: result});

        res.status(200).json({ message: 'Post Updated', post: result })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    // console.log(postId);
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error('Could not Find Post');
            error.statusCode = 404;
            throw error;
        }
        // check logged in user
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403; // authorization issue
            throw error
        }
        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        io.getIO().emit('posts', {action: 'delete', post: postId});

        res.status(200).json({ message: 'Deleted Post' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}
