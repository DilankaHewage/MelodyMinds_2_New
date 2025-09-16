// transaction.controller.js

import Stripe from 'stripe';
import Transaction from '../models/transaction.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import Advertiser from '../models/advertiser.model.js';
import { generateReceiptId, sendReceiptEmail } from '../services/emailService.js';

// Initialize Stripe with your secret key (lazy initialization)
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// ------------------------------
// Create Payment Intent (Ticket Purchase)
// ------------------------------
export const createPaymentIntent = async (req, res) => {
  try {
    const { eventId, numberOfTickets, currency = 'usd' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !numberOfTickets || numberOfTickets < 1 || numberOfTickets > 5) {
      return res.status(400).json({
        message: 'Invalid input. Number of tickets must be between 1 and 5.'
      });
    }

    // Fetch event details
    const event = await Event.findById(eventId).populate('advertiser');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.advertiser) {
      return res.status(400).json({
        message: 'Event advertiser not found. Please contact support.'
      });
    }

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total amount
    const ticketPrice = parseFloat(event.ticketPrice);
    const availableTickets = parseInt(event.ticketLink) || 0;

    if (numberOfTickets > availableTickets) {
      return res.status(400).json({
        message: `Only ${availableTickets} tickets are available. You requested ${numberOfTickets} tickets.`
      });
    }

    let totalAmount = ticketPrice * numberOfTickets;

    // Convert to smallest unit (Stripe expects cents)
    totalAmount = Math.round(totalAmount * 100);

    // Create payment intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency.toLowerCase(),
      metadata: {
        eventId: eventId,
        userId: userId,
        numberOfTickets: numberOfTickets.toString(),
        ticketPrice: event.ticketPrice.toString()
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      event: eventId,
      advertiser: event.advertiser._id,
      transactionType: 'ticket_purchase',
      numberOfTickets,
      ticketPrice,
      totalAmount: totalAmount / 100, // store actual amount
      currency: currency.toUpperCase(),
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      customerDetails: {
        name: user.name,
        email: user.email
      }
    });

    await transaction.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
      amount: totalAmount,
      currency: currency.toLowerCase()
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// ------------------------------
// Confirm Ticket Purchase Payment
// ------------------------------
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, transactionId } = req.body;

    // Retrieve payment intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find transaction
    const transaction = await Transaction.findById(transactionId).populate('event user');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.paymentStatus = paymentIntent.status;

    if (paymentIntent.status === 'succeeded') {
      // Generate receipt ID
      const receiptId = generateReceiptId();
      transaction.receiptId = receiptId;

      // Update event tickets
      const event = await Event.findById(transaction.event._id);
      if (event) {
        const currentAvailableTickets = parseInt(event.ticketLink) || 0;
        const newAvailableTickets = Math.max(0, currentAvailableTickets - transaction.numberOfTickets);
        event.ticketLink = newAvailableTickets.toString();
        await event.save();
        console.log(`✅ Updated event ${event._id} tickets: ${currentAvailableTickets} → ${newAvailableTickets}`);
      }

      // Send receipt email
      try {
        await sendReceiptEmail({
          receiptId,
          userEmail: transaction.customerDetails.email,
          userName: transaction.customerDetails.name,
          numberOfTickets: transaction.numberOfTickets,
          totalAmount: transaction.totalAmount,
          currency: transaction.currency,
          eventName: transaction.event.title,
          eventDate: transaction.event.date,
          eventTime: transaction.event.time,
          eventVenue: transaction.event.venue
        });
      } catch (emailError) {
        console.error('⚠️ Failed to send receipt email:', emailError);
      }
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      paymentStatus: paymentIntent.status,
      transaction: transaction.toObject()
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// ------------------------------
// Get User Transactions
// ------------------------------
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId })
      .populate('event', 'title date venue')
      .populate('advertiser', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// ------------------------------
// Get User Purchase History
// ------------------------------
export const getUserPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      user: userId,
      transactionType: 'ticket_purchase',
      paymentStatus: 'succeeded'
    })
      .populate('event', 'title date time venue district poster')
      .populate('advertiser', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase history',
      error: error.message
    });
  }
};

// ------------------------------
// Get Advertiser Transactions
// ------------------------------
export const getAdvertiserTransactions = async (req, res) => {
  try {
    const advertiserId = req.user.id;

    const transactions = await Transaction.find({ advertiser: advertiserId })
      .populate('event', 'title date venue')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching advertiser transactions:', error);
    res.status(500).json({
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// ------------------------------
// Create Payment Intent (Advertiser - Event Publication)
// ------------------------------
export const createAdvertiserPaymentIntent = async (req, res) => {
  try {
    const { amount, eventData } = req.body;
    const advertiserId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (!eventData || !eventData.title || !eventData.ticketPrice) {
      return res.status(400).json({ message: 'Event data is required for publication payment' });
    }

    const advertiser = await Advertiser.findById(advertiserId);
    if (!advertiser) {
      return res.status(404).json({ message: 'Advertiser not found' });
    }

    const totalAmountInCents = Math.round(amount * 100);

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: 'usd',
      metadata: {
        advertiserId: advertiserId.toString(),
        eventTitle: eventData.title,
        eventTicketPrice: eventData.ticketPrice.toString(),
        paymentType: 'event_publication'
      }
    });

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmountInCents,
      currency: 'usd'
    });

  } catch (error) {
    console.error('Error creating advertiser payment intent:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// ------------------------------
// Confirm Advertiser Payment & Publish Event
// ------------------------------
export const confirmAdvertiserPayment = async (req, res) => {
  try {
    const { paymentIntentId, eventData } = req.body;
    const advertiserId = req.user._id;

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Create event with published status (including location)
    const { title, description, date, time, venue, district, artist, ticketPrice, ticketLink, poster, lat, lng } = eventData;

    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      district,
      artist,
      ticketPrice,
      ticketLink,
      poster: poster || eventData.posterUrl,
      advertiser: advertiserId,
      isActive: true,
      isPublished: true,
      publicationPaymentId: paymentIntentId,
      lat,
      lng
    });

    const savedEvent = await event.save();

    // Create transaction for publication payment
    const publicationTransaction = new Transaction({
      advertiser: advertiserId,
      event: savedEvent._id,
      transactionType: 'publication',
      numberOfTickets: 0,
      ticketPrice: parseFloat(ticketPrice),
      totalAmount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: 'succeeded',
      customerDetails: {
        name: req.user.companyName || req.user.name,
        email: req.user.companyEmail || req.user.email
      }
    });

    await publicationTransaction.save();

    res.status(201).json({
      success: true,
      message: 'Payment successful and event published',
      event: savedEvent,
      transaction: publicationTransaction
    });

  } catch (error) {
    console.error('Error confirming advertiser payment:', error);
    res.status(500).json({
      message: 'Failed to confirm payment and publish event',
      error: error.message
    });
  }
};
