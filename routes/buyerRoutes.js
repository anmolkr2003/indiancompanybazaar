const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Business = require("../models/Business");
const User = require("../models/User");
const { authorize, authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buyer
 *   description: Buyer related operations
 */


/**
 * @swagger
 * /api/buyer/business-listings:
 *   get:
 *     summary: Get all active business listings available for sale
 *     tags: [Buyer]
 *     responses:
 *       200:
 *         description: List of active business listings
 */

router.get("/business-listings",authenticate, authorize('buyer'), async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.status(200).json({ count: businesses.length, businesses });
  } catch (err) {
    console.error("Error fetching business listings:", err);
    res.status(500).json({ error: "Server error while fetching business listings" });
  }
});


/**
 * @swagger
 * /api/buyer/place-bid:
 *   post:
 *     summary: Place a bid for a company
 *     description: Allows a logged-in buyer to place a bid on a business listing. The buyer ID is automatically extracted from the JWT token.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []       # 👈 Required for token-based access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - amount
 *             properties:
 *               companyId:
 *                 type: string
 *                 description: The ID of the company/business being bid on
 *                 example: "671df8d4f8a36e1234567890"
 *               amount:
 *                 type: number
 *                 description: The bid amount
 *                 example: 55000
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bid placed successfully"
 *                 bid:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "675b09f92abf4f123456789a"
 *                     company:
 *                       type: string
 *                       example: "Tata Motors Ltd"
 *                     amount:
 *                       type: number
 *                       example: 55000
 *                     status:
 *                       type: string
 *                       example: "Active"
 *                     buyer:
 *                       type: string
 *                       example: "Anmol Singh"
 *       400:
 *         description: Bad request — missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "companyId and amount are required"
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No token provided"
 *       403:
 *         description: Forbidden — not a buyer account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied for this role"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while placing bid"
 */

router.post("/place-bid", authenticate, authorize("buyer"), async (req, res) => {
  try {
    const { companyId, amount } = req.body;
    const buyerId = req.user._id; // ✅ Logged-in buyer ID from token

    // ✅ Validate input
    if (!companyId || !amount) {
      return res.status(400).json({ error: "companyId and amount are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: "Invalid companyId" });
    }

    // ✅ Fetch buyer & company from DB to validate existence
    const buyer = await User.findById(buyerId);
    const company = await Business.findById(companyId);

    if (!buyer || !company) {
      return res.status(404).json({ error: "Buyer or Company not found" });
    }

    // ✅ Create and save bid
    const newBid = await Bid.create({
      buyer: buyerId,
      company: companyId,
      amount,
    });

    res.status(201).json({
      message: "Bid placed successfully",
      bid: {
        id: newBid._id,
        company: company.name,
        amount: newBid.amount,
        status: newBid.status,
        buyer: buyer.name,
      },
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Server error while placing bid" });
  }
});


// ====================
// 📋 Get all bids placed by logged-in buyer
// ====================

/**
 * @swagger
 * /api/buyer/my-bids:
 *   get:
 *     summary: Get all bids placed by the logged-in buyer
 *     description: Returns all bids placed by the currently authenticated buyer. Automatically extracts buyer ID from JWT token.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []    # Token required
 *     responses:
 *       200:
 *         description: List of bids fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 2
 *                 bids:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 671d4cdd21e74c8b762e1f0a
 *                       amount:
 *                         type: number
 *                         example: 25000
 *                       status:
 *                         type: string
 *                         example: Active
 *                       company:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 671d4b2f6aa1eecb31f7c8e3
 *                           name:
 *                             type: string
 *                             example: ABC Tech Pvt Ltd
 *                       createdAt:
 *                         type: string
 *                         example: 2025-11-05T12:00:00.000Z
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No token provided
 *       500:
 *         description: Server error while fetching bids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while fetching bids
 */

router.get("/my-bids", authenticate, authorize("buyer"), async (req, res) => {
  try {
    const buyerId = req.user._id; // ✅ from JWT token

    const bids = await Bid.find({ buyer: buyerId })
      .populate("company", "name category") // get company details
      .populate("buyer", "name email");     // get buyer details (yourself)

    res.status(200).json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error) {
    console.error("Error fetching buyer bids:", error);
    res.status(500).json({ error: "Server error while fetching bids" });
  }
});



/**
 * @swagger
 * /api/buyer/update-bid/{bidId}:
 *   put:
 *     summary: Update a bid
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: bidId
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
 *     responses:
 *       200:
 *         description: Bid updated successfully
 */
router.put("/update-bid/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const { amount } = req.body;

    const bid = await Bid.findByIdAndUpdate(bidId, { amount }, { new: true });
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    res.status(200).json({ message: "Bid updated successfully", bid });
  } catch (err) {
    console.error("Error updating bid:", err);
    res.status(500).json({ error: "Server error while updating bid" });
  }
});


/**
 * @swagger
 * /api/buyer/won-bids:
 *   get:
 *     summary: Get all won bids for the logged-in buyer
 *     description: Returns a list of bids with status 'Accepted' or 'Paid' belonging to the current buyer.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of won bids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 wonBids:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bidId:
 *                         type: string
 *                         example: "675b08d12abf4f..."
 *                       amount:
 *                         type: number
 *                         example: 50000
 *                       status:
 *                         type: string
 *                         example: "Accepted"
 *                       company:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 */
router.get("/won-bids",authenticate, authorize(["buyer"]), async (req, res) => {
  try {
    const buyerId = req.user._id;

    // Find bids belonging to this buyer that are accepted or paid
    const wonBids = await Bid.find({
      buyer: buyerId,
      status: { $in: ["Accepted", "Paid"] },
    }).populate("company", "name");

    res.status(200).json({
      success: true,
      count: wonBids.length,
      wonBids: wonBids.map(bid => ({
        bidId: bid._id,
        amount: bid.amount,
        status: bid.status,
        company: bid.company ? bid.company.name : "Unknown",
      })),
    });
  } catch (err) {
    console.error("Error fetching won bids:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching won bids",
    });
  }
});

/**
 * @swagger
 * /api/buyer/cancel-bid/{bidId}:
 *   delete:
 *     summary: Cancel a bid
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bid canceled successfully
 */
router.delete("/cancel-bid/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findByIdAndDelete(bidId);
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    res.status(200).json({ message: "Bid canceled successfully" });
  } catch (err) {
    console.error("Error canceling bid:", err);
    res.status(500).json({ error: "Server error while canceling bid" });
  }
});

/**
 * @swagger
 * /api/buyer/pay/{bidId}:
 *   post:
 *     summary: Pay for an accepted bid
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment successful
 */
router.post("/pay/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId).populate("company");

    if (!bid) return res.status(404).json({ error: "Bid not found" });
    if (bid.status !== "Accepted")
      return res.status(400).json({ error: "Only accepted bids can be paid" });

    bid.status = "Paid";
    await bid.save();

    res.status(200).json({ message: "Payment successful", bid });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ error: "Server error while processing payment" });
  }
});

module.exports = router;
