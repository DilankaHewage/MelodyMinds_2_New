import express from 'express';
import { sendReceiptEmail, generateReceiptId } from '../services/emailService.js';

import { 
  createPaymentIntent, 
  confirmPayment, 
  getUserTransactions, 
  getAdvertiserTransactions,
  createAdvertiserPaymentIntent,
  confirmAdvertiserPayment,
  getUserPurchaseHistory
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

// Purchase history
router.get('/purchase-history', protect, getUserPurchaseHistory);



router.post('/send-receipt-email', protect, async (req, res) => {
  try {
    // Generate a receipt ID if not provided
    const receiptId = req.body.receiptId || generateReceiptId();

    await sendReceiptEmail({
      receiptId,
      userEmail: req.body.userEmail,
      userName: req.body.userName,
      numberOfTickets: req.body.numberOfTickets,
      totalAmount: req.body.totalAmount,
      currency: req.body.currency,
      eventName: req.body.eventName,
      eventDate: req.body.eventDate,
      eventTime: req.body.eventTime,
      eventVenue: req.body.eventVenue
    });

    res.status(200).json({ message: 'Receipt email sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send receipt email.' });
  }
});


export default router;

