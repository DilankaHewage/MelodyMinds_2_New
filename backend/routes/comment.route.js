import express from 'express';
import { 
  addComment, 
  getEventComments, 
  updateComment, 
  deleteComment, 
  getCommentCount 
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (authentication required)
router.post('/:eventId', protect, addComment); // Add comment
router.put('/:commentId', protect, updateComment); // Update comment
router.delete('/:commentId', protect, deleteComment); // Delete comment

// Public routes (no authentication required)
router.get('/:eventId', getEventComments); // Get all comments for an event
router.get('/:eventId/count', getCommentCount); // Get comment count

export default router;