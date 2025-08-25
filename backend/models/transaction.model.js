import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertiser',
    required: true
  },
  numberOfTickets: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ticketPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'LKR'],
    default: 'LKR'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  customerDetails: {
    name: String,
    email: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
