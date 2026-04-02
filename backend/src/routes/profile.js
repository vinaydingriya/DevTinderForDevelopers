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
})

module.exports = profileRouter;
