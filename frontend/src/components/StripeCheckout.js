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
  userInfo 
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

  // Remove the automatic useEffect and create payment intent only when needed
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
    
    console.log('Form submitted - checking conditions...');
    console.log('Stripe available:', !!stripe);
    console.log('Elements available:', !!elements);
    console.log('Payment initialized:', paymentInitialized);
    console.log('Client secret:', !!clientSecret);

    if (!stripe || !elements || !paymentInitialized || !clientSecret) {
      console.log('Missing requirements for payment processing');
      onError('Payment system not ready. Please try refreshing the page.');
      return;
    }

    setLoading(true);
    console.log('Starting payment processing...');

    const cardElement = elements.getElement(CardElement);
    console.log('Card element:', !!cardElement);

    // Validate card input
    if (!cardElement._complete) {
      console.log('Card input incomplete');
      onError('Please complete your card information.');
      setLoading(false);
      return;
    }

    try {
      console.log('Confirming card payment with client secret:', clientSecret);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentDetails.name,
            email: paymentDetails.email,
          },
        },
      });

      console.log('Payment result:', { error, paymentIntent });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, confirming on backend...');
        
        // Confirm payment on backend
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
        
        console.log('Backend confirmation response:', confirmResponse.data);

        onSuccess({
          paymentIntentId: paymentIntent.id,
          transactionId,
          amount: totalAmount,
          tickets: ticketQuantity,
          remainingTickets: confirmResponse.data.transaction.remainingTickets
        });
      } else {
        console.log('Payment status:', paymentIntent.status);
        onError(`Payment ${paymentIntent.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Payment error:', error);
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
          // Show Initialize Payment button first
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
          // Show card input and payment button after initialization
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
