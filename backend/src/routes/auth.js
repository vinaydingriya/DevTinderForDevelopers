const express = require("express");
const authRouter = express.Router();

const { validatePassword } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const {filterFields} = require("../utils/filterFields");

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, gender, photoUrl, about, skills } = req.body; // List expected fields
    const { _id, __v, createdAt, updatedAt } = req.body;
    if (_id !== undefined || __v !== undefined || createdAt !== undefined  || updatedAt !== undefined) {
      throw new Error("Invalid signup request")
    }

    //Validate the password
    validatePassword(password);

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    const u = { firstName, email, password: passwordHash};

    if (lastName) u.lastName = lastName;
    if (age) u.age = age;
    if (gender) u.gender = gender;
    if (photoUrl) u.photoUrl = photoUrl;
    if (about) u.about = about;
    if (skills) u.skills = skills;

    const user = new User(u);

    await user.save();
    res.json({message: "User added successfully!", data: filterFields(user)});
  } catch (e) {
    res.status(400).json({error: e.message});
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      res.json({
        message: "Login successful",
        data: filterFields(user)
      });
    } 
    else {
      throw new Error("Invalid credentials");
    }
  } catch (e) {
    res.status(400).json({error: e.message});
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.json({message: "Logout successful"});
});

module.exports = authRouter;