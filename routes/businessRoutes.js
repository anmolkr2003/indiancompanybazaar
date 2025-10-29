const express = require("express");
const {
  registerBusiness,
  addAuctionDetails,
  uploadBusinessDocuments,
  getAllBusinesses,
  getBusinessById,
  deleteBusiness,
} = require("../controllers/businessController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: APIs related to business registration, auctions, and documents
 */

/**
 * @swagger
 * /api/business/register:
 *   post:
 *     summary: Register a new business
 *     tags: [Business]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ownerName
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechCorp Ltd"
 *               ownerName:
 *                 type: string
 *                 example: "Rahul Kumar"
 *               description:
 *                 type: string
 *                 example: "IT Consulting Services"
 *     responses:
 *       201:
 *         description: Business registered successfully
 */
router.post("/register", registerBusiness);

/**
 * @swagger
 * /api/business/{businessId}/auction:
 *   post:
 *     summary: Add auction details for a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auctionDate
 *               - startingPrice
 *             properties:
 *               auctionDate:
 *                 type: string
 *                 example: "2025-11-01"
 *               startingPrice:
 *                 type: number
 *                 example: 50000
 *     responses:
 *       200:
 *         description: Auction details added successfully
 */
router.post("/:businessId/auction", addAuctionDetails);

/**
 * @swagger
 * /api/business/{businessId}/documents:
 *   post:
 *     summary: Upload business documents
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 */
router.post("/:businessId/documents", uploadBusinessDocuments);

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Get all registered businesses
 *     tags: [Business]
 *     responses:
 *       200:
 *         description: List of all businesses
 */
router.get("/", getAllBusinesses);

/**
 * @swagger
 * /api/business/{businessId}:
 *   get:
 *     summary: Get business details by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business
 *     responses:
 *       200:
 *         description: Business details fetched successfully
 */
router.get("/:businessId", getBusinessById);

/**
 * @swagger
 * /api/business/{businessId}:
 *   delete:
 *     summary: Delete a business by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business deleted successfully
 */
router.delete("/:businessId", deleteBusiness);

module.exports = router;
