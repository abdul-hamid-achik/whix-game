'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SocialEncounterView } from '@/components/game/SocialEncounterView';
import { DeliveryNavigationView } from '@/components/game/DeliveryNavigationView';
import { useEncounterFromMarkdown } from '@/lib/hooks/useEncounter';
import { DistrictId } from '@/lib/game/district-templates';
import { useGameStore } from '@/lib/stores/gameStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { useChapterMapStore } from '@/lib/stores/chapterMapStore';

// Default encounters for different scenarios
const DEFAULT_ENCOUNTERS: Record<string, string> = {
  'angry_customer': 'angry-customer-cold-food',
  'karen_customer': 'karen-manager-demand',
  'bourgeois_resident': 'wealthy-resident-complaint',
  'corporate_manager': 'corporate-performance-review',
  'random': 'angry-customer-cold-food', // fallback
};

// District mapping
const DISTRICT_MAP: Record<string, DistrictId> = {
  'cathedral': 'cathedral-district',
  'industrial': 'industrial-district',
  'polanco': 'nuevo-polanco-district',
  'labyrinth': 'labyrinthine-district',
};

export default function CombatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { earnTips, gainExperience } = useGameStore();
  const { setState } = useUIStore();
  const { completeNode } = useChapterMapStore();
  
  // Get parameters
  const isStoryCombat = searchParams.get('story') === 'true';
  const nodeId = searchParams.get('nodeId');
  const enemyType = searchParams.get('enemy') || 'random';
  const encounterId = searchParams.get('encounter');
  const districtParam = searchParams.get('district');
  const useGrid = searchParams.get('grid') === 'true';
  
  // Determine if we're using grid navigation or direct encounter
  const isGridMode = useGrid || districtParam;
  const districtId = districtParam ? DISTRICT_MAP[districtParam] || 'cathedral-district' : 'cathedral-district';
  const finalEncounterId = encounterId || DEFAULT_ENCOUNTERS[enemyType] || DEFAULT_ENCOUNTERS.random;
  
  // Load encounter (only if not in grid mode)
  const { encounter, loading, error } = useEncounterFromMarkdown(isGridMode ? '' : finalEncounterId);
  
  useEffect(() => {
    setState(GameState.TACTICAL_COMBAT);
  }, [setState]);
  
  const handleCombatEnd = (outcome: 'victory' | 'defeat', rewards?: { tips?: number; experience?: number }) => {
    if (outcome === 'victory') {
      // Apply rewards
      if (rewards) {
        if (rewards.tips) earnTips(rewards.tips);
        if (rewards.experience) gainExperience(rewards.experience);
        // Additional rewards handling can be added here
      }
      
      // Complete story node if applicable
      if (isStoryCombat && nodeId) {
        completeNode(nodeId);
      }
      
      // Show success message and navigate
      setTimeout(() => {
        if (isStoryCombat) {
          router.push('/story/map');
        } else {
          router.push('/hub');
        }
      }, 2000);
    } else {
      // On defeat, show retry option
      setTimeout(() => {
        if (isStoryCombat) {
          router.push('/story/map');
        } else {
          router.push('/hub');
        }
      }, 3000);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Preparing encounter...</p>
        </motion.div>
      </div>
    );
  }
  
  // Error state
  if (error || !encounter) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Encounter Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || `Unable to load encounter: ${encounterId}`}
          </p>
          <button
            onClick={() => router.push('/hub')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Hub
          </button>
        </motion.div>
      </div>
    );
  }
  
  // Render based on mode
  if (isGridMode) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full p-4"
        >
          <DeliveryNavigationView
            districtId={districtId}
            onDeliveryComplete={handleCombatEnd}
            className="h-full"
          />
        </motion.div>
      </div>
    );
  }
  
  // Render encounter
  return (
    <div className="h-screen bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <SocialEncounterView
          encounter={encounter}
          onComplete={handleCombatEnd}
          className="h-full"
        />
      </motion.div>
    </div>
  );
}