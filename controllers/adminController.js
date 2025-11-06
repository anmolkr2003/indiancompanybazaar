const Business = require("../models/Business");
const Bid = require("../models/Bid");

// 🔹 Get all pending (unverified) businesses
exports.pending = async (req, res) => {
  try {
    const pending = await Business.find({ verified: false })
      .populate("seller", "name email role")
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
    business.verifiedBy = req.user._id;
    business.verifiedAt = new Date();

    await business.save();

    res.status(200).json({
      success: true,
      message: "Business verified successfully",
      business,
    });
  } catch (error) {
    console.error("Error verifying business:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying business",
    });
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
    res.status(500).json({
      success: false,
      message: "Server error while rejecting business",
    });
  }
};

// 🔹 Accept a Bid
exports.acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)
      .populate("buyer", "name email")
      .populate("business", "name category price");

    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    if (bid.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending bids can be accepted" });
    }

    // ✅ Update this bid
    bid.status = "won";
    await bid.save();

    // ✅ Reject all other bids for the same business
    await Bid.updateMany(
      { business: bid.business._id, _id: { $ne: bid._id } },
      { status: "lost" }
    );

    res.status(200).json({
      success: true,
      message: "Bid accepted successfully",
      bid,
    });
  } catch (error) {
    console.error("Error accepting bid:", error);
    res.status(500).json({
      success: false,
      message: "Server error while accepting bid",
    });
  }
};

// 🔹 Reject a Bid
exports.rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)
      .populate("buyer", "name email")
      .populate("business", "name category price");

    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    if (bid.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending bids can be rejected" });
    }

    bid.status = "lost";
    await bid.save();

    res.status(200).json({
      success: true,
      message: "Bid rejected successfully",
      bid,
    });
  } catch (error) {
    console.error("Error rejecting bid:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting bid",
    });
  }
};
