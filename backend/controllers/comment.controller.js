import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { content, eventId } = req.body;
    const userId = req.user.id;

    if (!content || !eventId) {
      return res.status(400).json({ message: 'Content and event ID are required' });
    }

    // Get user name for the comment
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = new Comment({
      content,
      user: userId,
      event: eventId,
      userName: user.name
    });

    const savedComment = await comment.save();
    
    // Populate user info for response
    await savedComment.populate('user', 'name email');
    
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
};

// Get all comments for an event
export const getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const comments = await Comment.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user owns this comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    const updatedComment = await comment.save();
    
    await updatedComment.populate('user', 'name email');
    
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};



   
// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user owns this comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}; 

