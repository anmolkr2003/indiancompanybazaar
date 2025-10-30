const mongoose = require("mongoose");

const directorSchema = new mongoose.Schema({
  name: String,
  DIN: String,
  role: String,
  appointedOn: Date,
  isSignatory: { type: Boolean, default: false },
});

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "financial", "itr", "certificate", "additional"],
  },
  name: String,
  url: String, // Supabase or Cloudinary URL
});

const companyListingSchema = new mongoose.Schema(
  {
    // 🔹 Step 1: Company Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CIN: { type: String, required: true },
    companyName: { type: String, required: true },
    ROC: { type: String },
    registrationNumber: { type: String },
    registeredAddress: { type: String },
    subCategory: { type: String },
    classOfCompany: { type: String },
    categoryOfCompany: { type: String },
    listedStockExchange: { type: String },
    authorizedCapital: { type: Number },
    paidUpCapital: { type: Number },
    dateOfIncorporation: { type: Date },
    dateOfBalanceSheet: { type: Date },
    companyStatus: {
      type: String,
      enum: ["Active", "Inactive", "Strike Off", "Liquidated"],
      default: "Active",
    },
    description: { type: String },

    directors: [directorSchema],

    // 🔹 Step 2: Auction Details
    auctionDetails: {
      startingBidAmount: { type: Number, required: false },
      startTime: { type: Date },
      endTime: { type: Date },
    },

    // 🔹 Step 3: Uploaded Documents
    documents: [documentSchema],

    // 🔹 Meta
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyListing", companyListingSchema);
