import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import './StripeCheckout.css';

const stripePromise = loadStripe('pk_test_51RziSyQ4nk12oMGjPILdJei6eF1ALU48GTj1yfEWgemGnzyVPWGmtBLiFpngRB4eT2emW5LkC0Lz0P2GZoCweymS00HWXyZgEX');

const CheckoutForm = ({ 
  eventId, 
  ticketQuantity, 
  totalAmount, 
  currency, 
  onSuccess, 
  onError, 
  onCancel,
  userInfo,
  eventName,
  eventDate,
  eventTime,
  eventVenue
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    selectedCurrency: currency || 'LKR'
  });

  // Send receipt email regardless of payment status
  const sendReceiptEmail = async () => {
    const token = localStorage.getItem('userToken');
    try {
      await axios.post(
        'https://your-vercel-domain/api/transactions/send-receipt-email', // Replace with your deployed backend URL
        {
          userEmail: paymentDetails.email,
          userName: paymentDetails.name,
          numberOfTickets: ticketQuantity,
          totalAmount: getDisplayAmount(),
          currency: paymentDetails.selectedCurrency,
          eventName: eventName,
          eventDate: eventDate,
          eventTime: eventTime,
          eventVenue: eventVenue
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Receipt email sent!');
    } catch (error) {
      console.error('Failed to send receipt email:', error);
    }
  };

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        'http://localhost:5000/api/transactions/create-payment-intent',
        {
          eventId,
          numberOfTickets: ticketQuantity,
          currency: paymentDetails.selectedCurrency
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setClientSecret(response.data.clientSecret);
      setTransactionId(response.data.transactionId);
      setPaymentInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      onError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send receipt email regardless of payment status
    await sendReceiptEmail();

    // If you want to skip Stripe payment, you can return here.
    // return;

    if (!stripe || !elements || !paymentInitialized || !clientSecret) {
      onError('Payment system not ready. Please try refreshing the page.');
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement._complete) {
      onError('Please complete your card information.');
      setLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentDetails.name,
            email: paymentDetails.email,
          },
        },
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        const token = localStorage.getItem('userToken');
        const confirmResponse = await axios.post(
          'http://localhost:5000/api/transactions/confirm-payment',
          {
            paymentIntentId: paymentIntent.id,
            transactionId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        onSuccess({
          paymentIntentId: paymentIntent.id,
          transactionId,
          amount: totalAmount,
          tickets: ticketQuantity,
          remainingTickets: confirmResponse.data.transaction.remainingTickets
        });
      } else {
        onError(`Payment ${paymentIntent.status}. Please try again.`);
      }
    } catch (error) {
      onError('Payment failed. Please try again.');
    }

    setLoading(false);
  };

  const handleCurrencyChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      selectedCurrency: e.target.value
    });
  };

  const getDisplayAmount = () => {
    if (paymentDetails.selectedCurrency === 'USD') {
      return (totalAmount / 200).toFixed(2); // Convert LKR to USD (approximate rate)
    }
    return totalAmount.toFixed(2);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-checkout-form">
      <div className="payment-details">
        <h3>Payment Details</h3>
        
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={paymentDetails.name}
            onChange={(e) => setPaymentDetails({...paymentDetails, name: e.target.value})}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={paymentDetails.email}
            onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={paymentDetails.selectedCurrency}
            onChange={handleCurrencyChange}
            className="form-input"
            disabled={paymentInitialized}
          >
            <option value="LKR">LKR (Sri Lankan Rupees)</option>
            <option value="USD">USD (US Dollars)</option>
          </select>
        </div>

        <div className="amount-display">
          <p><strong>Total Amount: {paymentDetails.selectedCurrency} {getDisplayAmount()}</strong></p>
          <p>Tickets: {ticketQuantity}</p>
        </div>

        {!paymentInitialized ? (
          <div className="form-actions">
            <button
              type="button"
              onClick={createPaymentIntent}
              disabled={loading}
              className="pay-button"
            >
              {loading ? 'Initializing...' : 'Initialize Payment'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="payment-step-separator">
              <p>✅ Payment initialized successfully! Enter your card details below.</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="card-element">Card Details</label>
              <div className="card-element-container">
                <CardElement
                  id="card-element"
                  options={cardElementOptions}
                />
              </div>
            </div>

            <div className="test-card-info">
              <p><strong>Test Card Numbers:</strong></p>
              <p>• 4242 4242 4242 4242 (Visa)</p>
              <p>• 4000 0000 0000 0002 (Visa - Declined)</p>
              <p>• Use any future date for expiry and any 3-digit CVC</p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={!stripe || loading || !paymentDetails.name || !paymentDetails.email}
                className="pay-button"
                onClick={() => console.log('Pay button clicked')}
              >
                {loading ? 'Processing Payment...' : `Pay ${paymentDetails.selectedCurrency} ${getDisplayAmount()}`}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
};

const StripeCheckout = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;