/**
 * Enhanced Stripe Webhook Handler
 * Handles all Stripe events with comprehensive error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log('Received Stripe webhook:', event.type, event.id)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log successful webhook processing
    await logWebhookEvent(event, 'success')

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error)
    
    // Log failed webhook processing
    await logWebhookEvent(event, 'error', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id

  // Get user ID from customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    throw new Error(`No user found for customer ${customerId}`)
  }

  // Determine subscription tier from price ID
  const subscriptionTier = getSubscriptionTier(priceId)

  // Create subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: profile.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      created_at: new Date(subscription.created * 1000).toISOString()
    })

  if (subscriptionError) {
    throw subscriptionError
  }

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: subscriptionTier,
      subscription_status: subscription.status,
      subscription_start_date: new Date(subscription.created * 1000).toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)

  if (profileError) {
    throw profileError
  }

  console.log(`Subscription created for user ${profile.id}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id
  const subscriptionTier = getSubscriptionTier(priceId)

  // Update subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (subscriptionError) {
    throw subscriptionError
  }

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: subscriptionTier,
      subscription_status: subscription.status,
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (profileError) {
    throw profileError
  }

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = subscription.customer as string

  // Update subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (subscriptionError) {
    throw subscriptionError
  }

  // Update user profile to free tier
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (profileError) {
    throw profileError
  }

  console.log(`Subscription canceled: ${subscription.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing payment succeeded:', invoice.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = invoice.customer as string

  // Get user ID from customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    throw new Error(`No user found for customer ${customerId}`)
  }

  // Record payment
  const { error } = await supabase
    .from('payment_history')
    .insert({
      user_id: profile.id,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description || 'Subscription payment',
      invoice_url: invoice.hosted_invoice_url,
      created_at: new Date(invoice.created * 1000).toISOString()
    })

  if (error) {
    throw error
  }

  console.log(`Payment recorded for user ${profile.id}: $${invoice.amount_paid / 100}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing payment failed:', invoice.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = invoice.customer as string

  // Get user ID from customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    throw new Error(`No user found for customer ${customerId}`)
  }

  // Record failed payment
  const { error } = await supabase
    .from('payment_history')
    .insert({
      user_id: profile.id,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: invoice.description || 'Subscription payment',
      failure_reason: 'Payment failed',
      created_at: new Date(invoice.created * 1000).toISOString()
    })

  if (error) {
    throw error
  }

  // TODO: Send notification to user about failed payment
  // TODO: Implement dunning management

  console.log(`Payment failed for user ${profile.id}: $${invoice.amount_due / 100}`)
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Processing customer created:', customer.id)
  // Customer creation is typically handled during registration
  // This is mainly for logging purposes
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Processing customer updated:', customer.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  // Update customer information in profile
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (customer.email) {
    updateData.email = customer.email
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_customer_id', customer.id)

  if (error) {
    throw error
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completed:', session.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = session.customer as string

  // Get user ID from customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    throw new Error(`No user found for customer ${customerId}`)
  }

  // Record successful checkout
  const { error } = await supabase
    .from('payment_history')
    .insert({
      user_id: profile.id,
      stripe_customer_id: customerId,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'succeeded',
      description: 'Checkout completed',
      created_at: new Date().toISOString()
    })

  if (error) {
    throw error
  }

  console.log(`Checkout completed for user ${profile.id}`)
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Processing trial will end:', subscription.id)

  if (!supabase) {
    throw new Error('Database not available')
  }

  const customerId = subscription.customer as string

  // Get user information
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    throw new Error(`No user found for customer ${customerId}`)
  }

  // TODO: Send trial ending notification email
  // TODO: Create in-app notification

  console.log(`Trial ending soon for user ${profile.id}`)
}

function getSubscriptionTier(priceId: string | undefined): 'free' | 'premium' | 'enterprise' {
  if (!priceId) return 'free'

  // Map price IDs to subscription tiers
  const priceToTierMap: Record<string, 'premium' | 'enterprise'> = {
    [process.env.STRIPE_PREMIUM_PRICE_ID!]: 'premium',
    [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: 'enterprise',
  }

  return priceToTierMap[priceId] || 'free'
}

async function logWebhookEvent(
  event: Stripe.Event,
  status: 'success' | 'error',
  errorMessage?: string
) {
  if (!supabase) return

  try {
    await supabase
      .from('webhook_logs')
      .insert({
        event_id: event.id,
        event_type: event.type,
        status,
        error_message: errorMessage,
        processed_at: new Date().toISOString(),
        created_at: new Date(event.created * 1000).toISOString()
      })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}