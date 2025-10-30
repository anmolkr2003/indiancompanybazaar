const express = require("express");
const {
  registerBusiness,
  addAuctionDetails,
  uploadBusinessDocuments,
  getAllBusinesses,
  getBusinessById,
  deleteBusiness,
} = require("../controllers/businessController");
const Business = require("../models/Business.js"); 

const upload = require("../middleware/upload");

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
 *     description: Creates a new company listing and stores it in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - CIN
 *               - companyName
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "671f26c18a82e03f06e2b4c1"
 *               CIN:
 *                 type: string
 *                 example: "U12345DL2020PTC123456"
 *               companyName:
 *                 type: string
 *                 example: "ABC Pvt Ltd"
 *               ROC:
 *                 type: string
 *                 example: "Delhi"
 *               registeredAddress:
 *                 type: string
 *                 example: "123 Business Street, New Delhi"
 *               categoryOfCompany:
 *                 type: string
 *                 example: "Private"
 *               classOfCompany:
 *                 type: string
 *                 example: "Limited"
 *               authorizedCapital:
 *                 type: number
 *                 example: 1000000
 *               paidUpCapital:
 *                 type: number
 *                 example: 500000
 *               description:
 *                 type: string
 *                 example: "We manufacture electric vehicles."
 *     responses:
 *       201:
 *         description: Business registered successfully
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Internal server error
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
 *     tags:
 *       - Business
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business to upload documents for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "license"
 *               name:
 *                 type: string
 *                 example: "Company License"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       404:
 *         description: Business not found
 */
router.post(
  "/:businessId/documents",
  upload.single("file"),
  async (req, res) => {
    try {
      const { businessId } = req.params;
      const { type, name } = req.body;

      const business = await Business.findById(businessId);
      if (!business) return res.status(404).json({ error: "Business not found" });

      const document = {
        type,
        name,
        url: req.file.path, // Cloudinary file URL
      };

      business.documents.push(document);
      await business.save();

      res.status(200).json({
        message: "Document uploaded successfully",
        document,
      });
    } catch (err) {
      console.error("Error uploading document:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;


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
