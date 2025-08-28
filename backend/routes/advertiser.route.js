import express from 'express';
import multer from 'multer';
import { registerAdvertiser, loginAdvertiser, getAdvertiserProfile, updateAdvertiserProfile } from '../controllers/advertiser.controller.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });

// POST /register (Advertiser Registration)
router.post('/register', registerAdvertiser);

// POST /login (Advertiser Login)
router.post('/login', loginAdvertiser);

router.get('/profile', protect, getAdvertiserProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateAdvertiserProfile);

export default router;
