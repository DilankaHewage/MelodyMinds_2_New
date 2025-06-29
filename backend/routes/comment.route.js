import express from 'express';
import { 
  createComment, 
  getEventComments, 
  updateComment, 
  deleteComment, 
  getEventCommentCount 
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all comments for an event (public route)
router.get('/event/:eventId', getEventComments);
// Get comment count for an event (public route)
router.get('/event/:eventId/count', getEventCommentCount);

// Protected routes (require authentication)
router.post('/', protect, createComment);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router;