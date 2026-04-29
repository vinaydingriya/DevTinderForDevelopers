const mongoose = require("mongoose");

const superLikeSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

superLikeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const SuperLike = mongoose.model("SuperLike", superLikeSchema);
module.exports = SuperLike;
