import express from 'express';
import { 
  createPaymentIntent, 
  confirmPayment, 
  getUserTransactions, 
  getAdvertiserTransactions,
  createAdvertiserPaymentIntent,
  confirmAdvertiserPayment
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

// Create payment intent for advertiser event publication
router.post('/create-advertiser-payment-intent', protect, createAdvertiserPaymentIntent);

// Confirm advertiser payment and publish event
router.post('/confirm-advertiser-payment', protect, confirmAdvertiserPayment);

export default router;
