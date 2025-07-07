'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ArenaMatchResult } from '@/lib/systems/arena-system';
import { cn } from '@/lib/utils';

// Props type
type ArenaResultsProps = {
  result: ArenaMatchResult;
  onContinue: () => void;
  onPlayAgain: () => void;
};

// Reward animation component
function RewardItem({ 
  icon, 
  label, 
  value, 
  delay = 0,
  color = "text-yellow-500"
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 rounded-lg"
    >
      <div className={cn("text-3xl", color)}>
        {icon}
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </motion.div>
  );
}

// MVP display component
function MVPDisplay({ 
  partnerId, 
  partnerName 
}: {
  partnerId?: string;
  partnerName: string;
}) {
  if (!partnerId) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-6"
    >
      <Card className="p-4 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-600/50">
        <div className="flex items-center justify-center gap-3">
          <Award className="w-6 h-6 text-yellow-500" />
          <div className="text-center">
            <p className="text-sm text-gray-400">Match MVP</p>
            <p className="font-semibold text-yellow-500">{partnerName}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Highlights display
function HighlightsList({ 
  highlights 
}: { 
  highlights: { round: number; event: string; partnerId: string }[] 
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-gray-400">Match Highlights</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {highlights.map((highlight, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="text-sm text-gray-300 pl-2 border-l-2 border-soviet-600/50"
          >
            <span className="text-gray-500">R{highlight.round}:</span> {highlight.event}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ArenaResults({ result, onContinue, onPlayAgain }: ArenaResultsProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const isVictory = result.winner === 'player';

  // Calculate performance stars (1-3)
  const performanceStars = Math.min(3, Math.max(1, 
    isVictory ? Math.ceil((result.playerScore / result.rounds) * 3) : 0
  ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
    >
      <div className="w-full max-w-2xl">
        {/* Result header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "text-center mb-8",
            isVictory ? "text-green-500" : "text-red-500"
          )}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <Trophy className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          
          <h2 className="text-4xl font-bold mb-2">
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          
          <p className="text-xl text-gray-400">
            {result.playerScore} - {result.opponentScore}
          </p>

          {/* Performance stars */}
          {isVictory && (
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: star <= performanceStars ? 1 : 0.7, 
                    rotate: 0,
                    opacity: star <= performanceStars ? 1 : 0.3
                  }}
                  transition={{ delay: 0.2 + star * 0.1 }}
                >
                  <Star 
                    className={cn(
                      "w-8 h-8",
                      star <= performanceStars 
                        ? "fill-yellow-500 text-yellow-500" 
                        : "text-gray-600"
                    )}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rewards section */}
        <Card className="p-6 bg-gray-900 border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {isVictory ? 'Rewards Earned' : 'Consolation Rewards'}
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <RewardItem
              icon="💰"
              label="Tips"
              value={`+${result.rewards.tips}`}
              delay={0.3}
              color="text-yellow-500"
            />
            <RewardItem
              icon="⭐"
              label="Experience"
              value={`+${result.rewards.experience}`}
              delay={0.4}
              color="text-blue-500"
            />
            {result.rewards.rating !== undefined && (
              <RewardItem
                icon="🏆"
                label="Rating"
                value={`${result.rewards.rating > 0 ? '+' : ''}${result.rewards.rating}`}
                delay={0.5}
                color={result.rewards.rating > 0 ? "text-green-500" : "text-red-500"}
              />
            )}
          </div>

          {/* MVP display */}
          {result.mvp && (
            <MVPDisplay
              partnerId={result.mvp}
              partnerName="Elite Courier" // In real app, look up partner name
            />
          )}
        </Card>

        {/* Match highlights */}
        {result.highlights.length > 0 && (
          <Card className="p-4 bg-gray-900 border-gray-700 mb-6">
            <HighlightsList highlights={result.highlights} />
          </Card>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3"
          onAnimationComplete={() => setAnimationComplete(true)}
        >
          <Button
            variant="outline"
            onClick={onPlayAgain}
            className="flex-1 border-gray-700"
            disabled={!animationComplete}
          >
            Play Again
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-soviet-600 hover:bg-soviet-700"
            disabled={!animationComplete}
          >
            <span className="flex items-center gap-2">
              Continue
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}