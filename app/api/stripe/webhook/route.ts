import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const { productId, productType } = session.metadata || {};
        
        if (!productId || !productType) {
          console.error('Missing product metadata in session');
          break;
        }

        // TODO: Update user's game state based on purchase
        // This would typically:
        // 1. Find the user by their Stripe customer ID or email
        // 2. Grant them the purchased items (tips, fragments, etc.)
        // 3. Send confirmation email
        // 4. Log the transaction

        console.log(`Payment successful for ${productType}: ${productId}`);
        
        // Example of what you'd do:
        // await grantPurchasedItems(session.customer_email, productId, productType);
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription changes
        console.log(`Subscription ${event.type} for customer ${subscription.customer}`);
        
        // TODO: Update user's subscription status
        // await updateUserSubscription(subscription);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription cancellation
        console.log(`Subscription cancelled for customer ${subscription.customer}`);
        
        // TODO: Remove subscription benefits
        // await removeUserSubscription(subscription);
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Handle failed payment
        console.error(`Payment failed for intent ${paymentIntent.id}`);
        
        // TODO: Notify user of failed payment
        // await notifyFailedPayment(paymentIntent);
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Stripe webhooks require raw body
export const config = {
  api: {
    bodyParser: false,
  },
};