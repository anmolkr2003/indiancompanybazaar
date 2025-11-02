const Business = require('../models/Business');

// 🔹 Get all pending businesses
exports.pending = async (req, res) => {
  try {
    const pending = await Business.find({ verified: false }).populate('business', 'name email');
    res.status(200).json({
      success: true,
      count: pending.length,
      pending,
    });
  } catch (error) {
    console.error("Error fetching pending businesses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 Verify a business
exports.verify = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    business.verified = true;
    await business.save();

    res.status(200).json({
      success: true,
      message: 'Business verified successfully',
      business,
    });
  } catch (error) {
    console.error("Error verifying business:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🔹 Reject (delete) a business
exports.reject = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await Business.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Business rejected and removed successfully',
    });
  } catch (error) {
    console.error("Error rejecting business:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
