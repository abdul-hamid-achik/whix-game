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
      title: 'Neurodivergent Protagonists',
      description: 'Experience Mexico City through characters whose pattern recognition, hyperfocus, and sensory processing are both strength and target for corporate exploitation.',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Package,
      title: 'Surveillance Capitalism',
      description: 'Navigate WHIX\'s comprehensive surveillance system that harvests neural data from neurodivergent delivery partners to enable community displacement.',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Users,
      title: 'Community Resistance',
      description: 'Build solidarity networks in Mexico City\'s barrios. Use mutual aid and collective action to resist algorithmic control and gentrification.',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Star,
      title: 'Cultural Identity',
      description: 'Experience a unique Soviet-Aztec aesthetic in a Party-State system that merges communist imagery with indigenous Mexican symbolism.',
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  const stats = [
    { value: '9', label: 'Story Chapters' },
    { value: '15+', label: 'Major Characters' },
    { value: '5', label: 'Mexico City Districts' },
    { value: '100%', label: 'Authentic Representation' }
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
            {/* Game Logo/Title with Soviet-Aztec aesthetic */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-8xl font-bold mb-2">
                <span className="bg-gradient-to-r from-red-400 via-yellow-500 to-red-400 bg-clip-text text-transparent">
                  ₩HIX
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-mono">
                MÉXICO • RESISTENCIA • COMUNIDAD
              </p>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              En la Ciudad de México, WHIX harvests neural data from neurodivergent delivery partners. 
              Join Miguel Santos and his community as they resist surveillance capitalism through 
              <span className="text-red-400 font-semibold"> solidarity and mutual aid.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/hub">
                <Button size="lg" className="group bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                  <Truck className="mr-2 h-5 w-5" />
                  Enter México City
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                <Shield className="mr-2 h-5 w-5" />
                Únete a la Resistencia
              </Button>
            </div>
            
            {/* Neural Surveillance Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block p-4 bg-red-900/20 border border-red-600/50 rounded-lg"
            >
              <p className="text-sm text-red-400 font-mono">
                ⚠️ NEURAL SURVEILLANCE ACTIVE - PROTECT YOUR CONSCIOUSNESS
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
              <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                Resist Neural Harvesting
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              WHIX targets neurodivergent minds for their pattern recognition abilities. Build community networks to protect consciousness itself.
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
            className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 rounded-2xl p-8 md:p-12 border border-red-600/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              La Historia de Miguel Santos
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                En Polanco District, México, Miguel Santos discovers WHIX's surveillance system 
                targeting <span className="text-red-400 font-bold">neurodivergent delivery partners</span> for 
                neural data harvesting and community displacement.
              </p>
              <p className="text-lg leading-relaxed">
                When his partner Tania Volkov disappears into WHIX's "optimization" program, 
                Miguel joins <span className="text-yellow-400 font-semibold">Father Santiago, Ricardo "Tech" Morales, 
                and underground resistance networks</span> fighting algorithmic control.
              </p>
              <p className="text-lg leading-relaxed">
                Navigate Mexico City's barrios. Build solidarity networks. Resist Director Chen's 
                surveillance capitalism. But remember - <span className="text-red-400 font-bold">protecting consciousness 
                requires community action</span>, not individual heroism.
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
              <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                La Resistencia Comienza Contigo
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Solidarity networks protect consciousness. Community action resists neural harvesting. ¡Juntos somos más fuertes!
            </p>
            <Link href="/hub">
              <Button size="lg" className="group bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                <Zap className="mr-2 h-5 w-5" />
                Join the Network
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
          <p className="font-mono text-sm">&copy; WHIX CORP MÉXICO. NEURAL DATA COLLECTION MANDATORY.</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <Link href="/privacy" className="hover:text-red-400 transition-colors">
              Surveillance Policy
            </Link>
            <Link href="/terms" className="hover:text-red-400 transition-colors">
              Neural Terms
            </Link>
            <Link href="/support" className="hover:text-red-400 transition-colors">
              Community Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}