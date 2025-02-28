const express = require('express');
const router = express.Router();
const Post = require('../models/Feed');
const { authenticateToken } = require('./middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Get feed posts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', '_id profile.name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      author: {
        _id: post.author._id,
        name: post.author.profile.name,
        avatar: post.author.profile.avatar
      },
      content: post.content,
      image: post.image,
      likes: post.likes.length,
      comments: post.comments.length,
      createdAt: post.createdAt,
      hasLiked: post.likes.includes(req.user.id)
    }));
    
    res.status(200).json({
      success: true,
      data: formattedPosts
    });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed posts'
    });
  }
});

// Like a post
router.post('/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Toggle like status
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      // User already liked the post, remove the like
      post.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked the post, add the like
      post.likes.push(userId);
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: {
        likes: post.likes.length,
        hasLiked: post.likes.includes(userId)
      }
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post like status'
    });
  }
});

// Create a new post
router.post('/create', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }
    
    const newPost = new Post({
      author: userId,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
      likes: [],
      comments: []
    });
    
    await newPost.save();
    
    // Populate author details for response
    await newPost.populate('author', '_id profile.name profile.avatar');
    
    res.status(201).json({
      success: true,
      data: {
        _id: newPost._id,
        author: {
          _id: newPost.author._id,
          name: newPost.author.profile.name,
          avatar: newPost.author.profile.avatar
        },
        content: newPost.content,
        image: newPost.image,
        likes: 0,
        comments: 0,
        createdAt: newPost.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

// Get comments for a post
router.get('/comments/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
      .populate({
        path: 'comments.author',
        select: '_id profile.name profile.avatar'
      });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const comments = post.comments.map(comment => ({
      _id: comment._id,
      author: {
        _id: comment.author._id,
        name: comment.author.profile.name,
        avatar: comment.author.profile.avatar
      },
      content: comment.content,
      createdAt: comment.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// Add a comment to a post
router.post('/comments', authenticateToken, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;
    
    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and comment content are required'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const newComment = {
      author: userId,
      content,
      createdAt: new Date()
    };
    
    post.comments.push(newComment);
    await post.save();
    
    // Get the newly created comment with author details
    const populatedPost = await Post.findById(postId).populate({
      path: 'comments.author',
      select: '_id profile.name profile.avatar',
      match: { _id: userId }
    });
    
    const addedComment = populatedPost.comments[populatedPost.comments.length - 1];
    
    res.status(201).json({
      success: true,
      data: {
        _id: addedComment._id,
        author: {
          _id: addedComment.author._id,
          name: addedComment.author.profile.name,
          avatar: addedComment.author.profile.avatar
        },
        content: addedComment.content,
        createdAt: addedComment.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

module.exports = router; 