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

router.post("/register", registerBusiness);
router.post("/:businessId/auction", addAuctionDetails);
router.post("/:businessId/documents", uploadBusinessDocuments);
router.get("/", getAllBusinesses);
router.get("/:businessId", getBusinessById);
router.delete("/:businessId", deleteBusiness);

module.exports = router; // ✅ Use module.exports for CommonJS
