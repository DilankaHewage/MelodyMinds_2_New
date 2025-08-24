import Comment from '../models/comment.model.js';
import Event from '../models/event.model.js';

// Add a comment to an event
export const addComment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    // Create new comment
    const newComment = new Comment({
      event: eventId,
      user: userId,
      content: content.trim()
    });

    await newComment.save();

    // Populate user info for response
    await newComment.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get all comments for an event
export const getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const comments = await Comment.find({
      event: eventId,
      isActive: true
    })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error("Error getting event comments:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Update a comment (only by the user who created it)
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user owns this comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own comments"
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    // Update the comment
    comment.content = content.trim();
    await comment.save();

    // Populate user info for response
    await comment.populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment
    });
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Delete a comment (only by the user who created it)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user owns this comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments"
      });
    }

    // Soft delete - mark as inactive
    comment.isActive = false;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get comment count for an event
export const getCommentCount = async (req, res) => {
  try {
    const { eventId } = req.params;

    const commentCount = await Comment.countDocuments({
      event: eventId,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: { commentCount }
    });
  } catch (error) {
    console.error("Error getting comment count:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

