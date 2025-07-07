'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Dices, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { NeuraButton } from '@/components/neura';

interface DiceRollerProps {
  numberOfDice?: number;
  modifier?: number;
  difficulty?: number;
  onRoll?: (result: DiceResult) => void;
  partnerBonus?: {
    name: string;
    bonus: number;
    stat: string;
  };
}

interface DiceResult {
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  success: boolean;
  criticalSuccess: boolean;
  criticalFailure: boolean;
}

export function DiceRoller({
  numberOfDice = 2,
  modifier = 0,
  difficulty = 10,
  onRoll,
  partnerBonus
}: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [currentRolls, setCurrentRolls] = useState<number[]>([]);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const rollDice = async () => {
    setIsRolling(true);
    setShowResult(false);
    setResult(null);

    // Animate rolling
    const animationDuration = 2000;
    const animationSteps = 20;
    const stepDuration = animationDuration / animationSteps;

    for (let i = 0; i < animationSteps; i++) {
      const tempRolls = Array.from({ length: numberOfDice }, () => 
        Math.floor(Math.random() * 6) + 1
      );
      setCurrentRolls(tempRolls);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Final roll
    const finalRolls = Array.from({ length: numberOfDice }, () => 
      Math.floor(Math.random() * 6) + 1
    );
    setCurrentRolls(finalRolls);

    const rollTotal = finalRolls.reduce((sum, roll) => sum + roll, 0);
    const totalModifier = modifier + (partnerBonus?.bonus || 0);
    const finalTotal = rollTotal + totalModifier;
    
    const newResult: DiceResult = {
      rolls: finalRolls,
      total: rollTotal,
      modifier: totalModifier,
      finalTotal,
      success: finalTotal >= difficulty,
      criticalSuccess: finalRolls.every(roll => roll === 6),
      criticalFailure: finalRolls.every(roll => roll === 1)
    };

    setResult(newResult);
    setIsRolling(false);
    setShowResult(true);

    if (onRoll) {
      onRoll(newResult);
    }
  };

  const getDiceFace = (value: number) => {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1] || '?';
  };

  const getResultColor = () => {
    if (!result) return 'text-gray-400';
    if (result.criticalSuccess) return 'text-yellow-400';
    if (result.criticalFailure) return 'text-red-600';
    if (result.success) return 'text-green-400';
    return 'text-red-400';
  };

  const getResultText = () => {
    if (!result) return '';
    if (result.criticalSuccess) return 'CRITICAL SUCCESS!';
    if (result.criticalFailure) return 'CRITICAL FAILURE!';
    if (result.success) return 'SUCCESS!';
    return 'FAILURE';
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Dice Display */}
      <div className="mb-6">
        <div className="flex justify-center gap-4 mb-4">
          <AnimatePresence mode="popLayout">
            {(currentRolls.length > 0 ? currentRolls : Array(numberOfDice).fill(1)).map((value, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: isRolling ? [0, 360] : 0,
                  y: isRolling ? [0, -20, 0] : 0
                }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  scale: { type: 'spring', stiffness: 500, damping: 30 },
                  rotate: { 
                    duration: isRolling ? 0.5 : 0.3,
                    repeat: isRolling ? Infinity : 0,
                    ease: 'linear'
                  },
                  y: {
                    duration: 0.5,
                    repeat: isRolling ? Infinity : 0,
                    ease: 'easeInOut'
                  }
                }}
                className={`
                  text-6xl bg-gray-800 border-2 rounded-lg p-4
                  ${isRolling 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/50' 
                    : result?.criticalSuccess && currentRolls[index] === 6
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                      : result?.criticalFailure && currentRolls[index] === 1
                        ? 'border-red-600 shadow-lg shadow-red-600/50'
                        : 'border-gray-600'
                  }
                `}
              >
                {getDiceFace(value)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modifiers Display */}
        {(modifier > 0 || partnerBonus) && (
          <div className="text-center space-y-1">
            {modifier > 0 && (
              <div className="text-sm text-gray-400">
                Base Modifier: <span className="text-cyan-400">+{modifier}</span>
              </div>
            )}
            {partnerBonus && (
              <div className="text-sm text-gray-400">
                {partnerBonus.name} {partnerBonus.stat}: <span className="text-purple-400">+{partnerBonus.bonus}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-6"
          >
            {/* Success/Failure Text */}
            <motion.h3
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`text-2xl font-bold mb-3 ${getResultColor()}`}
            >
              {getResultText()}
            </motion.h3>

            {/* Roll Breakdown */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-400">Roll:</span>
                <span className="text-white font-mono">
                  {result.rolls.join(' + ')} = {result.total}
                </span>
              </div>
              
              {result.modifier > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-400">Modifier:</span>
                  <span className="text-cyan-400 font-mono">+{result.modifier}</span>
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-xl font-bold text-white font-mono">
                      {result.finalTotal}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">vs</span>
                    <span className="text-orange-400 font-mono">DC {difficulty}</span>
                  </div>
                  
                  <div>
                    {result.success ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Messages */}
            {result.criticalSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 flex items-center justify-center gap-2 text-yellow-400"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Perfect execution!</span>
              </motion.div>
            )}
            
            {result.criticalFailure && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 text-red-600 font-medium"
              >
                Something went terribly wrong...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll Button */}
      <div className="text-center">
        <NeuraButton
          variant="primary"
          size="lg"
          onClick={rollDice}
          disabled={isRolling}
          className="min-w-48"
        >
          <Dices className="w-5 h-5 mr-2" />
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </NeuraButton>
      </div>
    </div>
  );
}