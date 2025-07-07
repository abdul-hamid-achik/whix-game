'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Package, Brain, Star, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'Neurodivergent Partners',
      description: 'Recruit and train partners with unique abilities based on real neurodivergent traits like hyperfocus, pattern recognition, and enhanced senses.',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Package,
      title: 'Dystopian Delivery',
      description: 'Navigate a gig economy dystopia where mega-corp Whix controls everything. Keep your humanity while fighting for fair wages.',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Users,
      title: 'Team Synergy',
      description: 'Build the perfect delivery crew by combining different neurodivergent traits. Each partner brings unique strengths to your team.',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Star,
      title: 'Fight the System',
      description: 'Earn Company Stars to reduce Whix\'s oppressive 75% tip cut. Every star is a victory against corporate exploitation.',
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  const stats = [
    { value: '100+', label: 'Unique Partners' },
    { value: '50+', label: 'Story Missions' },
    { value: '7', label: 'Neurodivergent Traits' },
    { value: '5', label: 'Partner Classes' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        {/* Cyberpunk-style animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Game Logo/Title with cyberpunk aesthetic */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-8xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  WHIX
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-mono">
                THE DELIVERY DYSTOPIA
              </p>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              In 2045, mega-corp Whix controls the gig economy. You\'re a delivery partner fighting for survival, 
              building a team of neurodivergent allies with extraordinary abilities. 
              <span className="text-cyan-400 font-semibold"> Every delivery is a rebellion.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/dashboard">
                <Button size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Truck className="mr-2 h-5 w-5" />
                  Start Delivering
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10">
                <Shield className="mr-2 h-5 w-5" />
                Join the Resistance
              </Button>
            </div>
            
            {/* Humanity Index Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block p-4 bg-red-900/20 border border-red-600/50 rounded-lg"
            >
              <p className="text-sm text-red-400 font-mono">
                ⚠️ HUMANITY INDEX: <span className="font-bold">87%</span> - MAINTAIN YOUR HUMANITY
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Cyberpunk Theme */}
      <section className="py-20 px-4 bg-black/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Fight the Algorithm
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              In a world where AI optimizes exploitation, your neurodivergent team is the key to breaking free.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-gray-900/50 border-gray-700 hover:border-cyan-600/50 transition-all hover:shadow-lg hover:shadow-cyan-600/20">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Glitch Effect */}
      <section className="py-20 px-4 bg-gradient-to-b from-black/50 to-purple-900/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 font-mono">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-2xl p-8 md:p-12 border border-purple-600/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Your Story Begins...
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                The year is 2045. Whix Corporation has monopolized the gig economy, 
                taking <span className="text-red-400 font-bold">75% of every tip</span> while 
                their AI algorithms push workers to their limits.
              </p>
              <p className="text-lg leading-relaxed">
                But you\'re different. You\'ve discovered that neurodivergent individuals possess 
                abilities that can outsmart the system. <span className="text-cyan-400 font-semibold">
                Hyperfocus lets you navigate impossible routes. Pattern recognition reveals hidden paths. 
                Enhanced senses detect danger before it strikes.</span>
              </p>
              <p className="text-lg leading-relaxed">
                Build your team. Complete deliveries. Earn Company Stars to reduce Whix\'s cut. 
                But remember - <span className="text-red-400 font-bold">keep your Humanity Index above zero</span>, 
                or lose yourself to the machine.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                The Revolution Starts With You
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Every delivery is an act of resistance. Every partner recruited strikes back at the system.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="group bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                <Zap className="mr-2 h-5 w-5" />
                Begin Your Resistance
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
          <p className="font-mono text-sm">&copy; 2045 WHIX CORP. ALL TIPS SUBJECT TO PROCESSING FEES.</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-cyan-400 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}