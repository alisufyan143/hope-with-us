const express = require("express");
const router = express.Router();
const CaseStudy = require("../models/CaseStudy");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

// @route   POST /api/case-studies
// @desc    Create a new case study
// @access  Private
router.post(
  "/",
  protect,
  upload.array("documents", 5),
  async (req, res, next) => {
    try {
      // Add user to req.body
      req.body.user = req.user.id;

      // Process uploaded files
      let supportingDocuments = [];
      if (req.files && req.files.length > 0) {
        supportingDocuments = req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
        }));
      }

      // Create case study
      const caseStudy = await CaseStudy.create({
        ...req.body,
        supportingDocuments,
      });

      res.status(201).json({
        success: true,
        data: caseStudy,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/case-studies
// @desc    Get all case studies (admin only)
// @access  Private/Admin
router.get("/", protect, authorize, async (req, res, next) => {
  try {
    const caseStudies = await CaseStudy.find().populate("user", "name email");

    res.status(200).json({
      success: true,
      count: caseStudies.length,
      data: caseStudies,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/case-studies/my
// @desc    Get logged in user's case studies
// @access  Private
router.get("/my", protect, async (req, res, next) => {
  try {
    const caseStudies = await CaseStudy.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: caseStudies.length,
      data: caseStudies,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/case-studies/:id
// @desc    Get single case study
// @access  Private
router.get("/:id", protect, async (req, res, next) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id);

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    // Make sure user is case study owner or admin
    if (
      caseStudy.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this case study",
      });
    }

    res.status(200).json({
      success: true,
      data: caseStudy,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/case-studies/:id
// @desc    Update case study
// @access  Private
router.put(
  "/:id",
  protect,
  upload.array("documents", 5),
  async (req, res, next) => {
    try {
      let caseStudy = await CaseStudy.findById(req.params.id);

      if (!caseStudy) {
        return res.status(404).json({
          success: false,
          message: "Case study not found",
        });
      }

      // Make sure user is case study owner
      if (
        caseStudy.user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this case study",
        });
      }

      // Process uploaded files if any
      if (req.files && req.files.length > 0) {
        const newDocuments = req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
        }));
        req.body.supportingDocuments = [
          ...caseStudy.supportingDocuments,
          ...newDocuments,
        ];
      }

      // Update case study
      req.body.updatedAt = Date.now();
      caseStudy = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: caseStudy,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/case-studies/:id/status
// @desc    Update case study status (admin only)
// @access  Private/Admin
router.put("/:id/status", protect, authorize, async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    let caseStudy = await CaseStudy.findById(req.params.id);

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    // Update status and admin notes
    caseStudy = await CaseStudy.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: caseStudy,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/case-studies/:id
// @desc    Delete case study
// @access  Private
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id);

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: "Case study not found",
      });
    }

    // Make sure user is case study owner or admin
    if (
      caseStudy.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this case study",
      });
    }

    // Use deleteOne() instead of remove()
    await caseStudy.deleteOne();

    // Alternative method:
    // await CaseStudy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});
// Route to handle file downloads
router.get("/download/:studyId/:docId", async (req, res) => {
  try {
    const { studyId, docId } = req.params;

    // Find the case study
    const caseStudy = await CaseStudy.findById(studyId);

    if (!caseStudy) {
      return res.status(404).send("Case study not found");
    }

    // Find the specific document
    const document = caseStudy.supportingDocuments.find(
      (doc) => doc._id.toString() === docId
    );

    if (!document) {
      return res.status(404).send("Document not found");
    }

    // Get the full path of the file
    const filePath = path.resolve(document.path);

    // These headers are crucial for forcing download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.name}"`
    );

    // Send the file as a download
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
    res.status(500).send("Error processing download request");
  }
});

module.exports = router;
