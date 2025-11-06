import BuyerWishlist from "../models/buyerWishlist.js";
import Business from "../models/Business.js";

// Add a business to buyer's wishlist
export const addToBuyerWishlist = async (req, res) => {
  try {
    if (req.user.role !== "buyer")
      return res.status(403).json({ message: "Only buyers can add to wishlist" });

    const { businessId, notes } = req.body;
    const buyerId = req.user._id;

    const business = await Business.findById(businessId).populate("seller");
    if (!business)
      return res.status(404).json({ message: "Business not found" });

    const existing = await BuyerWishlist.findOne({
      buyer: buyerId,
      business: businessId,
    });
    if (existing)
      return res.status(400).json({ message: "Already added to wishlist" });

    const wishlistItem = await BuyerWishlist.create({
      buyer: buyerId,
      business: business._id,
      seller: business.seller._id,
      notes,
    });

    res.status(201).json({
      message: "Business added to wishlist",
      data: wishlistItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all businesses in buyer's wishlist
export const getBuyerWishlist = async (req, res) => {
  try {
    if (req.user.role !== "buyer")
      return res.status(403).json({ message: "Only buyers can access wishlist" });

    const buyerId = req.user._id;
    const wishlist = await BuyerWishlist.find({ buyer: buyerId })
      .populate("business")
      .populate("seller", "name email");

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a business from buyer's wishlist
export const removeFromBuyerWishlist = async (req, res) => {
  try {
    if (req.user.role !== "buyer")
      return res.status(403).json({ message: "Only buyers can modify wishlist" });

    const buyerId = req.user._id;
    const { businessId } = req.params;

    const removed = await BuyerWishlist.findOneAndDelete({
      buyer: buyerId,
      business: businessId,
    });

    if (!removed)
      return res.status(404).json({ message: "Business not found in wishlist" });

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
