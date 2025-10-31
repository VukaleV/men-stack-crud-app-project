const express = require("express");
const router = express.Router();
const User = require("../models/User");

// --- GET Register Page ---
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// --- POST Register User ---
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email is already in use." });
    }

    const user = new User({ username, email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/trips");
  } catch (err) {
    console.error("Registration Error:", err);
    res.render("register", { error: "Error during registration. Please try again." });
  }
});

// --- GET Login Page ---
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// --- POST Login User ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password." });
    }

    req.session.userId = user._id;
    res.redirect("/trips");
  } catch (err) {
    console.error("Login Error:", err);
    res.render("login", { error: "Login failed. Try again." });
  }
});

// --- POST Logout ---
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
