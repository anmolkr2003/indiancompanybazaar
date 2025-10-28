const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");

// Protect middleware (check token and attach user)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

// Verify role middleware
const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied for this role" });
    }
    next();
  };
};


router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Verification link invalid or expired." });
  }
});

// 🔁 Resend OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const pending = await PendingUser.findOne({ email });
  if (!pending) return res.status(400).json({ error: "No pending registration found" });

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  pending.otp = newOtp;
  pending.expiresAt = Date.now() + 5 * 60 * 1000;
  await pending.save();

  const emailResult = await sendOtpEmail(email, newOtp);
  if (!emailResult) return res.status(500).json({ error: "Failed to resend OTP" });

  res.status(200).json({ message: "New OTP sent to email" });
});



const PendingUser = require("../models/pendingUser");
const sendOtpEmail = require("../utils/sendEmailOtp");

// ====================
// 📧 Register with OTP
// ====================
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

    await PendingUser.deleteMany({ email });
    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      otp,
      expiresAt,
      role: role || "user",
    });

    const sent = await sendOtpEmail(email, otp);
    if (!sent) return res.status(500).json({ error: "Failed to send OTP" });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a pending user and sends OTP email for verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Missing or invalid input
 */
router.post("/register", async (req, res) => {
  // your registration code
});


// ====================
// 🔐 Verify OTP
// ====================
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *              
 *               otp:
 *                 type: string
 * 
 *     responses:
 *       201:
 *         description: User verified and registered
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const pending = await PendingUser.findOne({ email });
    if (!pending) return res.status(400).json({ error: "No pending registration" });
    if (pending.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (Date.now() > pending.expiresAt)
      return res.status(400).json({ error: "OTP expired" });

    const user = new User({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      isVerified: true,
    });

    await user.save();
    await PendingUser.deleteOne({ _id: pending._id });

    res.status(201).json({ message: "User verified and registered successfully" });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ====================
// 🔑 Login
// ====================
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});





// Buyer dashboard
router.get("/buyer/dashboard", protect, verifyRole(["buyer"]), (req, res) => {
  res.json({ message: "Welcome Buyer Dashboard" });
});

// Seller dashboard
router.get("/seller/dashboard", protect, verifyRole(["seller"]), (req, res) => {
  res.json({ message: "Welcome Seller Dashboard" });
});

// CA dashboard
router.get("/ca/dashboard", protect, verifyRole(["ca"]), (req, res) => {
  res.json({ message: "Welcome CA Dashboard" });
});


module.exports = router;
