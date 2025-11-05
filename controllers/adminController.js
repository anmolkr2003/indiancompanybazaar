const Business = require("../models/Business");

// 🔹 Get all pending (unverified) businesses
exports.pending = async (req, res) => {
  try {
      const pending = await Business.find({ verified: false })
      .populate("userId", "name email role") // ✅ correct populate field
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pending.length,
      pending,
    });
  } catch (error) {
    console.error("Error fetching pending businesses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending businesses",
    });
  }
};

// 🔹 Verify a business
exports.verify = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    if (business.verified) {
      return res
        .status(400)
        .json({ success: false, message: "Business is already verified" });
    }

    // ✅ Mark as verified
    business.verified = true;
    business.verifiedBy = req.user._id; // ✅ Admin who verified
    business.verifiedAt = new Date();

    await business.save();

    res.status(200).json({
      success: true,
      message: "Business verified successfully",
      business,
    });
  } catch (error) {
    console.error("Error verifying business:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while verifying business" });
  }
};

// 🔹 Reject (delete) a business
exports.reject = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    await business.deleteOne();

    res.status(200).json({
      success: true,
      message: "Business rejected and removed successfully",
    });
  } catch (error) {
    console.error("Error rejecting business:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while rejecting business" });
  }
};
