import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_PRODUCTS } from '@/lib/stripe/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { productId, productType } = await req.json();

    // Validate the product exists
    let product;
    if (productType === 'tips') {
      product = Object.values(STRIPE_PRODUCTS.tips).find(p => p.id === productId);
    } else if (productType === 'starFragments') {
      product = Object.values(STRIPE_PRODUCTS.starFragments).find(p => p.id === productId);
    } else if (productType === 'bundles') {
      product = Object.values(STRIPE_PRODUCTS.bundles).find(p => p.id === productId);
    } else if (productType === 'cosmetics') {
      product = Object.values(STRIPE_PRODUCTS.cosmetics).find(p => p.id === productId);
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
              metadata: {
                productId: product.id,
                productType,
              },
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription' in product && product.subscription ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/shop`,
      metadata: {
        productId: product.id,
        productType,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}