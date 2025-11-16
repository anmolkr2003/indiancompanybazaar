const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const Business = require("../models/Business");
const Bid = require("../models/Bid");
const BuyerWishlist = require("../models/wishlist");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buyer
 *   description: Buyer related operations
 */

/* -------------------------------------------------------------------------- */
/* 🏢 BUSINESS LISTINGS - Get all active listings                             */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/business-listings:
 *   get:
 *     summary: Get all active business listings available for sale
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active businesses
 */
router.get("/business-listings", authenticate, async (req, res) => {
  try {
    const listings = await Business.find({ verified: true })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      businesses: listings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 💸 PLACE A BID                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/place-bid:
 *   post:
 *     summary: Place a bid for a company
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - amount
 *             properties:
 *               businessId:
 *                 type: string
 *                 example: "6730a9cf4f8b1e1c6a96d333"
 *               amount:
 *                 type: number
 *                 example: 12000000
 *     responses:
 *       201:
 *         description: Bid placed successfully
 */
router.post("/place-bid", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "buyer")
      return res.status(403).json({ message: "Only buyers can place bids" });

    const { businessId, amount } = req.body;
    const buyerId = req.user._id;

    const business = await Business.findById(businessId);
    if (!business)
      return res.status(404).json({ message: "Business not found" });

    const bid = await Bid.create({
  buyer: req.user._id,
  business: req.body.businessId,
  amount: req.body.amount,
  status: "pending",
});

    res.status(201).json({ message: "Bid placed successfully", bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 📜 VIEW ALL BUYER BIDS                                                     */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/my-bids:
 *   get:
 *     summary: Get all bids placed by the logged-in buyer
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bids placed by buyer
 */
router.get("/my-bids", authenticate, async (req, res) => {
  try {
    const bids = await Bid.find({ buyer: req.user._id })
      .populate("business", "name category price location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bids.length, bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE BID                                                              */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/update-bid/{bidId}:
 *   put:
 *     summary: Update a bid
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bidId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 13000000
 *     responses:
 *       200:
 *         description: Bid updated successfully
 */
router.put("/update-bid/:bidId", authenticate, async (req, res) => {
  try {
    const { bidId } = req.params;
    const { amount } = req.body;

    const updatedBid = await Bid.findOneAndUpdate(
      { _id: bidId, buyer: req.user._id },
      { amount },
      { new: true }
    );

    if (!updatedBid)
      return res.status(404).json({ message: "Bid not found or unauthorized" });

    res.status(200).json({ message: "Bid updated successfully", bid: updatedBid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🏆 WON BIDS - Bids where buyer won                                         */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/won-bids:
 *   get:
 *     summary: Get all won bids for the logged-in buyer
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all won bids
 */
router.get("/won-bids", authenticate, async (req, res) => {
  try {
    const wonBids = await Bid.find({ buyer: req.user._id, status: "won" })
      .populate("business", "name category price location");

    res.status(200).json({ success: true, wonBids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* ❌ CANCEL BID                                                              */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/cancel-bid/{bidId}:
 *   delete:
 *     summary: Cancel a bid
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bidId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bid cancelled successfully
 */
router.delete("/cancel-bid/:bidId", authenticate, async (req, res) => {
  try {
    const { bidId } = req.params;

    const deleted = await Bid.findOneAndDelete({ _id: bidId, buyer: req.user._id });
    if (!deleted)
      return res.status(404).json({ message: "Bid not found or unauthorized" });

    res.status(200).json({ message: "Bid cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 💳 PAY FOR ACCEPTED BID                                                   */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/pay/{bidId}:
 *   post:
 *     summary: Initiate payment for a winning bid
 *     description: Creates a Razorpay order for the bid amount so the buyer can pay online.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6730a9cf4f8b1e1c6a96d333"
 *         description: ID of the bid to be paid
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 key:
 *                   type: string
 *                   example: rzp_test_abc123xyz
 *                 order_id:
 *                   type: string
 *                   example: order_Fg83jsljf938sL
 *                 amount:
 *                   type: integer
 *                   example: 1500000
 *                 currency:
 *                   type: string
 *                   example: INR
 *                 bidId:
 *                   type: string
 *                   example: 6730a9cf4f8b1e1c6a96d333
 *                 businessName:
 *                   type: string
 *                   example: "TechCorp Pvt. Ltd."
 *       400:
 *         description: Only winning bids can be paid
 *       404:
 *         description: Bid not found
 *       500:
 *         description: Payment initialization failed
 */
router.post("/pay/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId).populate("business");

    if (!bid) return res.status(404).json({ message: "Bid not found" });
    if (bid.status !== "won")
      return res.status(400).json({ message: "Only winning bids can be paid" });

    const amount = bid.amount * 100; // Razorpay expects amount in paise

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${bid._id}`,
      notes: {
        business: bid.business?.name || "Business Purchase",
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      currency: "INR",
      amount,
      bidId: bid._id,
      businessName: bid.business?.name || "",
    });
  } catch (error) {
    console.error("❌ Payment init error:", error);
    res.status(500).json({ message: "Payment initialization failed" });
  }
});


/**
 * @swagger
 * /api/buyer/verify-payment/{bidId}:
 *   post:
 *     summary: Verify Razorpay payment and mark bid as paid
 *     description: Verifies payment signature from Razorpay and updates the bid status to 'paid'.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6730a9cf4f8b1e1c6a96d333"
 *         description: ID of the bid for which payment is being verified
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_Fg83jsljf938sL
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_Fk72ksj29fkLs
 *               razorpay_signature:
 *                 type: string
 *                 example: d1b3a3e9ec3dafe9a9cba451d4b98216d5c3a68d6d593ee56e674f8a9c239c85
 *     responses:
 *       200:
 *         description: Payment verified successfully and bid marked as paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment verified and bid marked as paid"
 *       400:
 *         description: Invalid signature or payment verification failed
 *       500:
 *         description: Server error while verifying payment
 */

router.post("/verify-payment/:bidId", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const { bidId } = req.params;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Bid.findByIdAndUpdate(bidId, {
        status: "paid",
        paymentId: razorpay_payment_id,
      });

      res.status(200).json({ success: true, message: "Payment verified and bid marked as paid" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature, payment verification failed" });
    }
  } catch (error) {
    console.error("❌ Payment verify error:", error);
    res.status(500).json({ message: "Verification failed", error });
  }
});

/* -------------------------------------------------------------------------- */
/* 🩵 WISHLIST APIs                                                          */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/buyer/wishlist:
 *   post:
 *     summary: Add a business to wishlist
 *     tags: [Buyer - Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *             properties:
 *               businessId:
 *                 type: string
 *                 description: ID of the business to add to wishlist
 *               notes:
 *                 type: string
 *                 description: Optional notes added by the buyer
 *     responses:
 *       201:
 *         description: Business added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 wishlist:
 *                   $ref: '#/components/schemas/BuyerWishlist'
 *       400:
 *         description: Bad request (business already exists or missing fields)
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */

// routes/buyerRoutes.js

router.post("/wishlist", authenticate, async (req, res) => {
  try {
    const { businessId, notes } = req.body;
    const buyerId = req.user._id;

    if (!businessId) {
      return res.status(400).json({ message: "businessId is required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // ✅ use BuyerWishlist model here
    const existing = await BuyerWishlist.findOne({
      buyer: buyerId,
      business: businessId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Already added to wishlist" });
    }

    // ✅ use BuyerWishlist model here too
    const wishlistItem = await BuyerWishlist.create({
      buyer: buyerId,
      business: businessId,
      seller: business.seller, // important: your schema requires this
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlist: wishlistItem,
    });
  } catch (error) {
    console.error("Wishlist error:", error);
    return res.status(500).json({ message: error.message });
  }
});




/**
 * @swagger
 * /api/buyer/wishlist/view:
 *   get:
 *     summary: View all businesses in wishlist
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 wishlist:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BuyerWishlist'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/wishlist/view", authenticate, async (req, res) => {
  console.log("➡️  wishlist/view route HIT");
  console.log("User:", req.user);

  try {
    const items = await BuyerWishlist.find({ buyer: req.user._id })
      .populate("business", "companyName categoryOfCompany registeredAddress");

    console.log("Items found:", items);

    return res.status(200).json({
      success: true,
      count: items.length,
      wishlist: items,
    });

  } catch (error) {
    console.error("❌ Wishlist view error:", error);
    return res.status(500).json({ message: error.message });
  }
});


/**
 * @swagger
 * /api/buyer/wishlist/{businessId}:
 *   delete:
 *     summary: Remove a business from wishlist
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business to remove from wishlist
 *     responses:
 *       200:
 *         description: Successfully removed
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */

router.delete("/wishlist/:businessId", authenticate, async (req, res) => {
  console.log("➡️ DELETE wishlist hit");
  console.log("BusinessId:", req.params.businessId);
  console.log("Buyer:", req.user._id);

  try {
    const { businessId } = req.params;

    await BuyerWishlist.findOneAndDelete({
      buyer: req.user._id,
      business: businessId,
    });

    return res.status(200).json({ message: "Removed from wishlist" });

  } catch (error) {
    console.error("❌ DELETE wishlist error:", error);
    return res.status(500).json({ message: error.message });
  }
});


module.exports = router;
