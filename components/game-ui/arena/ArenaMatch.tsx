'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Heart, Zap, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  arenaSystem,
  ArenaOpponent,
  ArenaMatchResult,
} from '@/lib/systems/arena-system';
import type {
  ArenaMode,
  ArenaDifficulty,
} from '@/lib/systems/arena-system';
import { StoredPartner } from '@/lib/schemas/game-schemas';
import { cn } from '@/lib/utils';

// Props type
type ArenaMatchProps = {
  mode: ArenaMode;
  difficulty: ArenaDifficulty;
  playerTeam: StoredPartner[];
  onMatchComplete: (result: ArenaMatchResult) => void;
  onExit: () => void;
};

// Partner card in match
function MatchPartnerCard({ 
  partner, 
  isPlayer = true,
  isActive = false,
  health = 100,
  energy = 100,
}: {
  partner: StoredPartner;
  isPlayer?: boolean;
  isActive?: boolean;
  health?: number;
  energy?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative p-4 rounded-lg border-2 transition-all",
        isActive 
          ? "border-soviet-500 bg-soviet-500/10 shadow-lg" 
          : "border-gray-700 bg-gray-800/50",
        !isPlayer && "border-aztec-600 bg-aztec-600/10"
      )}
    >
      {isActive && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-soviet-600">Active</Badge>
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold">{partner.name}</h4>
          <p className="text-xs text-gray-400">
            Lv.{partner.level} {partner.class}
          </p>
        </div>
        
        {/* Health bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              HP
            </span>
            <span>{Math.round(health)}%</span>
          </div>
          <Progress 
            value={health} 
            className="h-2"
          />
        </div>
        
        {/* Energy bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              EN
            </span>
            <span>{Math.round(energy)}%</span>
          </div>
          <Progress 
            value={energy} 
            className="h-2"
          />
        </div>
        
        {/* Stats preview */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-gray-400" />
            <span>{partner.stats.stamina}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-gray-400" />
            <span>{partner.stats.focus}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Combat log entry
function CombatLogEntry({ entry }: { entry: { round: number; event: string; partnerId: string } }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="py-2 px-3 border-l-2 border-soviet-600/50 text-sm"
    >
      <span className="text-gray-500">Round {entry.round}:</span>{' '}
      <span className="text-gray-300">{entry.event}</span>
    </motion.div>
  );
}

export function ArenaMatch({ 
  mode, 
  difficulty, 
  playerTeam, 
  onMatchComplete, 
  onExit 
}: ArenaMatchProps) {
  const [opponent, setOpponent] = useState<ArenaOpponent | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [matchResult, setMatchResult] = useState<ArenaMatchResult | null>(null);
  const [combatLog, setCombatLog] = useState<{ round: number; event: string; partnerId: string }[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  // Partner states
  const [partnerStates, setPartnerStates] = useState<Record<string, { health: number; energy: number }>>({});
  const [activePlayerPartner, setActivePlayerPartner] = useState<string>('');
  const [activeOpponentPartner, setActiveOpponentPartner] = useState<string>('');

  // Generate opponent on mount
  useEffect(() => {
    const generatedOpponent = arenaSystem.generateOpponent(difficulty, mode);
    setOpponent(generatedOpponent);
    
    // Initialize partner states
    const states: Record<string, { health: number; energy: number }> = {};
    playerTeam.forEach(p => {
      states[p.id] = { health: 100, energy: 100 };
    });
    generatedOpponent.team.forEach(p => {
      states[p.id] = { health: 100, energy: 100 };
    });
    setPartnerStates(states);
    
    // Set initial active partners
    if (playerTeam.length > 0) setActivePlayerPartner(playerTeam[0].id);
    if (generatedOpponent.team.length > 0) setActiveOpponentPartner(generatedOpponent.team[0].id);
  }, [difficulty, mode, playerTeam]);

  // Start match
  const startMatch = () => {
    if (!opponent) return;
    
    setIsMatchActive(true);
    simulateMatch();
  };

  // Simulate match progression
  const simulateMatch = async () => {
    if (!opponent) return;
    
    const totalRounds = mode === 'survival' ? 10 : 5;
    
    for (let round = 1; round <= totalRounds; round++) {
      setCurrentRound(round);
      
      // Simulate round
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random round outcome
      const playerWinsRound = Math.random() > 0.5;
      
      if (playerWinsRound) {
        setPlayerScore(prev => prev + 1);
        const mvpPartner = playerTeam[Math.floor(Math.random() * playerTeam.length)];
        setCombatLog(prev => [...prev, {
          round,
          event: `${mvpPartner.name} secured the round with excellent strategy!`,
          partnerId: mvpPartner.id,
        }]);
      } else {
        setOpponentScore(prev => prev + 1);
        setCombatLog(prev => [...prev, {
          round,
          event: 'Opponent team dominates this round!',
          partnerId: 'opponent',
        }]);
      }
      
      // Update partner states (damage simulation)
      setPartnerStates(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          updated[id] = {
            health: Math.max(0, updated[id].health - Math.random() * 20),
            energy: Math.max(0, updated[id].energy - Math.random() * 15),
          };
        });
        return updated;
      });
      
      // Early exit if one side is dominant
      const scoreDiff = Math.abs(playerScore - opponentScore);
      const remainingRounds = totalRounds - round;
      if (scoreDiff > remainingRounds) break;
    }
    
    // Calculate final result
    const result = arenaSystem.calculateMatchResult(
      playerTeam,
      opponent.team,
      opponent.strategy,
      mode
    );
    
    setMatchResult(result);
    setIsMatchActive(false);
  };

  // Exit with forfeit
  const handleForfeit = () => {
    if (isMatchActive && !matchResult) {
      const forfeitResult: ArenaMatchResult = {
        winner: 'opponent',
        rounds: currentRound,
        playerScore,
        opponentScore,
        rewards: {
          tips: 0,
          experience: 0,
          rating: -20,
        },
        highlights: [{
          round: currentRound,
          event: 'Player forfeited the match',
          partnerId: 'player',
        }],
      };
      setMatchResult(forfeitResult);
      setIsMatchActive(false);
    } else {
      onExit();
    }
  };

  if (!opponent) {
    return <div>Loading opponent...</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-soviet-900 to-aztec-900 p-4 relative">
        <div className="absolute inset-0 bg-stone-texture opacity-10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Swords className="w-6 h-6" />
              <h2 className="text-xl font-bold">Arena Match</h2>
              <Badge variant="outline">{mode}</Badge>
              <Badge variant="outline">{difficulty}</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Round</p>
                <p className="text-2xl font-bold">{currentRound}</p>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleForfeit}
              >
                {isMatchActive ? 'Forfeit' : 'Exit'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="h-[calc(100vh-80px)] p-6">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player side */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Team</h3>
              <Badge variant="outline" className="text-2xl px-3 py-1">
                {playerScore}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {playerTeam.map((partner) => (
                <MatchPartnerCard
                  key={partner.id}
                  partner={partner}
                  isPlayer={true}
                  isActive={activePlayerPartner === partner.id}
                  health={partnerStates[partner.id]?.health || 100}
                  energy={partnerStates[partner.id]?.energy || 100}
                />
              ))}
            </div>
          </div>

          {/* Center - Combat log and actions */}
          <div className="space-y-4">
            {/* Score display */}
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center justify-center gap-4">
                <div className="text-3xl font-bold text-soviet-500">
                  {playerScore}
                </div>
                <div className="text-xl text-gray-500">VS</div>
                <div className="text-3xl font-bold text-aztec-500">
                  {opponentScore}
                </div>
              </div>
            </Card>

            {/* Combat actions */}
            {!isMatchActive && !matchResult && (
              <div className="text-center space-y-4">
                <p className="text-gray-400">
                  Ready to face {opponent.name}?
                </p>
                <Button
                  onClick={startMatch}
                  size="lg"
                  className="bg-soviet-600 hover:bg-soviet-700"
                >
                  Start Match
                </Button>
              </div>
            )}

            {/* Match result */}
            {matchResult && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <Card className={cn(
                  "p-6 text-center",
                  matchResult.winner === 'player'
                    ? "bg-green-900/30 border-green-600"
                    : "bg-red-900/30 border-red-600"
                )}>
                  <h3 className="text-2xl font-bold mb-2">
                    {matchResult.winner === 'player' ? 'Victory!' : 'Defeat'}
                  </h3>
                  <p className="text-gray-400">
                    Final Score: {matchResult.playerScore} - {matchResult.opponentScore}
                  </p>
                </Card>

                <Card className="p-4 bg-gray-800/50 border-gray-700">
                  <h4 className="font-semibold mb-2">Rewards</h4>
                  <div className="space-y-1 text-sm">
                    <p>💰 +{matchResult.rewards.tips} tips</p>
                    <p>⭐ +{matchResult.rewards.experience} exp</p>
                    {matchResult.rewards.rating && (
                      <p className={cn(
                        matchResult.rewards.rating > 0 
                          ? "text-green-500" 
                          : "text-red-500"
                      )}>
                        🏆 {matchResult.rewards.rating > 0 ? '+' : ''}{matchResult.rewards.rating} rating
                      </p>
                    )}
                  </div>
                </Card>

                <Button
                  onClick={() => onMatchComplete(matchResult)}
                  className="w-full bg-soviet-600 hover:bg-soviet-700"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Combat log */}
            {isMatchActive && (
              <Card className="p-4 bg-gray-800/50 border-gray-700 h-64 overflow-y-auto">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Combat Log
                </h4>
                <div className="space-y-1">
                  <AnimatePresence>
                    {combatLog.map((entry, index) => (
                      <CombatLogEntry key={index} entry={entry} />
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            )}
          </div>

          {/* Opponent side */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{opponent.name}</h3>
              <Badge variant="outline" className="text-2xl px-3 py-1">
                {opponentScore}
              </Badge>
            </div>
            
            <Badge className="bg-aztec-600">
              Strategy: {opponent.strategy}
            </Badge>
            
            <div className="space-y-3">
              {opponent.team.map((partner) => (
                <MatchPartnerCard
                  key={partner.id}
                  partner={partner}
                  isPlayer={false}
                  isActive={activeOpponentPartner === partner.id}
                  health={partnerStates[partner.id]?.health || 100}
                  energy={partnerStates[partner.id]?.energy || 100}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}