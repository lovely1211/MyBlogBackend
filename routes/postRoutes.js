const express = require('express');
const router = express.Router();
const { addPost, getAllPosts, getPostById, getPostForEdit, updatePost, deletePost} = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware')



router.post('/posts', authMiddleware, addPost);

router.get('/posts', authMiddleware, getAllPosts);

router.get('/posts/user/:userId', authMiddleware, getPostById);

router.get('/posts/:id', authMiddleware, getPostForEdit );

router.put('/posts/:id', authMiddleware, updatePost);

router.delete('/posts/:id', authMiddleware, deletePost);


module.exports = router;
