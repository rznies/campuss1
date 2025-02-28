const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { requireUser } = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValidType = allowedTypes.test(file.mimetype) && 
                       allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF allowed.'));
    }
  }
});

// Rate limiters
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 posts per hour
  message: { success: false, message: 'Too many posts created' }
});

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 comments per 15 minutes
  message: { success: false, message: 'Too many comments posted' }
});

/**
 * @route GET /api/posts
 * @desc Get feed posts with pagination and filters
 */
router.get('/', requireUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, course, visibility } = req.query;
    
    const query = {};
    if (course) query.course = course;
    if (visibility) query.visibility = visibility;

    const posts = await Post.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name avatar course')
      .populate('comments.author', 'name avatar')
      .lean();

    const total = await Post.countDocuments(query);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: {
        id: post.author._id,
        name: post.author.name,
        avatar: post.author.avatar,
        course: post.author.course
      },
      content: post.content,
      media: post.media,
      likes: post.likes.length,
      hasLiked: post.likes.includes(req.user.sub),
      comments: post.comments.slice(0, 3), // Only return latest 3 comments
      commentCount: post.comments.length,
      tags: post.tags,
      visibility: post.visibility,
      course: post.course,
      createdAt: post.createdAt
    }));

    res.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
});

/**
 * @route POST /api/posts
 * @desc Create a new post
 */
router.post('/', requireUser, postLimiter, upload.single('media'), async (req, res) => {
  try {
    const { content, visibility = 'public', course, tags } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    if (visibility === 'course' && !course) {
      return res.status(400).json({
        success: false,
        message: 'Course is required for course-specific posts'
      });
    }

    const post = await Post.create({
      author: req.user.sub,
      content: content.trim(),
      media: req.file ? `/uploads/posts/${req.file.filename}` : undefined,
      visibility,
      course,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      createdAt: new Date()
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar course')
      .lean();

    res.status(201).json({
      success: true,
      data: {
        id: populatedPost._id,
        author: {
          id: populatedPost.author._id,
          name: populatedPost.author.name,
          avatar: populatedPost.author.avatar,
          course: populatedPost.author.course
        },
        content: populatedPost.content,
        media: populatedPost.media,
        likes: 0,
        comments: [],
        tags: populatedPost.tags,
        visibility: populatedPost.visibility,
        course: populatedPost.course,
        createdAt: populatedPost.createdAt
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

/**
 * @route POST /api/posts/:postId/like
 * @desc Toggle like on a post
 */
router.post('/:postId/like', requireUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userLiked = post.likes.includes(req.user.sub);
    
    if (userLiked) {
      post.likes = post.likes.filter(id => !id.equals(req.user.sub));
    } else {
      post.likes.push(req.user.sub);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likes: post.likes.length,
        hasLiked: !userLiked
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
});

/**
 * @route POST /api/posts/:postId/comments
 * @desc Add a comment to a post
 */
router.post('/:postId/comments', requireUser, commentLimiter, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      author: req.user.sub,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const populatedComment = await Post.findById(post._id)
      .populate('comments.author', 'name avatar')
      .then(p => p.comments[p.comments.length - 1]);

    res.status(201).json({
      success: true,
      data: {
        id: populatedComment._id,
        author: {
          id: populatedComment.author._id,
          name: populatedComment.author.name,
          avatar: populatedComment.author.avatar
        },
        content: populatedComment.content,
        createdAt: populatedComment.createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

module.exports = router; 