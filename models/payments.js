const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",            // who made the payment
      required: true
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",        // which business the payment was for
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },
    paymentId: {              // Razorpay / Paytm / Stripe payment id
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
