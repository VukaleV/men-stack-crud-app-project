const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

// Global user for templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  next();
});

// --- Home page ---
app.get("/", (req, res) => {
  res.render("home");
});

// --- Routes ---
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");

app.use("/", authRoutes);

// Protect trips routes with isAuthenticated middleware
const isAuthenticated = require("./middleware/isAuthenticated");
app.use("/trips", isAuthenticated, tripRoutes);


// --- MongoDB connect & server ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tlsAllowInvalidCertificates: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
