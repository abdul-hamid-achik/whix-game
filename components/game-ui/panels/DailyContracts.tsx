'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Target, CheckCircle, 
  Lock, Zap, Trophy, Timer, Users, 
  Package, Shield, Eye, Puzzle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { getTerm } from '@/lib/config/delivery-mode-config';
import { 
  DailyContract, 
  ContractType, 
  dailyContractsSystem 
} from '@/lib/systems/daily-contracts-system';

interface DailyContractsProps {
  onClose?: () => void;
  onSelectContract?: (contract: DailyContract) => void;
}

const CONTRACT_ICONS: Record<ContractType, React.ReactNode> = {
  express_delivery: <Package className="w-5 h-5" />,
  data_courier: <Zap className="w-5 h-5" />,
  social_negotiation: <Users className="w-5 h-5" />,
  puzzle_solving: <Puzzle className="w-5 h-5" />,
  combat_escort: <Shield className="w-5 h-5" />,
  stealth_delivery: <Eye className="w-5 h-5" />,
  multi_drop: <Package className="w-5 h-5" />,
  timed_rush: <Timer className="w-5 h-5" />
};

const DIFFICULTY_COLORS = {
  easy: 'text-green-400 border-green-400',
  normal: 'text-blue-400 border-blue-400',
  hard: 'text-orange-400 border-orange-400',
  extreme: 'text-red-400 border-red-400'
};

