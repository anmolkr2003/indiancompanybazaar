const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const businessController = require('../controllers/businessController');

router.post('/', authenticate, authorize('seller'), upload.array('documents', 5), businessController.create);
router.get('/', businessController.listVerified);
router.get('/mine', authenticate, authorize('seller'), businessController.listMine);
router.get('/:id', authenticate, businessController.get);

module.exports = router;
