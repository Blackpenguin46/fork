import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
    typescript: true,
  });
} else {
  console.warn('STRIPE_SECRET_KEY is not defined - Stripe functionality will be disabled');
}

export { stripe };

export const getStripePublishableKey = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
    return null;
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};