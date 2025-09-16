import Advertiser from '../models/advertiser.model.js';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from './utils/passwordUtils.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


// Advertiser Registration
export const registerAdvertiser = async (req, res) => {
  const {
    firstName, lastName, email, password, country,
    telephone, nicNumber, companyName, companyPosition, companyWebsite, companyTelephone
  } = req.body;

  // Validate required fields
  if (
    !firstName || !lastName || !email || !password || !country || !telephone ||
    !nicNumber || !companyName || !companyPosition || !companyTelephone
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if advertiser already exists by email
    const existingAdvertiser = await Advertiser.findOne({ email });
    if (existingAdvertiser) {
      return res.status(400).json({ message: 'Advertiser already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Create a new advertiser
    const advertiser = new Advertiser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      country,
      telephone,
      nicNumber,
      companyName,
      companyPosition,
      companyWebsite,
      companyTelephone
    });

    // Save the advertiser to the database
    await advertiser.save();

    // Generate a JWT token for the advertiser
    const token = generateToken(advertiser._id, 'advertiser');


    // Respond with success message and token
    res.status(201).json({
      message: 'Advertiser registered successfully!',
      token,
    });

  } catch (error) {
    console.error("Error registering advertiser:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// For Advertiser Login
export const loginAdvertiser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {

  console.log('Login attempt for email:', email);
    console.log('Password received:', password);

    // Find the advertiser by email
    const advertiser = await Advertiser.findOne({ email });
    if (!advertiser) {
      console.log('Advertiser not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Stored hashed password:', advertiser.password);


    // Compare the entered password with the hashed password in the database using comparePassword function
    const isMatch = await comparePassword(password, advertiser.password);
   
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }
  

    // Generate JWT token
const token = generateToken(advertiser._id, 'advertiser');    console.log('Generated token:', token);

    // Respond with success message and token
    console.log('Login successful');
    res.status(200).json({
      message: 'Login successful',
      token,
    });

    // Additional log to confirm response is sent
    console.log('Response sent to frontend');

  } catch (error) {
    console.error("Error logging in advertiser:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET Advertiser Profile
export const getAdvertiserProfile = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.user.id).select('-password'); // exclude password

    if (!advertiser) {
      return res.status(404).json({ message: 'Advertiser not found' });
    }

    res.status(200).json(advertiser);
  } catch (error) {
    console.error("Error fetching advertiser profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Advertiser Profile (with optional profile picture upload)
export const updateAdvertiserProfile = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.user.id);
    if (!advertiser) {
      return res.status(404).json({ message: 'Advertiser not found' });
    }

    const fields = [
      'firstName','lastName','nicNumber','gender','country','telephone',
      'companyName','companyPosition','companyWebsite','companyTelephone'
    ];
    fields.forEach((f) => {
      if (typeof req.body[f] !== 'undefined') {
        advertiser[f] = req.body[f];
      }
    });

    // Handle profile picture if uploaded
    if (req.file) {
      const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const filename = `profilePicture-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(req.file.originalname)}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);

      advertiser.profilePictureUrl = `/uploads/${filename}`;
    }

    await advertiser.save();

    const sanitized = advertiser.toObject();
    delete sanitized.password;
    return res.status(200).json(sanitized);
  } catch (error) {
    console.error('Error updating advertiser profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};