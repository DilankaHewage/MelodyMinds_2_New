import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; // Import CORS
import userRoutes from './routes/user.route.js';
import advertiserRoutes from './routes/advertiser.route.js';
import eventRoutes from './routes/event.route.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing) for frontend communication
app.use(cors({
  origin: 'http://localhost:3000', // Change this if your frontend is hosted elsewhere
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));


// Add this line to include event routes
app.use('/api/events', eventRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // Updated to omit deprecated options
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`); // Log the error message
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/advertisers', advertiserRoutes);

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

