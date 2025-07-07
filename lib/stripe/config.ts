import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Product types for in-game purchases
export const STRIPE_PRODUCTS = {
  // Premium Currency
  tips: {
    small: {
      id: 'tips_small',
      name: '1,000 Tips',
      amount: 1000,
      price: 99, // $0.99
      currency: 'usd',
      description: 'A small tip jar boost',
    },
    medium: {
      id: 'tips_medium',
      name: '5,500 Tips',
      amount: 5500,
      price: 499, // $4.99
      currency: 'usd',
      description: 'Medium tip package with 10% bonus',
      bonus: '10% bonus',
    },
    large: {
      id: 'tips_large',
      name: '12,000 Tips',
      amount: 12000,
      price: 999, // $9.99
      currency: 'usd',
      description: 'Large tip package with 20% bonus',
      bonus: '20% bonus',
    },
    mega: {
      id: 'tips_mega',
      name: '55,000 Tips',
      amount: 55000,
      price: 3999, // $39.99
      currency: 'usd',
      description: 'Mega tip package with 37.5% bonus',
      bonus: '37.5% bonus',
      popular: true,
    },
  },

  // Gacha Currency
  starFragments: {
    small: {
      id: 'fragments_small',
      name: '10 Star Fragments',
      amount: 10,
      price: 199, // $1.99
      currency: 'usd',
      description: 'Enough for one company star upgrade',
    },
    medium: {
      id: 'fragments_medium',
      name: '55 Star Fragments',
      amount: 55,
      price: 999, // $9.99
      currency: 'usd',
      description: 'Multiple star upgrades with 10% bonus',
      bonus: '10% bonus',
    },
    large: {
      id: 'fragments_large',
      name: '120 Star Fragments',
      amount: 120,
      price: 1999, // $19.99
      currency: 'usd',
      description: 'Major star upgrade package with 20% bonus',
      bonus: '20% bonus',
      popular: true,
    },
  },

  // Special Bundles
  bundles: {
    starter: {
      id: 'bundle_starter',
      name: 'Rebel Starter Pack',
      price: 499, // $4.99
      currency: 'usd',
      description: 'Perfect for new partners joining the resistance',
      contents: {
        tips: 5000,
        starFragments: 10,
        guaranteedRarePartner: true,
      },
      oneTimePurchase: true,
      popular: true,
    },
    monthly: {
      id: 'bundle_monthly',
      name: 'Underground Pass',
      price: 999, // $9.99/month
      currency: 'usd',
      description: 'Monthly benefits for dedicated rebels',
      contents: {
        dailyTips: 500,
        weeklyFragments: 10,
        reducedWhixCut: 10, // 10% less cut
        exclusivePartnerSkins: true,
      },
      subscription: true,
    },
    resistance: {
      id: 'bundle_resistance',
      name: 'Resistance Fighter Bundle',
      price: 2999, // $29.99
      currency: 'usd',
      description: 'Everything you need to fight the algorithm',
      contents: {
        tips: 30000,
        starFragments: 60,
        guaranteedEpicPartner: true,
        exclusiveStoryChapter: 'The Truth About WHIX',
      },
      oneTimePurchase: true,
    },
  },

  // Cosmetics
  cosmetics: {
    partnerSkin: {
      id: 'skin_neon_rebel',
      name: 'Neon Rebel Skin Pack',
      price: 299, // $2.99
      currency: 'usd',
      description: 'Cyberpunk aesthetic for your partners',
    },
    uiTheme: {
      id: 'theme_midnight_run',
      name: 'Midnight Run UI Theme',
      price: 199, // $1.99
      currency: 'usd',
      description: 'Dark mode with neon accents',
    },
  },
};

// Helper to format price for display
export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
};

// Helper to check if user can afford purchase
export const canAffordPurchase = (
  priceInCents: number,
  userBalance: number = 0
): boolean => {
  return userBalance >= priceInCents;
};