const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

// Configure multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', 
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Add Post
exports.addPost = [
  upload.single('image'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const posts = new Post({
      title: req.body.title,
      description: req.body.description,
      image: req.file ? req.file.path : null,
      userId: req.user._id,
      userName: req.user.name,
    });
    try {
      await posts.save();
      res.status(201).json(posts);
    } catch (e) {
      console.error('Error adding post:', e);
      res.status(400).json({ error: 'Please fill all fields' });
    }
  }
];

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get Post for edit form
exports.getPostForEdit = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
}

// Get all post by ID for specific user
exports.getPostById = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Post
exports.updatePost = [
  upload.single('image'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {
      title: req.body.title,
      description: req.body.description,
    };

    if (req.file) {
      updates.image = req.file.path;
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      post.set(updates); 
      await post.save();
      res.status(200).json(post); 
    } catch (e) {
      console.error('Error updating post:', e);
      res.status(400).json({ error: 'Error updating post' });
    }
  }
];

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const publicId = post.image.split('/').pop().split('.')[0]; 
    await cloudinary.uploader.destroy(publicId);

    await Post.deleteOne({ _id: req.params.id });

    res.status(204).json(); 
  } catch (e) {
    console.error('Error deleting post:', e);
    res.status(500).json({ error: 'Error deleting post' });
  }
};