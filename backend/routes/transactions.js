const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Donation = require("../models/Donation");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");
// @route   POST /api/transactions
// @desc    Create a new donation transaction with proof
// @access  Private
router.post(
  "/",
  protect,
  upload.single("proofOfTransaction"),
  async (req, res, next) => {
    try {
      const { donationId, amount, message, anonymous } = req.body;

      // Validate required proof of transaction
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Proof of transaction is required",
        });
      }

      // Determine proof type based on mimetype
      let proofType;
      if (req.file.mimetype.includes("pdf")) {
        proofType = "pdf";
      } else if (req.file.mimetype.includes("image")) {
        proofType = "image";
      } else if (req.file.mimetype.includes("word")) {
        proofType = "doc";
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid file type for proof of transaction",
        });
      }

      // Validate donation exists
      const donation = await Donation.findById(donationId);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donation not found",
        });
      }

      // Make sure donation is public
      if (!donation.isPublic) {
        return res.status(400).json({
          success: false,
          message: "Cannot donate to a non-public donation",
        });
      }

      // Create transaction
      const transaction = await Transaction.create({
        donation: donationId,
        donor: req.user.id,
        amount,
        message: message || "",
        anonymous: anonymous || false,
        status: "pending",
        proofOfTransaction: req.file.path,
        proofType,
      });

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/transactions/:id/verify
// @desc    Verify a transaction (admin only)
// @access  Private/Admin
router.put("/:id/verify", protect, authorize, async (req, res, next) => {
  try {
    const { verificationStatus, verificationComment } = req.body;

    if (!["verified", "rejected"].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification status. Must be 'verified' or 'rejected'",
      });
    }

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check if transaction is in a valid state to be verified
    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot verify a transaction that is already ${transaction.status}`,
      });
    }

    // Update transaction with verification info
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: verificationStatus,
        verifiedBy: req.user.id,
        verificationDate: Date.now(),
        verificationComment: verificationComment || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log(
      `Transaction ${transaction._id} verified by ${req.user.name} with status: ${verificationStatus}`
    );
    // If verified, update to completed if there's a transactionId
    if (verificationStatus === "verified" && transaction) {
      transaction.status = "completed";
      await transaction.save();

      // Update donation amount
      await Donation.findByIdAndUpdate(transaction.donation, {
        $inc: { currentAmount: transaction.amount },
      });
      const donation = await Donation.findById(transaction.donation);
      console.log(
        `Donation ${donation.title} updated with new amount: ${donation.currentAmount}`
      );
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/transactions/:id/complete
// @desc    Complete a verified transaction
// @access  Private/Admin
router.put("/:id/complete", protect, authorize, async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check if transaction is verified
    if (transaction.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Only verified transactions can be completed",
      });
    }

    // Update transaction status
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        transactionId,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Update donation amount
    await Donation.findByIdAndUpdate(transaction.donation, {
      $inc: { currentAmount: transaction.amount },
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/pending
// @desc    Get all pending transactions that need verification (admin only)
// @access  Private/Admin
router.get("/pending", protect, authorize, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ status: "pending" })
      .populate("donation", "title")
      .populate("donor", "name email");

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions (admin only)
// @access  Private/Admin
router.get("/", protect, authorize, async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("donation", "title")
      .populate("donor", "name email")
      .populate("verifiedBy", "name");

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});
// @route   GET /api/transactions/my
// @desc    Get logged in user's transactions
// @access  Private
router.get("/my", protect, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      donor: req.user.id,
    }).populate("donation", "title");

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/transactions/donation/:donationId
// @desc    Get transactions for a specific donation
// @access  Private/Admin
router.get(
  "/donation/:donationId",
  protect,
  authorize,
  async (req, res, next) => {
    try {
      const transactions = await Transaction.find({
        donation: req.params.donationId,
      }).populate("donor", "name email");

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id/download-proof", protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "donor",
      "id"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check if user is admin or transaction owner
    if (
      req.user.role !== "admin" &&
      transaction.donor &&
      transaction.donor.id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this transaction",
      });
    }

    // Get file path from transaction
    const filePath = path.resolve(transaction.proofOfTransaction);

    // Determine content type based on proofType
    let contentType;
    switch (transaction.proofType) {
      case "pdf":
        contentType = "application/pdf";
        break;
      case "doc":
        contentType = "application/msword";
        break;
      case "image":
        // Detect image type from extension
        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
          contentType = "image/jpeg";
        } else if (filePath.endsWith(".png")) {
          contentType = "image/png";
        } else if (filePath.endsWith(".gif")) {
          contentType = "image/gif";
        } else {
          contentType = "application/octet-stream";
        }
        break;
      default:
        contentType = "application/octet-stream";
    }

    // Extract filename from path
    const fileName = transaction.proofOfTransaction.split("/").pop();

    // Set headers for download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      if (!res.headersSent) {
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    next(error);
  }
});

// @route   GET /api/transactions/:id
// @desc    Get a single transaction
// @access  Private (admin or transaction owner)
router.get("/:id", protect, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("donation", "title description")
      .populate("donor", "name email")
      .populate("verifiedBy", "name");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    // Check if user is admin or transaction owner
    if (
      req.user.role !== "admin" &&
      transaction.donor.id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this transaction",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
