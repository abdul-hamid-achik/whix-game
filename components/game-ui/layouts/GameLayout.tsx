'use client';

import { useState } from 'react';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { HubLayout } from './HubLayout';
import { MissionBriefingLayout } from './MissionBriefingLayout';
import { PartnerSelectionLayout } from './PartnerSelectionLayout';
import { AdventureMapLayout } from './AdventureMapLayout';
import { TacticalCombatLayout } from './TacticalCombatLayout';
import { EventResolutionLayout } from './EventResolutionLayout';
import { AfterActionLayout } from './AfterActionLayout';
import { LoadingOverlay } from '../shared/LoadingOverlay';
import { Panel } from '../shared/Panel';
import { MissionHUD } from '../hud/MissionHUD';
import { CombatHUD } from '../hud/CombatHUD';
import { SettingsOverlay } from '../overlays/SettingsOverlay';
import { DailyContracts } from '../panels/DailyContracts';
import { CampaignSelection } from '../panels/CampaignSelection';
import { PartnerManagement } from '../panels/PartnerManagement';
import { GachaRecruitment } from '../panels/GachaRecruitment';
import { ShopSystem } from '../panels/ShopSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { NeuraButton } from '@/components/neura';

interface GameLayoutProps {
  children: React.ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  const { currentState, panels, isLoading, settings, contextData, hidePanel, setState } = useUIStore();
  const [showSettings, setShowSettings] = useState(false);

  const renderStateLayout = () => {
    switch (currentState) {
      case GameState.COURIER_HUB:
        return <HubLayout>{children}</HubLayout>;
      case GameState.MISSION_BRIEFING:
        return <MissionBriefingLayout>{children}</MissionBriefingLayout>;
      case GameState.PARTNER_SELECTION:
        return <PartnerSelectionLayout>{children}</PartnerSelectionLayout>;
      case GameState.ADVENTURE_MAP:
        return <AdventureMapLayout>{children}</AdventureMapLayout>;
      case GameState.TACTICAL_COMBAT:
        return <TacticalCombatLayout>{children}</TacticalCombatLayout>;
      case GameState.EVENT_RESOLUTION:
        return <EventResolutionLayout>{children}</EventResolutionLayout>;
      case GameState.AFTER_ACTION:
        return <AfterActionLayout>{children}</AfterActionLayout>;
      default:
        return <HubLayout>{children}</HubLayout>;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950/30 to-gray-950" />
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 30px 30px',
        }}
      />
      
      {/* Scanlines effect for cyberpunk theme */}
      {settings.theme === 'neura' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.3) 2px, rgba(0, 255, 255, 0.3) 4px)',
          }}
        />
      )}

      {/* Main Layout Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: settings.animations ? 0.3 : 0,
            ease: "easeInOut" 
          }}
          className="relative h-full w-full"
        >
          {renderStateLayout()}
        </motion.div>
      </AnimatePresence>

      {/* Overlay Panels */}
      <AnimatePresence>
        {Object.entries(panels).map(([panelId, panel]) => 
          panel.visible && (
            <Panel
              key={panelId}
              id={panelId}
              {...panel}
              title={
                panelId === 'dailyContracts' ? 'Daily Contracts' :
                panelId === 'campaignSelection' ? 'Select Campaign' :
                panelId === 'partnerManagement' ? 'Partner Management' :
                panelId === 'gachaRecruitment' ? 'Partner Recruitment' :
                panelId === 'shopSystem' ? 'WHIX Company Store' :
                undefined
              }
            >
              {panelId === 'dailyContracts' && (
                <DailyContracts 
                  onClose={() => hidePanel('dailyContracts')}
                  onSelectContract={(contract) => {
                    // Handle contract selection
                    hidePanel('dailyContracts');
                    setState(GameState.MISSION_BRIEFING, {
                      missionType: 'daily',
                      missionId: contract.id,
                      difficulty: contract.difficulty,
                    });
                  }}
                />
              )}
              {panelId === 'campaignSelection' && (
                <CampaignSelection
                  onSelectCampaign={(campaign) => {
                    // Handle campaign selection
                    hidePanel('campaignSelection');
                    setState(GameState.PARTNER_SELECTION, {
                      missionType: 'campaign',
                      campaignId: campaign.id,
                      campaignType: campaign.type,
                      difficulty: campaign.difficulty,
                    });
                  }}
                  onClose={() => hidePanel('campaignSelection')}
                />
              )}
              {panelId === 'partnerManagement' && (
                <PartnerManagement
                  onClose={() => hidePanel('partnerManagement')}
                />
              )}
              {panelId === 'gachaRecruitment' && (
                <GachaRecruitment
                  onClose={() => hidePanel('gachaRecruitment')}
                />
              )}
              {panelId === 'shopSystem' && (
                <ShopSystem
                  onClose={() => hidePanel('shopSystem')}
                />
              )}
            </Panel>
          )
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>

      {/* Mission HUD Overlay */}
      {[GameState.ADVENTURE_MAP, GameState.EVENT_RESOLUTION].includes(currentState) && (
        <MissionHUD 
          missionType={(contextData?.encounterType as 'delivery' | 'combat' | 'social' | 'puzzle') || 'delivery'}
          objective={contextData?.nodeData?.title || 'Complete the mission'}
          showSquadStatus={true}
        />
      )}

      {/* Combat HUD Overlay */}
      {currentState === GameState.TACTICAL_COMBAT && (
        <CombatHUD
          currentTurn={1}
          enemyCount={3}
          activeUnit={{
            id: '1',
            name: 'Active Partner',
            health: 100,
            maxHealth: 100,
            energy: 85,
            maxEnergy: 100,
            armor: 10
          }}
        />
      )}

      {/* Settings Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setShowSettings(true)}
      >
        <NeuraButton variant="ghost" size="sm" className="rounded-full p-2">
          <Settings className="w-5 h-5" />
        </NeuraButton>
      </motion.button>

      {/* Settings Overlay */}
      <SettingsOverlay 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}