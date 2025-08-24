import express from 'express';
import { 
  createPaymentIntent, 
  confirmPayment, 
  getUserTransactions, 
  getAdvertiserTransactions 
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', protect, confirmPayment);

// Get user transactions
router.get('/user-transactions', protect, getUserTransactions);

// Get advertiser transactions
router.get('/advertiser-transactions', protect, getAdvertiserTransactions);

export default router;
