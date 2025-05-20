import express from 'express';
import { registerAdvertiser, loginAdvertiser, getAdvertiserProfile } from '../controllers/advertiser.controller.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

// POST /register (Advertiser Registration)
router.post('/register', registerAdvertiser);

// POST /login (Advertiser Login)
router.post('/login', loginAdvertiser);

router.get('/profile', protect, getAdvertiserProfile);

export default router;
