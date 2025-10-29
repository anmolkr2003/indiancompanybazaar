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
 *   description: API endpoints for managing businesses
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
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "Tata Motors"
 *               industry:
 *                 type: string
 *                 example: "Automobile"
 *               description:
 *                 type: string
 *                 example: "Leading car manufacturer in India"
 *               location:
 *                 type: string
 *                 example: "Mumbai, India"
 *     responses:
 *       201:
 *         description: Business registered successfully
 *       500:
 *         description: Server error
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
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startingBid:
 *                 type: number
 *                 example: 50000
 *               startTime:
 *                 type: string
 *                 example: "2025-10-29T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 example: "2025-10-30T10:00:00Z"
 *     responses:
 *       200:
 *         description: Auction details added successfully
 *       404:
 *         description: Business not found
 */
router.post("/:businessId/auction", addAuctionDetails);

/**
 * @swagger
 * /api/business/{businessId}/documents:
 *   post:
 *     summary: Upload documents for a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "license"
 *                     name:
 *                       type: string
 *                       example: "Company License"
 *                     url:
 *                       type: string
 *                       example: "https://supabase.io/license.pdf"
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       404:
 *         description: Business not found
 */
router.post("/:businessId/documents", uploadBusinessDocuments);

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Get all businesses
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
 *     summary: Get a single business by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business details
 *       404:
 *         description: Business not found
 */
router.get("/:businessId", getBusinessById);

/**
 * @swagger
 * /api/business/{businessId}:
 *   delete:
 *     summary: Delete a business
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
 *       404:
 *         description: Business not found
 */
router.delete("/:businessId", deleteBusiness);

module.exports = router;
