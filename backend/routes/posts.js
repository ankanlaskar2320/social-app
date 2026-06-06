const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { postLimiter } = require("../middleware/rateLimiter");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/", verifyToken, postLimiter, upload.single("image"), async (req, res) => {
  const { text } = req.body;
  let imageUrl = null;

  if (req.file) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "social-app" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    } catch (err) {
      return res.status(500).json({ message: "Image upload failed" });
    }
  }

  if (!text && !imageUrl) {
    return res.status(400).json({ message: "Post must have text or image" });
  }

  try {
    const newPost = new Post({
      author: req.user.id,
      username: req.user.name,
      text,
      imageUrl
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.includes(req.user.name)) {
      post.likes = post.likes.filter((name) => name !== req.user.name);
    } else {
      post.likes.push(req.user.name);
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/:id/comment", verifyToken, async (req, res) => {
  const { text } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ username: req.user.name, text });
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;