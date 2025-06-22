import express from 'express';
import { 
  createComment, 
  getEventComments, 
  updateComment, 
  deleteComment 
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all comments for an event (public route)
router.get('/event/:eventId', getEventComments);

// Protected routes (require authentication)
router.post('/', protect, createComment);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router; 