import jwt from 'jsonwebtoken'; // Importing jsonwebtoken
import User from '../models/user.model.js';
import { comparePassword } from './utils/passwordUtils.js';

// Generate JWT Token (assuming a JWT secret is stored in environment variables)
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Debug: Log the received user data
    console.log('Registering user with email:', email);
    console.log('Plain password:', password); // Log the plain password
    
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user instance
    const user = new User({
      name,
      email,
      password,
    });

    // Save the user to the database
    await user.save();

    // Debug: Log user details after saving to DB
    console.log('User registered successfully:', user);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// User Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Debug: Log the received login data
    console.log('Login attempt for email:', email);
    console.log('Password received:', password); // Log the received password

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email' });
    }

    // Debug: Log the stored password hash (for testing purposes, remove in production)
    console.log('Stored hashed password:', user.password);

    // Compare the entered password with the hashed password in the database using comparePassword function
    const isMatch = await comparePassword(password, user.password);
    console.log('Password match result:', isMatch); // Debug: Log the result of the password comparison

    if (!isMatch) {
      console.log('Invalid password attempt for email:', email);
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = generateToken(user._id, 'user');


    // Debug: Log the generated token (for testing purposes, remove in production)
    console.log('Generated JWT token:', token);

    // Respond with success message and token
    res.status(200).json({
      message: 'Login successful',
      token,
    });

  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch user dashboard details
export const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};