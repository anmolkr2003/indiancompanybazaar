const Business = require("../models/Business.js");

// 🏢 Register a new business
const registerBusiness = async (req, res) => {
  try {
    const business = new Business(req.body);
    await business.save();

    res.status(201).json({
      message: "Business registered successfully!",
      business,
    });
  } catch (error) {
    console.error("Error registering business:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 💰 Add auction details
const addAuctionDetails = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    business.auctionDetails = req.body;
    await business.save();

    res.json({
      message: "Auction details added successfully!",
      business,
    });
  } catch (error) {
    console.error("Error adding auction details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    res.json(businesses);
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
