import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // User is required only for ticket purchases, not for publication payments
      return this.transactionType !== 'publication';
    }
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
  transactionType: {
    type: String,
    enum: ['ticket_purchase', 'publication'],
    default: 'ticket_purchase'
  },
  numberOfTickets: {
    type: Number,
    required: function() {
      // numberOfTickets is required only for ticket purchases
      return this.transactionType === 'ticket_purchase';
    },
    validate: {
      validator: function(value) {
        // For publication payments, any value is valid
        if (this.transactionType === 'publication') {
          return true;
        }
        // For ticket purchases, value must be between 1 and 5
        return value >= 1 && value <= 5;
      },
      message: function(props) {
        if (this.transactionType === 'ticket_purchase') {
          return 'Number of tickets must be between 1 and 5 for ticket purchases';
        }
        return 'Invalid number of tickets';
      }
    },
    default: 0
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
