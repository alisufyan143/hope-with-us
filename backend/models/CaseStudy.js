const mongoose = require("mongoose");

const caseStudySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  financialNeed: {
    type: Number,
    required: true,
  },
  medicalCondition: {
    type: String,
    default: "",
  },
  otherDetails: {
    type: String,
    default: "",
  },
  supportingDocuments: [
    {
      name: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNotes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CaseStudy", caseStudySchema);
