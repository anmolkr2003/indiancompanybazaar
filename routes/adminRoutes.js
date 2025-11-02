const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// ✅ Use the correct middleware
router.use(authenticate, authorize('admin', 'ca'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin routes for verifying or rejecting businesses
 */


/**
 * @swagger
 * /api/admin/pending:
 *   get:
 *     summary: Get all pending (unverified) businesses
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of pending businesses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 pending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64c1a3e2c34f2b1f12345678
 *                       companyName:
 *                         type: string
 *                         example: ABC Pvt Ltd
 *                       verified:
 *                         type: boolean
 *                         example: false
 *       500:
 *         description: Server error
 */

router.get('/pending', adminController.pending);

/**
 * @swagger
 * /api/admin/verify/{id}:
 *   put:
 *     summary: Verify a business by its ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the business to verify
 *         schema:
 *           type: string
 *           example: 64c1a3e2c34f2b1f12345678
 *     responses:
 *       200:
 *         description: Business verified successfully
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
 *                   example: Business verified successfully
 *                 business:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */

router.put('/verify/:id', adminController.verify);



/**
 * @swagger
 * /api/admin/reject/{id}:
 *   delete:
 *     summary: Reject and remove a business by its ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the business to reject
 *         schema:
 *           type: string
 *           example: 64c1a3e2c34f2b1f12345678
 *     responses:
 *       200:
 *         description: Business rejected and removed successfully
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
 *                   example: Business rejected and removed successfully
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.put('/reject/:id', adminController.reject);



module.exports = router;
