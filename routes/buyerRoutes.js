const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Business = require("../models/Business");
const User = require("../models/User");

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

router.get("/business-listings", async (req, res) => {
  try {
    const businesses = await Business.find({ verified: true });
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
 *     summary: Place a bid on a business listing
 *     description: Allows a buyer to place a bid on an active business listing by providing buyerId, companyId, and bid amount.
 *     tags:
 *       - Buyer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buyerId
 *               - companyId
 *               - amount
 *             properties:
 *               buyerId:
 *                 type: string
 *                 example: "68f50db408d42413b6a21fd"
 *                 description: MongoDB ObjectId of the buyer (User ID)
 *               companyId:
 *                 type: string
 *                 example: "68f50db508d42413b6a21fe"
 *                 description: MongoDB ObjectId of the company/business being bid on
 *               amount:
 *                 type: number
 *                 example: 25000
 *                 description: Amount being bid by the buyer
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
 *                   example: Bid placed successfully
 *                 bid:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "674e1c456a9a1f9b2f94a2bc"
 *                     buyer:
 *                       type: string
 *                       example: "68f50db408d42413b6a21fd"
 *                     company:
 *                       type: string
 *                       example: "68f50db508d42413b6a21fe"
 *                     amount:
 *                       type: number
 *                       example: 25000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid buyerId or companyId
 *       404:
 *         description: Buyer or company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Buyer or Company not found
 *       500:
 *         description: Server error while placing bid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while placing bid
 */


router.post("/place-bid", async (req, res) => {
  try {
    const { buyerId, companyId, amount } = req.body;

    // ✅ Validate input
    if (!buyerId || !companyId || !amount)
      return res.status(400).json({ error: "All fields are required" });

    if (
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({ error: "Invalid buyerId or companyId" });
    }

    // ✅ Fetch buyer and company
    const buyer = await User.findById(buyerId);
    const company = await Business.findById(companyId);

    if (!buyer || !company)
      return res.status(404).json({ error: "Buyer or Company not found" });

    // ✅ Create a new bid
    const newBid = new Bid({
      buyer: buyerId,
      company: companyId,
      amount,
    });

    await newBid.save();

    res.status(201).json({
      message: "Bid placed successfully",
      bid: newBid,
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Server error while placing bid" });
  }
});


/**
 * @swagger
 * /api/buyer/bids/{buyerId}:
 *   get:
 *     summary: Get all bids placed by a specific buyer
 *     description: Fetch all bids associated with the given buyer ID. Each bid includes company and buyer details.
 *     tags:
 *       - Buyer
 *     parameters:
 *       - in: path
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *           example: 66f50db408d42413b6a21fd2
 *         description: The ObjectId of the buyer
 *     responses:
 *       200:
 *         description: List of bids fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 671d4cdd21e74c8b762e1f0a
 *                   amount:
 *                     type: number
 *                     example: 25000
 *                   buyer:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 66f50db408d42413b6a21fd2
 *                       name:
 *                         type: string
 *                         example: Rahul Kumar
 *                   company:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 671d4b2f6aa1eecb31f7c8e3
 *                       name:
 *                         type: string
 *                         example: ABC Tech Pvt Ltd
 *                   createdAt:
 *                     type: string
 *                     example: 2025-10-30T12:00:00.000Z
 *       400:
 *         description: Invalid buyerId format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid buyerId format
 *       500:
 *         description: Server error while fetching bids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching bids
 */


router.get("/bids/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).json({ error: "Invalid buyerId format" });
    }

    const bids = await Bid.find({ buyer: new mongoose.Types.ObjectId(buyerId) })
      .populate("company")
      .populate("buyer");

    res.status(200).json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Error fetching bids" });
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
