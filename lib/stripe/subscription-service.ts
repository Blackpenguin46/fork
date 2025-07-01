import { stripe } from './stripe-client';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic cybersecurity learning',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      'Access to community resources',
      'Basic learning content',
      'Limited bookmarks',
      'Basic progress tracking'
    ],
    stripePriceId: '',
    stripeProductId: ''
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Unlock premium cybersecurity content and features',
    price: 20,
    currency: 'usd',
    interval: 'month',
    features: [
      'Full access to all content',
      'Advanced learning paths',
      'Unlimited bookmarks',
      'Advanced progress analytics',
      'AI-powered recommendations',
      'Expert community access',
      'Certificate generation',
      'Priority support'
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID || ''
  }
];

export class SubscriptionService {
  async createCustomer(user: {
    id: string;
    email: string;
    full_name?: string;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });

      // Store Stripe customer ID in user profile
      // Use client-side supabase instance
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id);

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async getOrCreateCustomer(user: {
    id: string;
    email: string;
    full_name?: string;
    stripe_customer_id?: string;
  }): Promise<Stripe.Customer> {
    if (user.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(user.stripe_customer_id);
        if (customer && !customer.deleted) {
          return customer as Stripe.Customer;
        }
      } catch (error) {
        console.warn('Stripe customer not found, creating new one:', error);
      }
    }

    return this.createCustomer(user);
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan || plan.id === 'free') {
        throw new Error('Invalid plan selected');
      }

      // Get user and customer
      // Use client-side supabase instance
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      const customer = await this.getOrCreateCustomer(user);

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
        subscription_data: {
          metadata: {
            user_id: userId,
            plan_id: planId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create customer portal session');
    }
  }

  async getUserSubscription(userId: string): Promise<{
    subscription: Stripe.Subscription | null;
    plan: SubscriptionPlan;
    status: string;
  }> {
    try {
      // Use client-side supabase instance
      const { data: user } = await supabase
        .from('profiles')
        .select('stripe_customer_id, subscription_status, subscription_plan')
        .eq('id', userId)
        .single();

      if (!user?.stripe_customer_id) {
        return {
          subscription: null,
          plan: SUBSCRIPTION_PLANS[0], // Free plan
          status: 'inactive'
        };
      }

      // Get active subscriptions for customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 1,
      });

      const activeSubscription = subscriptions.data[0];
      
      if (!activeSubscription) {
        return {
          subscription: null,
          plan: SUBSCRIPTION_PLANS[0], // Free plan
          status: 'inactive'
        };
      }

      // Determine plan based on subscription
      const priceId = activeSubscription.items.data[0]?.price.id;
      const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId) || SUBSCRIPTION_PLANS[0];

      return {
        subscription: activeSubscription,
        plan,
        status: activeSubscription.status
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return {
        subscription: null,
        plan: SUBSCRIPTION_PLANS[0],
        status: 'error'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return subscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  async updateUserSubscriptionStatus(
    userId: string,
    subscription: Stripe.Subscription
  ): Promise<void> {
    try {
      // Use client-side supabase instance
      
      // Determine plan
      const priceId = subscription.items.data[0]?.price.id;
      const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId);
      
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          subscription_plan: plan?.id || 'free',
          subscription_id: subscription.id,
          subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user subscription status:', error);
      throw new Error('Failed to update subscription status');
    }
  }

  async createPromoCode(
    couponId: string,
    code: string,
    options?: {
      active?: boolean;
      expiresAt?: number;
      maxRedemptions?: number;
      restrictions?: {
        firstTimeTransaction?: boolean;
        minimumAmount?: number;
        minimumAmountCurrency?: string;
      };
    }
  ): Promise<Stripe.PromotionCode> {
    try {
      const promoCode = await stripe.promotionCodes.create({
        coupon: couponId,
        code,
        active: options?.active ?? true,
        expires_at: options?.expiresAt,
        max_redemptions: options?.maxRedemptions,
        restrictions: options?.restrictions as any,
      });

      return promoCode;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw new Error('Failed to create promo code');
    }
  }

  async createCoupon(
    percentOff: number,
    duration: 'forever' | 'once' | 'repeating',
    durationInMonths?: number
  ): Promise<Stripe.Coupon> {
    try {
      const coupon = await stripe.coupons.create({
        percent_off: percentOff,
        duration,
        duration_in_months: duration === 'repeating' ? durationInMonths : undefined,
        currency: 'usd',
      });

      return coupon;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw new Error('Failed to create coupon');
    }
  }

  getPlanByPriceId(priceId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId) || null;
  }

  isPremiumPlan(planId: string): boolean {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    return plan ? plan.price > 0 : false;
  }
}