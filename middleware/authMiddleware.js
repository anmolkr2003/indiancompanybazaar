const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
  try {
    console.log("🟡 Incoming request to:", req.originalUrl);
    console.log("🟡 AUTH HEADER:", req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid Authorization header found");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🟡 TOKEN EXTRACTED:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🟢 DECODED TOKEN:", decoded);

    req.user = await User.findById(decoded.id).select("-password");
    console.log("🟢 USER ATTACHED:", req.user ? req.user._id : "No user found");

    next();
  } catch (err) {
    console.error("🔥 AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

