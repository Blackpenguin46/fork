import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
let stripeInstance: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
    typescript: true,
  });
} else {
  console.warn('STRIPE_SECRET_KEY is not defined - Stripe functionality will be disabled');
}

// Export stripe with proper type checking
export const stripe = stripeInstance;

// Helper function to get Stripe instance with error handling
export function getStripe(): Stripe {
  if (!stripeInstance) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripeInstance;
}

export const getStripePublishableKey = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
    return null;
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};