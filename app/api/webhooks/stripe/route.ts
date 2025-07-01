import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getStripe } from '@/lib/stripe/stripe-client';
import { SubscriptionService } from '@/lib/stripe/subscription-service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !webhookSecret) {
    console.warn('Stripe webhook not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured for webhook');
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    console.error('No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const subscriptionService = new SubscriptionService();
  const supabase = createServerComponentClient({ cookies });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);
          const userId = session.metadata?.user_id;

          if (userId) {
            await subscriptionService.updateUserSubscriptionStatus(userId, subscription);
            console.log(`✅ Updated subscription for user ${userId}`);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription created:', subscription.id);

        const userId = subscription.metadata?.user_id;
        if (userId) {
          await subscriptionService.updateUserSubscriptionStatus(userId, subscription);
          console.log(`✅ Updated subscription status for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription updated:', subscription.id);

        const userId = subscription.metadata?.user_id;
        if (userId) {
          await subscriptionService.updateUserSubscriptionStatus(userId, subscription);
          console.log(`✅ Updated subscription status for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription canceled:', subscription.id);

        const userId = subscription.metadata?.user_id;
        if (userId) {
          // Set user back to free plan
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_plan: 'free',
              subscription_id: null,
              subscription_current_period_end: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          console.log(`✅ Downgraded user ${userId} to free plan`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Payment succeeded for invoice:', invoice.id);

        if ((invoice as any).subscription) {
          const subscription = await getStripe().subscriptions.retrieve((invoice as any).subscription as string);
          const userId = (subscription as any).metadata?.user_id;

          if (userId) {
            // Update subscription status and period end
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            console.log(`✅ Payment successful for user ${userId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('❌ Payment failed for invoice:', invoice.id);

        if ((invoice as any).subscription) {
          const subscription = await getStripe().subscriptions.retrieve((invoice as any).subscription as string);
          const userId = (subscription as any).metadata?.user_id;

          if (userId) {
            // Mark subscription as past due
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            console.log(`❌ Payment failed for user ${userId}`);
          }
        }
        break;
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('✅ Customer created:', customer.id);

        // Update user profile with Stripe customer ID if we have the user_id in metadata
        const userId = customer.metadata?.user_id;
        if (userId) {
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customer.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          console.log(`✅ Updated customer ID for user ${userId}`);
        }
        break;
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log('✅ Customer updated:', customer.id);

        // Update customer information in our database if needed
        const userId = customer.metadata?.user_id;
        if (userId && customer.email) {
          await supabase
            .from('profiles')
            .update({
              email: customer.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment intent succeeded:', paymentIntent.id);
        // Handle one-time payment success if needed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment intent failed:', paymentIntent.id);
        // Handle payment failure if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}