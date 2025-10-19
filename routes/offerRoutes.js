const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const offerController = require('../controllers/offerController');

router.post('/', authenticate, authorize('buyer'), offerController.create);
router.get('/business/:id', authenticate, authorize('seller'), offerController.forBusiness);
router.post('/:id/respond', authenticate, authorize('seller'), offerController.respond);

module.exports = router;
