import express from "express";
import mongoose from "mongoose";
import Bid from "../models/Bid.js";
import CompanyListing from "../models/CompanyListing.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buyer
 *   description: Buyer operations
 */

/**
 * @swagger
 * /buyer/place-bid:
 *   post:
 *     summary: Place a new bid on a company
 *     tags: [Buyer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buyerId:
 *                 type: string
 *                 example: 671f26c18a82e03f06e2b4c1
 *               companyId:
 *                 type: string
 *                 example: 672e12b847f2b6cc6ab9d123
 *               amount:
 *                 type: number
 *                 example: 1200000
 *     responses:
 *       200:
 *         description: Bid placed successfully
 */
router.post("/place-bid", async (req, res) => {
  try {
    const { buyerId, companyId, amount } = req.body;

    if (!buyerId || !companyId || !amount)
      return res.status(400).json({ error: "All fields are required" });

    const buyer = await User.findById(buyerId);
    if (!buyer || buyer.role !== "buyer")
      return res.status(403).json({ error: "Only buyers can place bids" });

    const company = await CompanyListing.findById(companyId);
    if (!company)
      return res.status(404).json({ error: "Company not found" });

    const bid = new Bid({ buyer: buyerId, company: companyId, amount });
    await bid.save();

    res.status(200).json({ message: "Bid placed successfully", bid });
  } catch (err) {
    console.error("Error placing bid:", err);
    res.status(500).json({ error: "Server error while placing bid" });
  }
});

/**
 * @swagger
 * /buyer/my-bids/{buyerId}:
 *   get:
 *     summary: Get all bids placed by a buyer
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 671f26c18a82e03f06e2b4c1
 *     responses:
 *       200:
 *         description: List of bids
 */
router.get("/my-bids/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;

    const bids = await Bid.find({ buyer: buyerId })
      .populate("company", "companyName CIN authorizedCapital paidUpCapital")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: bids.length, bids });
  } catch (err) {
    console.error("Error fetching bids:", err);
    res.status(500).json({ error: "Server error while fetching bids" });
  }
});

/**
 * @swagger
 * /buyer/update-bid/{bidId}:
 *   put:
 *     summary: Update bid amount
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         example: 672e12b847f2b6cc6ab9d123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500000
 *     responses:
 *       200:
 *         description: Bid updated successfully
 */
router.put("/update-bid/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;
    const { amount } = req.body;

    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { amount },
      { new: true }
    );

    if (!bid) return res.status(404).json({ error: "Bid not found" });

    res.status(200).json({ message: "Bid updated successfully", bid });
  } catch (err) {
    console.error("Error updating bid:", err);
    res.status(500).json({ error: "Server error while updating bid" });
  }
});

/**
 * @swagger
 * /buyer/cancel-bid/{bidId}:
 *   delete:
 *     summary: Cancel a bid
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         example: 672e12b847f2b6cc6ab9d123
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
 * /buyer/pay/{bidId}:
 *   post:
 *     summary: Pay for an accepted bid
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         example: 672e12b847f2b6cc6ab9d123
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

export default router;
