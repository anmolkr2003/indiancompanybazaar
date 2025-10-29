/**
 * @swagger
 * tags:
 *   name: Business
 *   description: APIs for managing registered businesses
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Director:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Amit Sharma
 *         DIN:
 *           type: string
 *           example: "01234567"
 *         role:
 *           type: string
 *           example: Director
 *
 *     Document:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: logo
 *         name:
 *           type: string
 *           example: logo.png
 *         url:
 *           type: string
 *           example: https://supabase.io/logo.png
 *
 *     AuctionDetails:
 *       type: object
 *       properties:
 *         startingBid:
 *           type: number
 *           example: 2500000
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: 2025-11-01T09:00:00Z
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: 2025-11-05T18:00:00Z
 *
 *     Business:
 *       type: object
 *       required:
 *         - CIN
 *         - companyName
 *       properties:
 *         _id:
 *           type: string
 *           example: 671ef8123456a8a12c123456
 *         CIN:
 *           type: string
 *           example: L12345MH2019PLC123456
 *         companyName:
 *           type: string
 *           example: TechNext Pvt Ltd
 *         ROC:
 *           type: string
 *           example: Mumbai
 *         registeredAddress:
 *           type: string
 *           example: Bandra, Mumbai
 *         authorizedCapital:
 *           type: number
 *           example: 1000000
 *         paidUpCapital:
 *           type: number
 *           example: 500000
 *         description:
 *           type: string
 *           example: We specialize in AI software.
 *         directors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Director'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Document'
 *         auctionDetails:
 *           $ref: '#/components/schemas/AuctionDetails'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       201:
 *         description: Business registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Get all registered businesses
 *     tags: [Business]
 *     responses:
 *       200:
 *         description: List of all businesses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Business'
 */

/**
 * @swagger
 * /api/business/{businessId}:
 *   get:
 *     summary: Get business details by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the business
 *     responses:
 *       200:
 *         description: Business details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */

/**
 * @swagger
 * /api/business/{businessId}/auction:
 *   post:
 *     summary: Add auction details for a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the business
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuctionDetails'
 *     responses:
 *       200:
 *         description: Auction details added successfully
 *       404:
 *         description: Business not found
 */

/**
 * @swagger
 * /api/business/{businessId}/documents:
 *   post:
 *     summary: Upload business-related documents
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the business
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
 *                   $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       404:
 *         description: Business not found
 */

/**
 * @swagger
 * /api/business/{businessId}:
 *   delete:
 *     summary: Delete a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the business
 *     responses:
 *       200:
 *         description: Business deleted successfully
 *       404:
 *         description: Business not found
 */
