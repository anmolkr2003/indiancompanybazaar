const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
  try {
    // 🟡 Get token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 🟢 Find user and attach to req.user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // ✅ available in all protected routes
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
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

