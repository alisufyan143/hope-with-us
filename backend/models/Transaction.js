const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donation",
    required: true,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  transactionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "completed", "rejected", "failed"],
    default: "pending",
  },
  proofOfTransaction: {
    type: String,
    required: true,
  },
  proofType: {
    type: String,
    enum: ["image", "pdf", "doc"],
    required: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verificationDate: {
    type: Date,
  },
  verificationComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
