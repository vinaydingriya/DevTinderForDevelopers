const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      maxLength: [500, "Post text cannot exceed 500 characters"],
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", null],
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
