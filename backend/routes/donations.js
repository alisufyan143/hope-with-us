const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// @route   POST /api/donations
// @desc    Create a new donation (admin only)
// @access  Private/Admin
router.post(
  "/",
  protect,
  authorize,
  upload.single("image"),
  async (req, res, next) => {
    try {
      // Add admin user to req.body
      req.body.createdBy = req.user.id;

      // Add image path if uploaded
      if (req.file) {
        req.body.image = req.file.path;
      }

      // Convert empty caseStudy to null
      if (req.body.caseStudy === "") {
        req.body.caseStudy = null;
      }

      // Create donation
      const donation = await Donation.create(req.body);

      res.status(201).json({
        success: true,
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/donations
// @desc    Get all public donations
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const donations = await Donation.find({ isPublic: true });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/donations/all
// @desc    Get all donations (admin only)
// @access  Private/Admin
router.get("/all", protect, authorize, async (req, res, next) => {
  try {
    const donations = await Donation.find().populate("createdBy", "name");

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation
// @access  Public/Private depending on isPublic
router.get("/:id", async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Check if donation is public or user is admin
    if (!donation.isPublic) {
      // Check if user is authenticated and admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this donation",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation (admin only)
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize,
  upload.single("image"),
  async (req, res, next) => {
    try {
      let donation = await Donation.findById(req.params.id);

      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donation not found",
        });
      }

      // Add image path if uploaded
      if (req.file) {
        req.body.image = req.file.path;
      }

      // Update donation
      req.body.updatedAt = Date.now();
      donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  }
);
// @route   DELETE /api/donations/:id
// @desc    Delete donation (admin only)
// @access  Private/Admin
router.delete("/:id", protect, authorize, async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Replace donation.remove() with one of these:
    await Donation.findByIdAndDelete(req.params.id);
    // OR
    // await Donation.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
