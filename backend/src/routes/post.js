const express = require("express");
const postRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const { upload, cloudinary } = require("../config/cloudinary");
const Post = require("../models/post");

const USER_SAFE_DATA = "firstName lastName photoUrl";

// Create a new post (with optional file upload)
postRouter.post("/posts", userAuth, upload.single("media"), async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    if (!text && !req.file) {
      return res.status(400).json({ error: "Post must have text or media" });
    }

    const postData = { userId, text: text || "" };

    if (req.file) {
      postData.mediaUrl = req.file.path;
      postData.cloudinaryPublicId = req.file.filename;
      // Detect media type from mimetype
      postData.mediaType = req.file.mimetype?.startsWith("video") ? "video" : "image";
    }

    const post = await Post.create(postData);
    const populated = await Post.findById(post._id).populate("userId", USER_SAFE_DATA);

    res.status(201).json({ data: populated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get posts by a specific user (paginated)
postRouter.get("/posts/user/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", USER_SAFE_DATA);

    const total = await Post.countDocuments({ userId });

    res.json({
      data: posts,
      pagination: { page, limit, total, hasMore: skip + limit < total },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get logged-in user's own posts
postRouter.get("/posts/me", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", USER_SAFE_DATA);

    const total = await Post.countDocuments({ userId });

    res.json({
      data: posts,
      pagination: { page, limit, total, hasMore: skip + limit < total },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete own post
postRouter.delete("/posts/:postId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (!post.userId.equals(userId)) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    // Delete media from Cloudinary
    if (post.cloudinaryPublicId) {
      const resourceType = post.mediaType === "video" ? "video" : "image";
      await cloudinary.uploader.destroy(post.cloudinaryPublicId, { resource_type: resourceType });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Toggle like on a post
postRouter.patch("/posts/:postId/like", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.some((id) => id.equals(userId));

    if (isLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      data: { liked: !isLiked, likeCount: post.likes.length },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = postRouter;
