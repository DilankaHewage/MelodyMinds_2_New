import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/user.model.js';
import { registerUser, loginUser, getUserById } from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to protect routes
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// IMPORTANT: Put specific routes BEFORE parameterized routes
// Protected route to fetch user profile
router.get('/profile', protect, async (req, res) => {
  try {
    console.log('=== PROFILE REQUEST DEBUG ===');
    console.log('User ID from token:', req.user.id);
    console.log('User object:', req.user);
    
    // Fetch user details using the user ID from the token
    const user = await User.findById(req.user.id).select('-password');
    console.log('User found in database:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only the necessary fields
    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      profilePictureUrl: user.profilePictureUrl || '',
      events: [], // Add events if needed
    };
    
    console.log('Profile data to send:', profileData);
    console.log('=== END PROFILE DEBUG ===');
    
    res.json(profileData);
  } catch (error) {
    console.error('=== PROFILE ERROR ===');
    console.error('Error fetching user profile:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END PROFILE ERROR ===');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected route to update user profile
router.put('/profile', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;

    // Handle profile picture upload
    if (req.file) {
      const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `userProfile-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(req.file.originalname)}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      user.profilePictureUrl = `/uploads/${filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePictureUrl: updatedUser.profilePictureUrl || '',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: Get all users
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (protected route) - PUT THIS AFTER SPECIFIC ROUTES
router.get('/:id', protect, getUserById);

// Admin-only: Delete a user
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: Update a user
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;