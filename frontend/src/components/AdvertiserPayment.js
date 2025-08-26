import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './AdvertiserPayment.css';
//....

const stripePromise = loadStripe('pk_test_51RziSyQ4nk12oMGjPILdJei6eF1ALU48GTj1yfEWgemGnzyVPWGmtBLiFpngRB4eT2emW5LkC0Lz0P2GZoCweymS00HWXyZgEX');

const PaymentForm = ({ amount, onSuccess, onError, onCancel, eventData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Get token from localStorage
      const advertiserToken = localStorage.getItem('token');
      
      // Create payment intent for advertiser publication
      const { data } = await axios.post(
        'http://localhost:5000/api/transactions/create-advertiser-payment-intent',
        {
          amount: amount,
          eventData: eventData
        },
        {
          headers: {
            Authorization: `Bearer ${advertiserToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { client_secret } = data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        setError(result.error.message);
        onError?.(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Confirm payment with backend and publish event
        await axios.post(
          'http://localhost:5000/api/transactions/confirm-advertiser-payment',
          {
            paymentIntentId: result.paymentIntent.id,
            eventData: eventData
          },
          {
            headers: {
              Authorization: `Bearer ${advertiserToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        onSuccess?.(result.paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="advertiser-payment-form">
      <div className="payment-amount">
        <h3>Publication Fee: Rs. {amount.toLocaleString()}</h3>
        <p>This payment is required to publish your event and make it visible to users.</p>
      </div>

      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {error && <div className="payment-error">{error}</div>}

      <div className="payment-buttons">
        <button 
          type="button" 
          onClick={onCancel}
          className="cancel-button"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="pay-button"
        >
          {isProcessing ? 'Processing...' : `Pay Rs. ${amount.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
};

const AdvertiserPayment = ({ amount, onSuccess, onError, onCancel, eventData }) => {
  return (
    <div className="advertiser-payment-modal">
      <div className="payment-modal-content">
        <div className="payment-header">
          <h2>Event Publication Payment</h2>
          <p>Complete payment to publish your event</p>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
            eventData={eventData}
          />
        </Elements>
      </div>
    </div>
  );
};

export default AdvertiserPayment;
