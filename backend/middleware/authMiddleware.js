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

      if (userType === 'user') {
        req.user = await User.findById(id).select('-password');
      } else if (userType === 'advertiser') {
        req.user = await Advertiser.findById(id).select('-password');
      } else {
        return res.status(401).json({ message: 'Not authorized, invalid user type' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

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