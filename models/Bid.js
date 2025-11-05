// 🧰 Optional static helper to find all won bids for a buyer
// models/Bid.js
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
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
  isWon: {
    type: Boolean,
    default: false,
  },
  wonAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🧠 Automatically set isWon + wonAt when bid is accepted or paid
bidSchema.pre("save", function (next) {
  if (["Accepted", "Paid"].includes(this.status)) {
    this.isWon = true;
    if (!this.wonAt) this.wonAt = new Date();
  } else {
    this.isWon = false;
    this.wonAt = undefined;
  }
  next();
});

// 🧰 Optional static helper to find all won bids for a buyer
bidSchema.statics.findWonBids = function (buyerId) {
  return this.find({ buyer: buyerId, isWon: true }).populate("company", "name");
};

module.exports = mongoose.model("Bid", bidSchema);