export function DailyContracts({ onSelectContract }: DailyContractsProps) {
  const { level, missionsCompleted } = useGameStore();
  const { getActivePartners } = usePartnerStore();
  const { settings } = useUIStore();
  const appMode = settings.appMode || 'game';
  const [contracts, setContracts] = useState<DailyContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<DailyContract | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Generate contracts for today
  useEffect(() => {
    const today = new Date();
    const generatedContracts = dailyContractsSystem.generateDailyContracts(today, level);
    setContracts(generatedContracts);
  }, [level]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSelectContract = (contract: DailyContract) => {
    setSelectedContract(contract);
  };

  const handleAcceptContract = () => {
    if (selectedContract && onSelectContract) {
      onSelectContract(selectedContract);
    }
  };

  // Get active partner traits and class
  const activePartners = getActivePartners();
  const activePartner = activePartners.length > 0 ? activePartners[0] : null;
  const playerTraits: string[] = activePartner ? [
    activePartner.primaryTrait,
    activePartner.secondaryTrait,
    activePartner.tertiaryTrait
  ].filter((trait) => trait !== undefined) : [];
  const playerClass = activePartner?.class || '';

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {getTerm('DAILY_CONTRACTS', appMode)}
            </h2>
            <p className="text-gray-400 mt-1">
              {appMode === 'delivery' ? 'Accept and complete delivery orders for extra earnings' : 'Complete time-limited challenges for bonus rewards'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Resets in</div>
            <div className="text-xl font-mono text-orange-400">{timeUntilReset}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{appMode === 'delivery' ? 'Orders Available' : 'Contracts Available'}</p>
                  <p className="text-2xl font-bold">{contracts.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed Today</p>
                  <p className="text-2xl font-bold">
                    {contracts.filter(c => c.completed).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{getTerm('TIPS', appMode)} Earned</p>
                  <p className="text-2xl font-bold">
                    {contracts
                      .filter(c => c.completed && c.claimed)
                      .reduce((sum, c) => sum + c.rewards.tips, 0)}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-3">{appMode === 'delivery' ? 'Available Orders' : 'Available Contracts'}</h3>
          
          {contracts.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {appMode === 'delivery' ? "Loading today's delivery orders..." : "Loading today's contracts..."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {contracts.map((contract, index) => {
                const canAccept = dailyContractsSystem.canAcceptContract(
                  contract,
                  level,
                  playerTraits,
                  playerClass,
                  missionsCompleted
                );
                
                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={cn(
                        "bg-gray-800/50 border-gray-700 cursor-pointer transition-all",
                        "hover:bg-gray-800/70 hover:border-gray-600",
                        selectedContract?.id === contract.id && "border-orange-500 bg-gray-800/70",
                        contract.completed && "opacity-50"
                      )}
                      onClick={() => !contract.completed && handleSelectContract(contract)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg bg-gray-700/50",
                              contract.completed && "bg-green-900/30"
                            )}>
                              {CONTRACT_ICONS[contract.type]}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{contract.title}</h4>
                              <p className="text-sm text-gray-400">{appMode === 'delivery' ? 'from' : 'by'} {contract.clientName}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={DIFFICULTY_COLORS[contract.difficulty]}
                          >
                            {contract.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-3">
                          {contract.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Timer className="w-4 h-4" />
                              {contract.timeLimit}m
                            </span>
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Zap className="w-4 h-4" />
                              {contract.rewards.tips}
                            </span>
                          </div>
                          
                          {contract.completed ? (
                            <Badge className="bg-green-900/30 text-green-400">
                              Completed
                            </Badge>
                          ) : !canAccept.canAccept ? (
                            <div className="flex items-center gap-1 text-red-400">
                              <Lock className="w-4 h-4" />
                              <span className="text-xs">{canAccept.reason}</span>
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Contract Details */}
        <div>
          <h3 className="text-xl font-semibold mb-3">{appMode === 'delivery' ? 'Order Details' : 'Contract Details'}</h3>
          
          {selectedContract ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedContract.title}</span>
                    <Badge 
                      variant="outline" 
                      className={DIFFICULTY_COLORS[selectedContract.difficulty]}
                    >
                      {selectedContract.difficulty}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{appMode === 'delivery' ? 'Customer' : 'Client'}</h4>
                    <p className="text-gray-400">{selectedContract.clientName}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-400">{selectedContract.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">{appMode === 'delivery' ? 'Delivery Requirements' : 'Objectives'}</h4>
                    <div className="space-y-2">
                      {selectedContract.objectives.map((obj) => (
                        <div key={obj.id} className="flex items-center gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2",
                            obj.completed 
                              ? "bg-green-500 border-green-500" 
                              : "border-gray-600"
                          )}>
                            {obj.completed && <CheckCircle className="w-4 h-4" />}
                          </div>
                          <span className={cn(
                            "text-sm",
                            obj.completed && "line-through text-gray-500"
                          )}>
                            {obj.description}
                            {obj.target && obj.target > 1 && (
                              <span className="text-gray-500 ml-1">
                                ({obj.progress}/{obj.target})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Rewards</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tips</span>
                        <span className="text-yellow-400 font-semibold">
                          {selectedContract.rewards.tips}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Experience</span>
                        <span className="text-blue-400 font-semibold">
                          {selectedContract.rewards.experience} XP
                        </span>
                      </div>
                      {selectedContract.rewards.bonusObjective && (
                        <div className="mt-2 p-2 bg-orange-900/20 rounded">
                          <p className="text-sm font-semibold text-orange-400">
                            Bonus Objective
                          </p>
                          <p className="text-sm text-gray-400">
                            {selectedContract.rewards.bonusObjective.description}
                          </p>
                          <p className="text-sm text-yellow-400">
                            +{selectedContract.rewards.bonusObjective.reward} Tips
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Timer className="w-4 h-4" />
                    <span>Time Limit: {selectedContract.timeLimit} minutes</span>
                  </div>
                  
                  {!selectedContract.completed && (
                    <Button
                      className="w-full"
                      onClick={handleAcceptContract}
                      disabled={!dailyContractsSystem.canAcceptContract(
                        selectedContract,
                        level,
                        playerTraits,
                        playerClass,
                        missionsCompleted
                      ).canAccept}
                    >
                      {appMode === 'delivery' ? 'Accept Order' : 'Accept Contract'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {appMode === 'delivery' ? 'Select an order to view details' : 'Select a contract to view details'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}