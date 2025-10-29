import express from "express";
import {
  registerBusiness,
  addAuctionDetails,
  uploadBusinessDocuments,
  getAllBusinesses,
  getBusinessById,
  deleteBusiness,
} from "../controllers/businessController.js";

const router = express.Router();

// 🏢 Register a new business
router.post("/register", registerBusiness);

// 💰 Add auction info
router.post("/:businessId/auction", addAuctionDetails);

// 📂 Upload documents/images
router.post("/:businessId/documents", uploadBusinessDocuments);

// 📋 Get all businesses
router.get("/", getAllBusinesses);

// 🔍 Get single business by ID
router.get("/:businessId", getBusinessById);

// ❌ Delete a business
router.delete("/:businessId", deleteBusiness);

export default router;
