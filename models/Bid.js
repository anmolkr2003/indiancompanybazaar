// models/Bid.js
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyListing",
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Active", "Accepted", "Rejected", "Expired", "Paid"],
    default: "Active",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bid", bidSchema);
