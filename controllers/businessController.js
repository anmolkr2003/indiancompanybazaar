const Business = require("../models/Business");

/**
 * @desc Register a new business (only Seller or CA can do this)
 * @route POST /api/business/register
 * @access Private (Seller, CA)
 */
const registerBusiness = async (req, res) => {
  try {
    // ✅ Ensure user is authenticated and attached by middleware
    console.log("🔐 Inside registerBusiness, req.user:", req.user);

      console.log("🟩 Headers received:", req.headers);
    console.log("🟦 Authenticated user:", req.user);
    console.log("🟨 Body received:", req.body);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - User not found in token" });
    }

    // ✅ Create new business entry
    const business = new Business({
      ...req.body,
      userId: req.user._id,  // Automatically set from logged-in user   // Default false until admin verifies
    });

    // console.log("Authenticated User:", req.user);

    await business.save();

    res.status(201).json({
      message: "Business registered successfully!",
      business,
    });
  } catch (error) {
    console.error("Business Registration Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



// 💰 Add auction details
const addAuctionDetails = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startingBidAmount, startTime, endTime } = req.body;

    // Find business
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Add auction details
    business.auctionDetails = {
      startingBidAmount,
      startTime,
      endTime,
    };

    // Ensure verified exists (default false)
    if (business.verified === undefined) {
      business.verified = false;
    }

    // Save updated business
    const updatedBusiness = await business.save();

    // 🔹 Convert to plain object so all fields (like verified) show up
    const plainBusiness = updatedBusiness.toObject({ getters: true, versionKey: false });

    // Respond
    res.status(200).json({
      message: "Auction details added successfully!",
      business: plainBusiness,
    });

  } catch (error) {
    console.error("Error adding auction details:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// 📂 Upload business documents
const uploadBusinessDocuments = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { documents } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (documents && documents.length > 0) {
      business.documents.push(...documents);
      await business.save();
    }

    res.json({
      message: "Documents uploaded successfully!",
      business,
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📋 Get all businesses
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// 🔍 Get single business by ID
const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ❌ Delete a business
const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByIdAndDelete(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({ message: "Business deleted successfully!" });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerBusiness,
  addAuctionDetails,
  uploadBusinessDocuments,
  getAllBusinesses,
  getBusinessById,
  deleteBusiness,
};
