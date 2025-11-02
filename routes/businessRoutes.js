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
const { authenticate, authorize} = require("../middleware/authMiddleware.js");
// const {authorizeRoles} = require("../middleware/roleMiddleware.js");

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
 *     summary: Register a new business (Only Seller or CA can register)
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []    # Requires JWT token
 *     description: |
 *       Creates a new business record in the system.  
 *       Only users with roles **Seller** or **CA** can perform this action.  
 *       By default, all newly created businesses will have `verified: false` until approved by an admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CIN
 *               - companyName
 *             properties:
 *               CIN:
 *                 type: string
 *                 example: "U12345DL2020PTC123456"
 *               companyName:
 *                 type: string
 *                 example: "ABC Pvt Ltd"
 *               ROC:
 *                 type: string
 *                 example: "Delhi"
 *               registrationNumber:
 *                 type: string
 *                 example: "123456"
 *               registeredAddress:
 *                 type: string
 *                 example: "123 Business Street, New Delhi"
 *               subCategory:
 *                 type: string
 *                 example: "Private Limited"
 *               categoryOfCompany:
 *                 type: string
 *                 example: "Company limited by shares"
 *               classOfCompany:
 *                 type: string
 *                 example: "Private"
 *               listedInStockExchange:
 *                 type: boolean
 *                 example: true
 *               listedStockExchange:
 *                 type: string
 *                 example: "BSE"
 *               authorizedCapital:
 *                 type: number
 *                 example: 1000000
 *               paidUpCapital:
 *                 type: number
 *                 example: 500000
 *               dateOfIncorporation:
 *                 type: string
 *                 format: date
 *                 example: "2022-07-15"
 *               dateOfBalanceSheet:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-31"
 *               importantDates:
 *                 type: object
 *                 properties:
 *                   agmDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-30"
 *                   annualReturnFilingDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-10-15"
 *               directors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Rahul Kumar"
 *                     DIN:
 *                       type: string
 *                       example: "09324567"
 *                     role:
 *                       type: string
 *                       example: "Managing Director"
 *                     appointedOn:
 *                       type: string
 *                       format: date
 *                       example: "2021-08-10"
 *                     isSignatory:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       201:
 *         description: Business registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Business registered successfully!"
 *                 business:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6720a80f3f8b3a1d2e1a5b8f"
 *                     companyName:
 *                       type: string
 *                       example: "ABC Pvt Ltd"
 *                     CIN:
 *                       type: string
 *                       example: "U12345DL2020PTC123456"
 *                     verified:
 *                       type: boolean
 *                       example: false
 *                       description: "Indicates whether the business is verified by an admin (default: false)"
 *       400:
 *         description: Bad Request – Missing or invalid input fields
 *       401:
 *         description: Unauthorized – Missing or invalid JWT token
 *       403:
 *         description: Forbidden – Only users with roles Seller or CA can access this route
 *       500:
 *         description: Internal Server Error
 */

console.log("✅ Business routes loaded");

router.post("/register", (req, res, next) => {
  console.log("🟢 1️⃣ /register hit");
  next();
}, authenticate, (req, res, next) => {
  console.log("🟢 2️⃣ After authenticate:", req.user ? "User attached" : "No user");
  next();
}, authorize("seller", "ca"), (req, res, next) => {
  console.log("🟢 3️⃣ After authorize:", req.user ? req.user.email : "No user");
  next();
}, registerBusiness);





/**
 * @swagger
 * /api/business/{businessId}/auction:
 *   post:
 *     summary: Add or update auction details (Only Seller or CA)
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Adds or updates auction information for a registered business.  
 *       Only users with the role **Seller** or **CA** can manage auction details.  
 *       The `verified` status of the business remains **false** until approved by admin.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business for which to add auction details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startingBidAmount
 *               - startTime
 *               - endTime
 *             properties:
 *               startingBidAmount:
 *                 type: number
 *                 example: 50000
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-29T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-30T10:00:00Z"
 *     responses:
 *       200:
 *         description: Auction details added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Auction details added successfully!"
 *                 business:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *                       example: false
 *                       description: "Business remains unverified by default"
 *                     auctionDetails:
 *                       type: object
 *                       properties:
 *                         startingBidAmount:
 *                           type: number
 *                         startTime:
 *                           type: string
 *                           format: date-time
 *                         endTime:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only Seller or CA can add auction
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.post("/:businessId/auction", addAuctionDetails);

/**
 * @swagger
 * /api/business/{businessId}/documents:
 *   post:
 *     summary: Upload a document for a business
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 example: "certificate"
 *               name:
 *                 type: string
 *                 example: "Certificate of Incorporation"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.post("/:businessId/documents", upload.single("file"), uploadBusinessDocuments);

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Get all businesses
 *     tags: [Business]
 *     responses:
 *       200:
 *         description: List of all businesses
 *       500:
 *         description: Server error
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
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business details retrieved successfully
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
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
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business deleted successfully
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.delete("/:businessId", deleteBusiness);

module.exports = router;
