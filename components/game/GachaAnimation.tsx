'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Star, Zap } from 'lucide-react';
import { Rarity } from '@/lib/game/classes';
// Define Character interface locally
interface Character {
  id: string;
  name: string;
  rarity: string;
  imageUrl?: string;
  description?: string;
  class?: string;
  personality?: string;
  primaryTrait?: string;
}
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCharacterImageStore } from '@/lib/stores/characterImageStore';

interface GachaAnimationProps {
  character: Character;
  onComplete: () => void;
}

const RARITY_COLORS = {
  common: {
    bg: 'from-gray-600 to-gray-800',
    glow: 'shadow-gray-500/50',
    stars: 1
  },
  rare: {
    bg: 'from-blue-600 to-blue-800',
    glow: 'shadow-blue-500/50',
    stars: 2
  },
  epic: {
    bg: 'from-purple-600 to-purple-800',
    glow: 'shadow-purple-500/50',
    stars: 3
  },
  legendary: {
    bg: 'from-yellow-600 to-yellow-800',
    glow: 'shadow-yellow-500/50',
    stars: 4
  },
  mythic: {
    bg: 'from-pink-600 via-purple-600 to-blue-600',
    glow: 'shadow-pink-500/50',
    stars: 5
  }
};

export function GachaAnimation({ character, onComplete }: GachaAnimationProps) {
  const [phase, setPhase] = useState<'opening' | 'reveal' | 'showcase'>('opening');
  const { getCharacterImage, assignImageToCharacter, getFromPool } = useCharacterImageStore();
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  
  const rarityConfig = RARITY_COLORS[character.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
  
  useEffect(() => {
    // Try to get existing image or pull from pool
    let image = getCharacterImage(character.id);
    
    if (!image) {
      // Try to get from pool
      const poolImage = getFromPool(character.rarity as Rarity);
      if (poolImage) {
        assignImageToCharacter(character.id, poolImage);
        image = poolImage;
      }
    }
    
    if (image?.blobUrl || image?.url) {
      setCharacterImage(image.blobUrl || image.url);
    }
    
    // Animation sequence
    const timer1 = setTimeout(() => setPhase('reveal'), 1500);
    const timer2 = setTimeout(() => setPhase('showcase'), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [character, getCharacterImage, assignImageToCharacter, getFromPool]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {phase === 'opening' && (
          <motion.div
            key="opening"
            className="relative"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-32 h-32 text-white animate-pulse" />
            </div>
            
            {/* Particle effects */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ x: 0, y: 0 }}
                animate={{
                  x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                  opacity: 0
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            ))}
          </motion.div>
        )}
        
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={cn(
                "w-80 h-96 rounded-lg bg-gradient-to-br p-1",
                rarityConfig.bg
              )}
              animate={{
                boxShadow: [
                  `0 0 20px ${rarityConfig.glow}`,
                  `0 0 40px ${rarityConfig.glow}`,
                  `0 0 20px ${rarityConfig.glow}`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Card className="w-full h-full bg-gray-900 p-4 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2">
                    {Array.from({ length: rarityConfig.stars }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    NEW CHARACTER!
                  </h3>
                  
                  <p className={cn(
                    "text-lg font-semibold uppercase",
                    character.rarity === 'mythic' && 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent'
                  )}>
                    {character.rarity}
                  </p>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        )}
        
        {phase === 'showcase' && (
          <motion.div
            key="showcase"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md"
          >
            <Card className={cn(
              "p-6 bg-gradient-to-br",
              rarityConfig.bg,
              "shadow-2xl",
              rarityConfig.glow
            )}>
              <div className="bg-gray-900 rounded-lg p-6">
                {/* Character Image */}
                {characterImage && (
                  <div className="mb-4 relative">
                    <Image
                      src={characterImage}
                      alt={character.name}
                      width={192}
                      height={192}
                      className="w-48 h-48 mx-auto rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                
                {/* Character Info */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {character.name}
                  </h2>
                  
                  <div className="flex justify-center gap-1 mb-3">
                    {Array.from({ length: rarityConfig.stars }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{character.description}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-black/30 rounded p-2">
                      <p className="text-gray-400">Class</p>
                      <p className="text-white font-semibold capitalize">{character.class}</p>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <p className="text-gray-400">Personality</p>
                      <p className="text-white font-semibold capitalize">{character.personality}</p>
                    </div>
                  </div>
                  
                  {/* Primary Trait */}
                  {character.primaryTrait && (
                    <div className="mt-4 bg-black/30 rounded p-3">
                      <p className="text-gray-400 text-sm">Primary Trait</p>
                      <p className="text-white font-semibold flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        {character.primaryTrait.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={onComplete}
                  className="w-full"
                  variant="secondary"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}