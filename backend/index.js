// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Import CORS
import userRoutes from './routes/user.route.js';
import advertiserRoutes from './routes/advertiser.route.js';
import eventRoutes from './routes/event.route.js';
import commentRoutes from './routes/comment.route.js';
import likeRoutes from './routes/like.route.js';
import advertisementRoutes from './routes/advertisement.route.js';
import transactionRoutes from './routes/transaction.route.js';
import User from './models/user.model.js';

// Initialize express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS: allow localhost (dev) and your Vercel domain (prod)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        process.env.FRONTEND_URL, // e.g. https://melody-minds-2-new.vercel.app
      ].filter(Boolean);

      // Allow tools like Postman or server-to-server (no Origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Add routes
app.use('/api/events', eventRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to the database and ensure default admin
connectDB().then(async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin';
  if (adminEmail && adminPassword) {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } else {
    console.warn('Admin credentials not set in environment variables. Skipping admin creation.');
  }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/advertisers', advertiserRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/transactions', transactionRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});