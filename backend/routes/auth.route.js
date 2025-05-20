import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Advertiser from '../models/advertiser.model.js';

const router = express.Router();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup for User
router.post('/signup/user', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = generateToken(newUser._id);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Signup for Advertiser
router.post('/signup/advertiser', async (req, res) => {
  const {
    firstName, lastName, email, password, country,
    telephone, nicNumber, companyName, position, companyWebsite, companyTelephone,
  } = req.body;

  try {
    const advertiserExists = await Advertiser.findOne({ email });
    if (advertiserExists) {
      return res.status(400).json({ message: 'Advertiser already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdvertiser = new Advertiser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      country,
      telephone,
      nicNumber,
      companyName,
      position,
      companyWebsite,
      companyTelephone,
    });

    await newAdvertiser.save();
    const token = generateToken(newAdvertiser._id);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login for both User and Advertiser
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    let advertiser = await Advertiser.findOne({ email });

    if (!user && !advertiser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userToCheck = user || advertiser;
    const isMatch = await bcrypt.compare(password, userToCheck.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(userToCheck._id);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
