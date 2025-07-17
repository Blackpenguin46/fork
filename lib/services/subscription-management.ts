/**
 * Comprehensive Subscription Management Service
 * Handles all subscription-related operations with Stripe integration
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  priceId: string
  features: string[]
  limits: {
    resources: number | 'unlimited'
    learningPaths: number | 'unlimited'
    communityAccess: boolean
    premiumContent: boolean
    analytics: boolean
    support: 'basic' | 'priority' | 'dedicated'
  }
}

export interface UserSubscription {
  id: string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  tier: 'free' | 'premium' | 'enterprise'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialStart?: Date
  trialEnd?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PaymentHistory {
  id: string
  userId: string
  stripeInvoiceId: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  description: string
  invoiceUrl?: string
  createdAt: Date
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    features: [
      'Community access',
      'Basic insights',
      'Limited resources (50/month)',
      'Public learning paths'
    ],
    limits: {
      resources: 50,
      learningPaths: 3,
      communityAccess: true,
      premiumContent: false,
      analytics: false,
      support: 'basic'
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 20,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Full academy access',
      'Premium content',
      'Advanced features',
      'All learning paths',
      'Progress analytics',
      'Priority support'
    ],
    limits: {
      resources: 'unlimited',
      learningPaths: 'unlimited',
      communityAccess: true,
      premiumContent: true,
      analytics: true,
      support: 'priority'
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Everything in Premium',
      'Custom learning paths',
      'Team management',
      'Advanced analytics',
      'API access',
      'Dedicated support'
    ],
    limits: {
      resources: 'unlimited',
      learningPaths: 'unlimited',
      communityAccess: true,
      premiumContent: true,
      analytics: true,
      support: 'dedicated'
    }
  }
}

export class SubscriptionManagementService {
  /**
   * Create a new Stripe customer
   */
  static async createCustomer(userId: string, email: string, name?: string): Promise<Stripe.Customer> {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    })

    // Store customer ID in database
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)

    return customer
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    customerId?: string
  ): Promise<Stripe.Checkout.Session> {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId
      },
      subscription_data: {
        metadata: {
          userId
        }
      }
    }

    if (customerId) {
      sessionConfig.customer = customerId
    } else {
      // Get user email for new customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      if (profile) {
        sessionConfig.customer_email = profile.email
      }
    }

    return await stripe.checkout.sessions.create(sessionConfig)
  }

  /**
   * Create a customer portal session
   */
  static async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      userId: data.user_id,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      status: data.status,
      tier: data.tier,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      trialStart: data.trial_start ? new Date(data.trial_start) : undefined,
      trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  /**
   * Update subscription in database
   */
  static async updateSubscription(subscriptionData: Partial<UserSubscription>): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: subscriptionData.userId,
        stripe_customer_id: subscriptionData.stripeCustomerId,
        stripe_subscription_id: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.status,
        tier: subscriptionData.tier,
        current_period_start: subscriptionData.currentPeriodStart?.toISOString(),
        current_period_end: subscriptionData.currentPeriodEnd?.toISOString(),
        cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
        trial_start: subscriptionData.trialStart?.toISOString(),
        trial_end: subscriptionData.trialEnd?.toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`)
    }

    // Update user profile with subscription tier
    if (subscriptionData.tier) {
      await supabase
        .from('profiles')
        .update({ 
          subscription_tier: subscriptionData.tier,
          subscription_status: subscriptionData.status
        })
        .eq('id', subscriptionData.userId)
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId)
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
    }
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
  }

  /**
   * Change subscription plan
   */
  static async changeSubscriptionPlan(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations'
    })
  }

  /**
   * Get payment history for user
   */
  static async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get payment history: ${error.message}`)
    }

    return data.map(payment => ({
      id: payment.id,
      userId: payment.user_id,
      stripeInvoiceId: payment.stripe_invoice_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      invoiceUrl: payment.invoice_url,
      createdAt: new Date(payment.created_at)
    }))
  }

  /**
   * Record payment in database
   */
  static async recordPayment(paymentData: {
    userId: string
    stripeInvoiceId: string
    stripeCustomerId: string
    amount: number
    currency: string
    status: string
    description: string
    invoiceUrl?: string
  }): Promise<void> {
    const { error } = await supabase
      .from('payment_history')
      .insert({
        user_id: paymentData.userId,
        stripe_invoice_id: paymentData.stripeInvoiceId,
        stripe_customer_id: paymentData.stripeCustomerId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        description: paymentData.description,
        invoice_url: paymentData.invoiceUrl,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to record payment: ${error.message}`)
    }
  }

  /**
   * Check if user can access premium content
   */
  static async canAccessPremiumContent(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    
    if (!subscription) return false
    
    return subscription.status === 'active' && 
           (subscription.tier === 'premium' || subscription.tier === 'enterprise')
  }

  /**
   * Get subscription limits for user
   */
  static async getUserLimits(userId: string): Promise<SubscriptionTier['limits']> {
    const subscription = await this.getUserSubscription(userId)
    const tier = subscription?.tier || 'free'
    
    return SUBSCRIPTION_TIERS[tier].limits
  }

  /**
   * Check if user has reached resource limit
   */
  static async hasReachedResourceLimit(userId: string): Promise<boolean> {
    const limits = await this.getUserLimits(userId)
    
    if (limits.resources === 'unlimited') return false
    
    // Get user's resource views this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count } = await supabase
      .from('resource_views')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
    
    return (count || 0) >= (limits.resources as number)
  }

  /**
   * Get subscription analytics
   */
  static async getSubscriptionAnalytics(): Promise<{
    totalSubscribers: number
    activeSubscribers: number
    monthlyRevenue: number
    churnRate: number
    conversionRate: number
    tierDistribution: Record<string, number>
  }> {
    // Get subscription counts by tier
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('tier, status, created_at')
    
    if (!subscriptions) {
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        monthlyRevenue: 0,
        churnRate: 0,
        conversionRate: 0,
        tierDistribution: {}
      }
    }

    const totalSubscribers = subscriptions.length
    const activeSubscribers = subscriptions.filter(s => s.status === 'active').length
    
    const tierDistribution = subscriptions.reduce((acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate monthly revenue
    const monthlyRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, sub) => {
        const tier = SUBSCRIPTION_TIERS[sub.tier]
        return total + (tier?.price || 0)
      }, 0)

    // Calculate churn rate (simplified)
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const canceledThisMonth = subscriptions.filter(s => 
      s.status === 'canceled' && 
      new Date(s.created_at) >= lastMonth &&
      new Date(s.created_at) < thisMonth
    ).length

    const churnRate = totalSubscribers > 0 ? (canceledThisMonth / totalSubscribers) * 100 : 0

    // Get total users for conversion rate
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    const conversionRate = totalUsers ? (activeSubscribers / totalUsers) * 100 : 0

    return {
      totalSubscribers,
      activeSubscribers,
      monthlyRevenue,
      churnRate,
      conversionRate,
      tierDistribution
    }
  }

  /**
   * Handle failed payment
   */
  static async handleFailedPayment(subscriptionId: string, invoiceId: string): Promise<void> {
    // Update subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId)

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: subscription.user_id,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please update your payment method.',
          data: { invoiceId },
          created_at: new Date().toISOString()
        })
    }
  }

  /**
   * Process successful payment
   */
  static async processSuccessfulPayment(invoiceData: Stripe.Invoice): Promise<void> {
    const customerId = invoiceData.customer as string
    const subscriptionId = invoiceData.subscription as string

    // Get user ID from customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) return

    // Record payment
    await this.recordPayment({
      userId: profile.id,
      stripeInvoiceId: invoiceData.id,
      stripeCustomerId: customerId,
      amount: invoiceData.amount_paid,
      currency: invoiceData.currency,
      status: invoiceData.status || 'paid',
      description: invoiceData.description || 'Subscription payment',
      invoiceUrl: invoiceData.hosted_invoice_url || undefined
    })

    // Update subscription status to active
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    // Create success notification
    await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        type: 'payment_success',
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully.',
        data: { invoiceId: invoiceData.id },
        created_at: new Date().toISOString()
      })
  }
}