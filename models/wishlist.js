const mongoose = require("mongoose");

const buyerWishlistSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the buyer's user id
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business", // the listed business id
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // seller of that business
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyerWishlist", buyerWishlistSchema);
