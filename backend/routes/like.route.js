import express from 'express';
import { 
  toggleLike, 
  getLikeCount, 
  checkUserLike, 
  getEventLikes 
} from '../controllers/like.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (authentication required)
router.post('/:eventId', protect, toggleLike); // Toggle like/unlike
router.get('/:eventId/check', protect, checkUserLike); // Check if user liked
router.get('/:eventId/all', getEventLikes); // Get all likes for debugging

// Public routes (no authentication required)
router.get('/:eventId/count', getLikeCount); // Get like count

export default router;
