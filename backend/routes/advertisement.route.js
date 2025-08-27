import express from 'express';
import { 
  debugUserInfo,
  debugAllAdvertisements,
  createAdvertisement, 
  getAllAdvertisements, 
  getAdvertisementsByAdvertiser, 
  getAdvertisementById, 
  updateAdvertisement, 
  deleteAdvertisement 
} from '../controllers/advertisement.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required) - for users to view all advertisements
router.get('/', getAllAdvertisements); // Anyone can view all advertisements
router.get('/:id', getAdvertisementById); // Anyone can view specific advertisement

// Protected routes (authentication required) - for advertisers only
router.get('/debug/user-info', protect, debugUserInfo); // Debug endpoint to test access control
router.get('/debug/all-ads', protect, debugAllAdvertisements); // Debug endpoint to see all ads (for testing)
router.post('/', protect, createAdvertisement); // Only advertisers can create
router.get('/advertiser/my-ads', protect, getAdvertisementsByAdvertiser); // Advertisers can view ONLY their own ads
router.put('/:id', protect, updateAdvertisement); // Advertisers can update their own ads
router.delete('/:id', protect, deleteAdvertisement); // Advertisers can delete their own ads

export default router;
