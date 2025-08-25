import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Ensure the User model is imported
import Advertiser from '../models/advertiser.model.js'; // Ensure the Advertiser model is imported


export const protect = async (req, res, next) => {
 let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { id, userType } = decoded;
      
      // DEBUG: Log the decoded token information
      console.log('=== AUTH MIDDLEWARE DEBUG ===');
      console.log('Decoded token ID:', id);
      console.log('Decoded token userType:', userType);
      console.log('Token:', token.substring(0, 20) + '...');

      if (userType === 'user') {
        req.user = await User.findById(id).select('-password');
        req.user.userType = 'user'; // Explicitly set userType
        console.log('User found:', req.user ? 'Yes' : 'No');
        if (req.user) {
          console.log('User ID:', req.user._id);
          console.log('User Type set to:', req.user.userType);
        }
      } else if (userType === 'advertiser') {
        req.user = await Advertiser.findById(id).select('-password');
        req.user.userType = 'advertiser'; // Explicitly set userType
        console.log('Advertiser found:', req.user ? 'Yes' : 'No');
        if (req.user) {
          console.log('Advertiser ID:', req.user._id);
          console.log('Advertiser Type set to:', req.user.userType);
        }
      } else {
        console.log('Invalid userType:', userType);
        return res.status(401).json({ message: 'Not authorized, invalid user type' });
      }

      if (!req.user) {
        console.log('User not found in database');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      console.log('=== END AUTH DEBUG ===');
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};