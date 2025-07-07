'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArenaLobby } from './ArenaLobby';
import { ArenaMatch } from './ArenaMatch';
import { ArenaResults } from './ArenaResults';
import type { 
  ArenaMode as ArenaModeType,
  ArenaDifficulty,
  ArenaMatchResult,
} from '@/lib/systems/arena-system';
import { StoredPartner } from '@/lib/schemas/game-schemas';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';

// Arena state type
type ArenaState = 'lobby' | 'match' | 'results';

// Props type
type ArenaModeProps = {
  onClose: () => void;
};

export function ArenaMode({ onClose }: ArenaModeProps) {
  const [arenaState, setArenaState] = useState<ArenaState>('lobby');
  const [selectedMode, setSelectedMode] = useState<ArenaModeType>('training');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ArenaDifficulty>('rookie');
  const [selectedTeam, setSelectedTeam] = useState<StoredPartner[]>([]);
  const [matchResult, setMatchResult] = useState<ArenaMatchResult | null>(null);
  
  const { earnTips } = useGameStore();
  const { addPartnerExperience } = usePartnerStore();

  // Handle match start from lobby
  const handleStartMatch = ({
    mode,
    difficulty,
    selectedTeam: team,
  }: {
    mode: ArenaModeType;
    difficulty: ArenaDifficulty;
    selectedTeam: StoredPartner[];
  }) => {
    setSelectedMode(mode);
    setSelectedDifficulty(difficulty);
    setSelectedTeam(team);
    setArenaState('match');
  };

  // Handle match completion
  const handleMatchComplete = (result: ArenaMatchResult) => {
    setMatchResult(result);
    setArenaState('results');
    
    // Apply rewards
    if (result.rewards.tips > 0) {
      earnTips(result.rewards.tips);
    }
    
    // Apply experience to participating partners
    if (result.rewards.experience > 0) {
      selectedTeam.forEach(partner => {
        addPartnerExperience(partner.id, result.rewards.experience);
      });
    }
  };

  // Handle continuing from results
  const handleContinue = () => {
    onClose();
  };

  // Handle playing again
  const handlePlayAgain = () => {
    setArenaState('lobby');
    setMatchResult(null);
  };

  // Handle exit from match
  const handleExitMatch = () => {
    setArenaState('lobby');
  };

  return (
    <AnimatePresence mode="wait">
      {arenaState === 'lobby' && (
        <ArenaLobby
          key="lobby"
          onStartMatch={handleStartMatch}
          onClose={onClose}
        />
      )}
      
      {arenaState === 'match' && (
        <ArenaMatch
          key="match"
          mode={selectedMode}
          difficulty={selectedDifficulty}
          playerTeam={selectedTeam}
          onMatchComplete={handleMatchComplete}
          onExit={handleExitMatch}
        />
      )}
      
      {arenaState === 'results' && matchResult && (
        <ArenaResults
          key="results"
          result={matchResult}
          onContinue={handleContinue}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </AnimatePresence>
  );
}