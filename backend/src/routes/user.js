const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { filterFields } = require("../utils/filterFields");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // console.log(connectionRequests);

    const filteredConnectionRequests = connectionRequests.map(
      request => filterFields(request)
    );

    res.json({
      message: "Requests received by user",
      data: filteredConnectionRequests,
    });
  } catch (e) {
    res.status(400).json({error: e.message});
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // console.log(connectionRequests);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ message: "User connections", data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find(
      {
        $or:
          [
          { fromUserId: loggedInUser._id },
          { toUserId: loggedInUser._id }
          ],
      })
      .select("fromUserId  toUserId");
    // console.log(connectionRequests);

    const hideUsersFromFeed = [];
    connectionRequests.forEach(req => {
      if (req.fromUserId.equals(loggedInUser._id)) hideUsersFromFeed.push(req.toUserId);
      else if (req.toUserId.equals(loggedInUser._id)) hideUsersFromFeed.push(req.fromUserId);
    })
    // console.log(hideUsersFromFeed)

    const users = await User.find({
      $and: [
        { _id: { $nin: hideUsersFromFeed } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
module.exports = userRouter;
