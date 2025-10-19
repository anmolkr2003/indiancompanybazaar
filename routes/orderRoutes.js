const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', authenticate, authorize('buyer'), orderController.create);
router.post('/:id/paid', authenticate, authorize('buyer'), orderController.markPaid);
router.post('/:id/verify-by-ca', authenticate, authorize('ca','admin'), orderController.verifyByCA);
router.post('/:id/complete', authenticate, authorize('seller','admin'), orderController.complete);

module.exports = router;
