const express = require("express");
const superLikeRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const SuperLike = require("../models/superLike");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA =
  "firstName lastName photoUrl age gender about skills interests githubUsername githubProfileUrl";

// ── Save a super like ──
superLikeRouter.post("/superlike/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId } = req.params;

    if (fromUserId.equals(toUserId)) {
      return res.status(400).json({ error: "Cannot super-like yourself" });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already super-liked
    const existing = await SuperLike.findOne({ fromUserId, toUserId });
    if (existing) {
      return res.status(400).json({ error: "Already super-liked" });
    }

    const superLike = new SuperLike({ fromUserId, toUserId });
    await superLike.save();

    res.json({
      message: `${req.user.firstName} super-liked ${toUser.firstName}`,
      data: superLike,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Get all super-liked profiles ──
superLikeRouter.get("/superlikes", userAuth, async (req, res) => {
  try {
    const superLikes = await SuperLike.find({ fromUserId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("toUserId", USER_SAFE_DATA);

    // For each super-liked user, check if a connection request exists
    const profiles = await Promise.all(
      superLikes.map(async (sl) => {
        const user = sl.toUserId;
        if (!user) return null;

        const connectionRequest = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: req.user._id, toUserId: user._id },
            { fromUserId: user._id, toUserId: req.user._id },
          ],
        });

        return {
          ...user.toObject(),
          superLikedAt: sl.createdAt,
          connectionStatus: connectionRequest?.status || null,
          connectionRequestId: connectionRequest?._id || null,
        };
      })
    );

    res.json({
      data: profiles.filter(Boolean),
      count: profiles.filter(Boolean).length,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Get super likes count ──
superLikeRouter.get("/superlikes/count", userAuth, async (req, res) => {
  try {
    const count = await SuperLike.countDocuments({ fromUserId: req.user._id });
    res.json({ count });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Send connect request from super likes page ──
superLikeRouter.post(
  "/superlike/:toUserId/connect",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { toUserId } = req.params;

      // Check if connection request already exists
      const existing = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existing) {
        return res.status(400).json({
          error: "Connection request already exists",
          status: existing.status,
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status: "interested",
      });

      await connectionRequest.save();

      const toUser = await User.findById(toUserId);
      res.json({
        message: `Connection request sent to ${toUser?.firstName || "user"}`,
        data: connectionRequest,
      });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// ── Remove a super like ──
superLikeRouter.delete("/superlike/:toUserId", userAuth, async (req, res) => {
  try {
    await SuperLike.findOneAndDelete({
      fromUserId: req.user._id,
      toUserId: req.params.toUserId,
    });
    res.json({ message: "Super like removed" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = superLikeRouter;
