'use client';

import { useEffect } from 'react';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useMissionStore } from '@/lib/stores/missionStore';

export default function HubPage() {
  const { setState } = useUIStore();
  const { removeExpiredBoosts } = useGameStore();
  const { checkInjuryRecovery } = usePartnerStore();
  const { generateDailyMissions } = useMissionStore();
  const { level } = useGameStore();

  useEffect(() => {
    // Ensure we're in the correct state
    setState(GameState.COURIER_HUB);
    
    // Initialize game systems
    removeExpiredBoosts();
    checkInjuryRecovery();
    generateDailyMissions(level);
  }, [setState, removeExpiredBoosts, checkInjuryRecovery, generateDailyMissions, level]);

  // The HubLayout will render the main interface
  // This component just serves as the page container
  return (
    <div className="h-full">
      {/* The actual hub interface is rendered by HubLayout in the layout system */}
      <div className="text-center p-8">
        <p className="text-gray-400 text-sm">
          Welcome to the WHIX Courier Hub. Your operations center is loading...
        </p>
      </div>
    </div>
  );
}