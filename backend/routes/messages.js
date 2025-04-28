const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
router.post("/", protect, async (req, res, next) => {
  try {
    let { recipientId, subject, content } = req.body;

    // If the user is not an admin, force recipient to be an admin
    if (req.user.role !== "admin") {
      // Find the admin user
      const admin = await User.findOne({ role: "admin" });

      if (!admin) {
        return res.status(500).json({
          success: false,
          message: "No admin user found in the system",
        });
      }

      // Set the admin as the recipient
      recipientId = admin._id;
    }
    // If user is admin, validate that recipient exists
    else if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: "Recipient not found",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required",
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      subject,
      content,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/inbox
// @desc    Get all received messages
// @access  Private
router.get("/inbox", protect, async (req, res, next) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate("sender", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/sent
// @desc    Get all sent messages
// @access  Private
router.get("/sent", protect, async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate("recipient", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/:id
// @desc    Get single message
// @access  Private
router.get("/:id", protect, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name role")
      .populate("recipient", "name role");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Make sure user is the sender or recipient
    if (
      message.sender._id.toString() !== req.user.id &&
      message.recipient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this message",
      });
    }

    // If user is recipient and message is unread, mark as read
    if (message.recipient._id.toString() === req.user.id && !message.read) {
      message.read = true;
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Make sure user is the sender or recipient
    if (
      message.sender.toString() !== req.user.id &&
      message.recipient.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    // Use deleteOne() instead of remove()
    await message.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
