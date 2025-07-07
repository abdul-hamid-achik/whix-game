'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Shield, Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { 
  arenaSystem,
} from '@/lib/systems/arena-system';
import type {
  ArenaMode, 
  ArenaDifficulty,
  ArenaRating,
  ArenaSeason,
} from '@/lib/systems/arena-system';
import { StoredPartner } from '@/lib/schemas/game-schemas';

// Props type
type ArenaLobbyProps = {
  onStartMatch: (args: {
    mode: ArenaMode;
    difficulty: ArenaDifficulty;
    selectedTeam: StoredPartner[];
  }) => void;
  onClose: () => void;
};

// Arena rating component
function ArenaRatingDisplay({ rating }: { rating: ArenaRating }) {
  const rankColors = {
    bronze: 'bg-amber-700',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500',
    diamond: 'bg-blue-500',
    master: 'bg-red-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold">Rating: {rating.rating}</span>
        </div>
        <Badge className={rankColors[rating.rank]}>
          {rating.rank.toUpperCase()}
        </Badge>
      </div>
      <div className="text-sm text-gray-400">
        <span className="text-green-500">{rating.wins}W</span>
        {' / '}
        <span className="text-red-500">{rating.losses}L</span>
        {rating.winStreak > 0 && (
          <span className="ml-2 text-yellow-500">
            🔥 {rating.winStreak} streak
          </span>
        )}
      </div>
    </div>
  );
}

// Team selection component
function TeamSelector({ 
  partners, 
  selectedTeam, 
  onTeamChange,
  maxTeamSize = 3 
}: {
  partners: StoredPartner[];
  selectedTeam: StoredPartner[];
  onTeamChange: (team: StoredPartner[]) => void;
  maxTeamSize?: number;
}) {
  const togglePartner = (partner: StoredPartner) => {
    const isSelected = selectedTeam.some(p => p.id === partner.id);
    
    if (isSelected) {
      onTeamChange(selectedTeam.filter(p => p.id !== partner.id));
    } else if (selectedTeam.length < maxTeamSize) {
      onTeamChange([...selectedTeam, partner]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Select Your Team</h3>
        <span className="text-sm text-gray-400">
          {selectedTeam.length} / {maxTeamSize} partners
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {partners.map((partner) => {
          const isSelected = selectedTeam.some(p => p.id === partner.id);
          const isDisabled = !isSelected && selectedTeam.length >= maxTeamSize;
          
          return (
            <motion.button
              key={partner.id}
              onClick={() => togglePartner(partner)}
              disabled={isDisabled}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-soviet-500 bg-soviet-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
              <div className="text-left">
                <p className="font-medium">{partner.name}</p>
                <p className="text-xs text-gray-400">
                  Lv.{partner.level} {partner.class}
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {partner.rarity}
                  </Badge>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function ArenaLobby({ onStartMatch, onClose }: ArenaLobbyProps) {
  const { } = useGameStore();
  const { partners } = usePartnerStore();
  const [selectedMode, setSelectedMode] = useState<ArenaMode>('training');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ArenaDifficulty>('rookie');
  const [selectedTeam, setSelectedTeam] = useState<StoredPartner[]>([]);
  const [currentSeason, setCurrentSeason] = useState<ArenaSeason | null>(null);
  const [playerRating, setPlayerRating] = useState<ArenaRating | null>(null);

  // Load season and rating data
  useEffect(() => {
    const season = arenaSystem.getCurrentSeason();
    setCurrentSeason(season);
    
    // Mock player rating - in real app this would come from server
    setPlayerRating({
      rating: 1200,
      wins: 15,
      losses: 8,
      winStreak: 3,
      bestStreak: 5,
      rank: 'silver',
      seasonId: season.id,
    });
  }, []);

  const modeDescriptions = {
    training: 'Practice against AI opponents to improve your skills',
    challenge: 'Face preset challenges with specific objectives',
    survival: 'See how long you can last against endless waves',
    pvp: 'Battle against teams from other players (simulated)',
  };

  const difficultyRewards = {
    rookie: { tips: '100-150', exp: '50-75' },
    veteran: { tips: '200-300', exp: '100-150' },
    elite: { tips: '400-600', exp: '200-300' },
    legendary: { tips: '800-1200', exp: '400-600' },
  };

  const canStartMatch = selectedTeam.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="w-full max-w-4xl bg-gray-900 rounded-xl border border-soviet-600/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-soviet-900 to-aztec-900 p-6 relative">
          <div className="absolute inset-0 bg-aztec-pattern opacity-10" />
          <div className="relative">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Swords className="w-6 h-6" />
                  Arena
                </h2>
                <p className="text-gray-300 mt-1">
                  Test your partners in combat challenges
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            {/* Season info */}
            {currentSeason && (
              <div className="mt-4 bg-black/20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {currentSeason.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    Ends in {Math.ceil((currentSeason.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Player rating */}
          {playerRating && (
            <Card className="p-4 bg-gray-800/50 border-gray-700">
              <ArenaRatingDisplay rating={playerRating} />
            </Card>
          )}

          {/* Mode selection */}
          <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as ArenaMode)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="training" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Training
              </TabsTrigger>
              <TabsTrigger value="challenge" className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Challenge
              </TabsTrigger>
              <TabsTrigger value="survival" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Survival
              </TabsTrigger>
              <TabsTrigger value="pvp" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                PvP
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedMode} className="mt-4">
              <Card className="p-4 bg-gray-800/30 border-gray-700">
                <p className="text-sm text-gray-400">
                  {modeDescriptions[selectedMode]}
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Difficulty selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Select Difficulty</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['rookie', 'veteran', 'elite', 'legendary'] as const).map((diff) => (
                <motion.button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${selectedDifficulty === diff
                      ? 'border-soviet-500 bg-soviet-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-medium capitalize">{diff}</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <p>💰 {difficultyRewards[diff].tips}</p>
                    <p>⭐ {difficultyRewards[diff].exp}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Team selection */}
          <TeamSelector
            partners={partners}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
            maxTeamSize={selectedMode === 'training' ? 2 : 3}
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onStartMatch({
                mode: selectedMode,
                difficulty: selectedDifficulty,
                selectedTeam,
              })}
              disabled={!canStartMatch}
              className="bg-soviet-600 hover:bg-soviet-700"
            >
              <span className="flex items-center gap-2">
                Start Match
                <ChevronRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}