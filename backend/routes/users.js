const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get("/", protect, authorize, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get single user (admin only)
// @access  Private/Admin
router.get("/:id", protect, authorize, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put("/:id", protect, authorize, async (req, res, next) => {
  try {
    // Remove password field if it exists in req.body
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/Deactivate user (admin only)
// @access  Private/Admin
router.put("/:id/activate", protect, authorize, async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide isActive field",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update logged in user profile
// @access  Private
router.put("/profile", protect, async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {
      name: req.body.name,
    };

    // Update email if provided
    if (req.body.email) {
      fieldsToUpdate.email = req.body.email;
    }

    // Update password if provided
    if (req.body.password) {
      // Get user with password
      const user = await User.findById(req.user.id);
      user.password = req.body.password;
      await user.save();
    } else {
      // Update other fields
      await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
      });
    }

    // Get updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
