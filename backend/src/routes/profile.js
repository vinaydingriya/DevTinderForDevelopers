const express = require("express");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const { filterFields } = require("../utils/filterFields");
const { validateEditProfileData, validatePassword } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      message: "Profile data",
      data: filterFields(user)
    });
  } catch (e) {
    res.status(400).json({error: e.message});
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: "Your profile has been updated successfully",
      data: filterFields(loggedInUser),
    });
  } catch (e) {
    res.status(400).json({error: e.message});
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const loggedInUser = req.user;

    const checkPassword = await loggedInUser.validatePassword(oldPassword);
    if (!checkPassword) {
      throw new Error("Incorrect old password");
    }

    if (oldPassword == newPassword) {
      throw new Error("Cannot keep new password same as previous");
    }
    validatePassword(newPassword);
    // Encrypt the password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    loggedInUser.password = passwordHash;
    await loggedInUser.save();

    res.json({ message: "Password updated successfully" })
  }
  catch (e) {
    res.status(400).json({error: e.message});
  }
});

// ── Delete Account ──
profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const loggedInUser = req.user;

    if (!password) {
      return res.status(400).json({ error: "Password is required to delete account" });
    }

    const isValid = await loggedInUser.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const userId = loggedInUser._id;

    // Load models lazily to avoid circular dependency issues
    const ConnectionRequest = require("../models/connectionRequest");

    // 1. Remove all connection requests involving this user
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    // 2. Remove user references from other users' liked/skipped/matched arrays
    const User = require("../models/user");
    await User.updateMany(
      {},
      {
        $pull: {
          likedUsers: { userId },
          skippedUsers: { userId },
          matchedUsers: { userId },
        },
      }
    );

    // 3. Try to clean up chat data (models may not exist)
    try {
      const ChatRoom = require("../models/chatRoom");
      const Message = require("../models/message");
      const rooms = await ChatRoom.find({ participants: userId }).select("_id");
      const roomIds = rooms.map((r) => r._id);
      if (roomIds.length > 0) {
        await Message.deleteMany({ roomId: { $in: roomIds } });
      }
      await ChatRoom.deleteMany({ participants: userId });
    } catch (_) {
      // Chat models may not exist — skip
    }

    // 4. Try to clean up posts
    try {
      const Post = require("../models/post");
      await Post.deleteMany({ userId });
    } catch (_) {}

    // 5. Try to clean up super likes
    try {
      const SuperLike = require("../models/superLike");
      await SuperLike.deleteMany({
        $or: [{ fromUserId: userId }, { toUserId: userId }],
      });
    } catch (_) {}

    // 6. Delete the user document
    await User.findByIdAndDelete(userId);

    // 7. Clear cookie
    res.cookie("token", null, { expires: new Date(Date.now()) });

    res.json({ message: "Account deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = profileRouter;
