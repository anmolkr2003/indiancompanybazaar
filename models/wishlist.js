import mongoose from "mongoose";

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

export default mongoose.model("BuyerWishlist", buyerWishlistSchema);
