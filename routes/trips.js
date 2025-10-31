const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const isAuthenticated = require("../middleware/isAuthenticated");

// --- List all trips for the logged-in user ---
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.session.userId }).sort({ startDate: -1 });
    res.render("index", { trips });
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).send("Error fetching trips");
  }
});

// --- New trip form ---
router.get("/new", isAuthenticated, (req, res) => {
  res.render("tripForm", { trip: null, error: null });
});

// --- Create a new trip ---
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const tripData = { ...req.body, user: req.session.userId };
    await Trip.create(tripData);
    res.redirect("/trips");
  } catch (err) {
    console.error("Error creating trip:", err);
    res.render("tripForm", { trip: null, error: "Error creating trip. Please try again." });
  }
});

// --- Trip details ---
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.session.userId });
    if (!trip) return res.status(404).send("Trip not found");
    res.render("tripDetails", { trip });
  } catch (err) {
    console.error("Error fetching trip details:", err);
    res.status(500).send("Error fetching trip details");
  }
});

// --- Edit trip form ---
router.get("/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.session.userId });
    if (!trip) return res.status(404).send("Trip not found");
    res.render("tripForm", { trip, error: null });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Error loading edit form");
  }
});

// --- Update trip ---
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).send("Trip not found");
    res.redirect(`/trips/${trip._id}`);
  } catch (err) {
    console.error("Error updating trip:", err);
    res.status(500).send("Error updating trip");
  }
});

// --- Delete trip ---
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const deleted = await Trip.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    if (!deleted) return res.status(404).send("Trip not found");
    res.redirect("/trips");
  } catch (err) {
    console.error("Error deleting trip:", err);
    res.status(500).send("Error deleting trip");
  }
});

module.exports = router;
