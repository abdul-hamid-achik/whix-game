'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Swords, 
  Shield, 
  Zap, 
  Package, 
  Eye, 
  Move,
  RotateCcw,
  Flag,
  ChevronRight,
  Target,
  Heart,
  Brain
} from 'lucide-react';
import { NeuraButton, NeuraPanel } from '@/components/neura';
import { useUIStore } from '@/lib/stores/uiStore';
import { getTerm } from '@/lib/config/delivery-mode-config';

interface Action {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  energyCost: number;
  cooldown?: number;
  currentCooldown?: number;
  category: 'basic' | 'skill' | 'item' | 'special';
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: Action[];
  currentEnergy: number;
  maxEnergy: number;
  onActionSelect: (actionId: string) => void;
  onEndTurn: () => void;
  onCancel?: () => void;
  selectedActionId?: string;
  isWaitingForTarget?: boolean;
}

export function ActionMenu({
  actions,
  currentEnergy,
  maxEnergy,
  onActionSelect,
  onEndTurn,
  onCancel,
  selectedActionId,
  isWaitingForTarget = false
}: ActionMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('basic');
  const { settings } = useUIStore();
  const appMode = settings.appMode || 'game';

  const categorizedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  const categoryIcons = {
    basic: Move,
    skill: Zap,
    item: Package,
    special: Brain
  };

  const categoryLabels = appMode === 'delivery' ? {
    basic: 'Navigation',
    skill: 'Driver Skills',
    item: 'Equipment',
    special: 'Emergency'
  } : {
    basic: 'Basic Actions',
    skill: 'Skills',
    item: 'Items',
    special: 'Special'
  };

  return (
    <div className="w-80">
      <NeuraPanel variant="primary">
        <div className="p-4">
          {/* Energy Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">{getTerm('ENERGY', appMode)}</span>
              <span className="text-sm text-cyan-400 font-mono">
                {currentEnergy}/{maxEnergy}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentEnergy / maxEnergy) * 100}%` }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </div>

          {/* Action Categories */}
          <div className="space-y-2">
            {Object.entries(categorizedActions).map(([category, categoryActions]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const isExpanded = expandedCategory === category;

              return (
                <div key={category}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                    className={`
                      w-full flex items-center justify-between p-2 rounded-lg transition-colors
                      ${isExpanded 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({categoryActions.length})
                      </span>
                    </div>
                    <ChevronRight className={`
                      w-4 h-4 transition-transform
                      ${isExpanded ? 'rotate-90' : ''}
                    `} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-1">
                          {categoryActions.map(action => {
                            const isSelected = action.id === selectedActionId;
                            const canAfford = currentEnergy >= action.energyCost;
                            const onCooldown = action.currentCooldown && action.currentCooldown > 0;
                            const isDisabled = !!(action.disabled || !canAfford || onCooldown);

                            return (
                              <motion.button
                                key={action.id}
                                whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                                onClick={() => !isDisabled && onActionSelect(action.id)}
                                disabled={isDisabled}
                                className={`
                                  w-full p-3 rounded-lg border transition-all text-left
                                  ${isSelected
                                    ? 'border-yellow-400 bg-yellow-400/20'
                                    : isDisabled
                                      ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                                      : 'border-gray-600 bg-gray-800/50 hover:border-purple-500/50'
                                  }
                                `}
                              >
                                <div className="flex items-start gap-3">
                                  <action.icon className={`
                                    w-5 h-5 mt-0.5
                                    ${isSelected ? 'text-yellow-400' : 'text-gray-400'}
                                  `} />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                      <h4 className={`
                                        font-medium
                                        ${isSelected ? 'text-yellow-400' : 'text-white'}
                                      `}>
                                        {action.name}
                                      </h4>
                                      <span className={`
                                        text-xs font-mono
                                        ${!canAfford ? 'text-red-400' : 'text-cyan-400'}
                                      `}>
                                        {action.energyCost} ⚡
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      {action.description}
                                    </p>
                                    {onCooldown && (
                                      <p className="text-xs text-orange-400 mt-1">
                                        Cooldown: {action.currentCooldown} turns
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            {isWaitingForTarget && (
              <NeuraButton
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={onCancel}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancel
              </NeuraButton>
            )}
            
            <NeuraButton
              variant="primary"
              className="w-full"
              onClick={onEndTurn}
            >
              <Flag className="w-4 h-4 mr-2" />
              {appMode === 'delivery' ? 'Continue Route' : 'End Turn'}
            </NeuraButton>
          </div>
        </div>
      </NeuraPanel>

      {/* Target Indicator */}
      {isWaitingForTarget && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          <NeuraPanel variant="secondary" className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400">Select a target...</span>
            </div>
          </NeuraPanel>
        </motion.div>
      )}
    </div>
  );
}

// Example actions for testing
export const getExampleActions = (appMode: 'game' | 'delivery' = 'game'): Action[] => appMode === 'delivery' ? [
  {
    id: 'move',
    name: 'Navigate',
    icon: Move,
    description: 'Move to next location',
    energyCost: 1,
    category: 'basic'
  },
  {
    id: 'attack',
    name: 'Bypass Obstacle',
    icon: Swords,
    description: 'Clear traffic or construction',
    energyCost: 2,
    category: 'basic'
  },
  {
    id: 'defend',
    name: 'Safe Stop',
    icon: Shield,
    description: 'Wait safely for 1 turn',
    energyCost: 1,
    category: 'basic'
  },
  {
    id: 'neural-surge',
    name: 'Pattern Analysis',
    icon: Brain,
    description: 'Find optimal route through traffic',
    energyCost: 4,
    cooldown: 3,
    category: 'skill'
  },
  {
    id: 'heal',
    name: 'Energy Drink',
    icon: Heart,
    description: 'Restore 30 stamina',
    energyCost: 3,
    category: 'item'
  },
  {
    id: 'scan',
    name: 'Traffic Scanner',
    icon: Eye,
    description: 'Reveal alternate routes',
    energyCost: 2,
    category: 'skill'
  }
] : [
  {
    id: 'move',
    name: 'Move',
    icon: Move,
    description: 'Move to an adjacent tile',
    energyCost: 1,
    category: 'basic'
  },
  {
    id: 'attack',
    name: 'Basic Attack',
    icon: Swords,
    description: 'Deal damage to a target',
    energyCost: 2,
    category: 'basic'
  },
  {
    id: 'defend',
    name: 'Defend',
    icon: Shield,
    description: 'Gain 5 armor for 1 turn',
    energyCost: 1,
    category: 'basic'
  },
  {
    id: 'neural-surge',
    name: 'Neural Surge',
    icon: Brain,
    description: 'Deal area damage and stun',
    energyCost: 4,
    cooldown: 3,
    category: 'skill'
  },
  {
    id: 'heal',
    name: 'Healing Stim',
    icon: Heart,
    description: 'Restore 30 health',
    energyCost: 3,
    category: 'item'
  },
  {
    id: 'scan',
    name: 'Tactical Scan',
    icon: Eye,
    description: 'Reveal enemy weaknesses',
    energyCost: 2,
    category: 'skill'
  }
];

// For backwards compatibility
export const exampleActions = getExampleActions();