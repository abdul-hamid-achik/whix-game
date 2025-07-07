'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Star, Package, Sparkles, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/stores/gameStore';
import { STRIPE_PRODUCTS, formatPrice } from '@/lib/stripe/config';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { currentTips, starFragments } = useGameStore();

  const handlePurchase = async (productId: string, productType: string) => {
    setIsLoading(productId);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productType,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe error:', error);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Underground Market
          </h1>
          <p className="text-muted-foreground">
            Support the resistance and unlock exclusive content
          </p>
        </div>

        {/* Current Balance */}
        <div className="flex justify-center gap-4">
          <Card className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{currentTips.toLocaleString()} Tips</span>
            </div>
          </Card>
          <Card className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">{starFragments} Fragments</span>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="fragments">Star Fragments</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
          </TabsList>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(STRIPE_PRODUCTS.tips).map(([_key, product]) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={'popular' in product && product.popular ? 'ring-2 ring-primary' : ''}>
                    {'popular' in product && product.popular && (
                      <Badge className="absolute -top-2 right-4">Popular</Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        {product.name}
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {'bonus' in product && product.bonus && (
                        <Badge variant="secondary" className="w-full justify-center">
                          {'bonus' in product ? product.bonus : ''}
                        </Badge>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(product.id, 'tips')}
                        disabled={isLoading === product.id}
                      >
                        {isLoading === product.id ? (
                          'Processing...'
                        ) : (
                          formatPrice(product.price)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Star Fragments Tab */}
          <TabsContent value="fragments" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(STRIPE_PRODUCTS.starFragments).map(([_key, product]) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={'popular' in product && product.popular ? 'ring-2 ring-primary' : ''}>
                    {'popular' in product && product.popular && (
                      <Badge className="absolute -top-2 right-4">Popular</Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-500" />
                        {product.name}
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {'bonus' in product && product.bonus && (
                        <Badge variant="secondary" className="w-full justify-center">
                          {'bonus' in product ? product.bonus : ''}
                        </Badge>
                      )}
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => handlePurchase(product.id, 'starFragments')}
                        disabled={isLoading === product.id}
                      >
                        {isLoading === product.id ? (
                          'Processing...'
                        ) : (
                          formatPrice(product.price)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(STRIPE_PRODUCTS.bundles).map(([_key, product]) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={'popular' in product && product.popular ? 'ring-2 ring-primary' : ''}>
                    {'popular' in product && product.popular && (
                      <Badge className="absolute -top-2 right-4">Best Value</Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-500" />
                        {product.name}
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        {'tips' in product.contents && product.contents.tips && (
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span>{'tips' in product.contents ? product.contents.tips.toLocaleString() : 0} Tips</span>
                          </div>
                        )}
                        {'starFragments' in product.contents && product.contents.starFragments && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-purple-500" />
                            <span>{'starFragments' in product.contents ? product.contents.starFragments : 0} Star Fragments</span>
                          </div>
                        )}
                        {'guaranteedRarePartner' in product.contents && product.contents.guaranteedRarePartner && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span>Guaranteed Rare Partner</span>
                          </div>
                        )}
                        {'guaranteedEpicPartner' in product.contents && product.contents.guaranteedEpicPartner && (
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-purple-500" />
                            <span>Guaranteed Epic Partner</span>
                          </div>
                        )}
                        {'dailyTips' in product.contents && product.contents.dailyTips && (
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span>{'dailyTips' in product.contents ? product.contents.dailyTips : 0} Tips Daily</span>
                          </div>
                        )}
                        {'reducedWhixCut' in product.contents && product.contents.reducedWhixCut && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span>{'reducedWhixCut' in product.contents ? product.contents.reducedWhixCut : 0}% Less WHIX Cut</span>
                          </div>
                        )}
                      </div>
                      {'oneTimePurchase' in product && product.oneTimePurchase && (
                        <Badge variant="outline" className="w-full justify-center">
                          One-time purchase
                        </Badge>
                      )}
                      {'subscription' in product && product.subscription && (
                        <Badge variant="outline" className="w-full justify-center">
                          Monthly subscription
                        </Badge>
                      )}
                      <Button
                        className="w-full"
                        variant={'subscription' in product && product.subscription ? 'default' : 'secondary'}
                        onClick={() => handlePurchase(product.id, 'bundles')}
                        disabled={isLoading === product.id}
                      >
                        {isLoading === product.id ? (
                          'Processing...'
                        ) : (
                          <>
                            {formatPrice(product.price)}
                            {'subscription' in product && product.subscription && '/month'}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Cosmetics Tab */}
          <TabsContent value="cosmetics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(STRIPE_PRODUCTS.cosmetics).map(([_key, product]) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-500" />
                        {product.name}
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handlePurchase(product.id, 'cosmetics')}
                        disabled={isLoading === product.id}
                      >
                        {isLoading === product.id ? (
                          'Processing...'
                        ) : (
                          formatPrice(product.price)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Legal Notice */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>All purchases are final. Tips and Star Fragments have no real-world value.</p>
          <p>By purchasing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
}