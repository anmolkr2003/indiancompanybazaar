const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.use(authenticate, authorize('admin','ca'));

router.get('/pending', adminController.pending);
router.put('/verify/:id', adminController.verify);
router.put('/reject/:id', adminController.reject);

module.exports = router;
