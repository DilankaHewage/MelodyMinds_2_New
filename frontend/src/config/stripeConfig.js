import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key (test mode)
const stripePromise = loadStripe('pk_test_51RziSyQ4nk12oMGjPILdJei6eF1ALU48GTj1yfEWgemGnzyVPWGmtBLiFpngRB4eT2emW5LkC0Lz0P2GZoCweymS00HWXyZgEX');

export default stripePromise;
