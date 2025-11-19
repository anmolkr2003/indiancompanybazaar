const mongoose = require("mongoose");

const buyerWishlistSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },

    // New computed / stored fields
    myBidAmount: { type: Number, default: 0 },            // User’s bid  
    currentHighestBid: { type: Number, default: 0 },      // Highest bid by anyone  
    bidsCount: { type: Number, default: 0 },              // Number of bids  
    timeLeft: { type: String, default: "" },              // e.g. "1h 59m left"  
    status: { type: String, enum: ["Live","Outbid","Ended"], default: "Live" },
    thumbnailUrl: { type: String, default: "" },
  },
  { timestamps: true }
);


module.exports = mongoose.model("BuyerWishlist", buyerWishlistSchema);
