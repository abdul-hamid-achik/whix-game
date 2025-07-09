'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Shield, FileText, Phone, 
  HandHelpingIcon, AlertTriangle, Camera,
  ChevronRight, Heart, Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  CombatUnit, 
  CombatPosition, 
  COMBAT_GRID_SIZE, 
  ENEMY_DIALOGUE,
  COMBAT_ACTION_INFO,
  CombatAction,
  calculateDistance,
  getValidMoves,
  getTargetsInRange,
  calculateDamage,
  EnemyType
} from '@/lib/game/combat';

// Action icons
const ACTION_ICONS: Record<string, any> = {
  move: ChevronRight,
  negotiate: MessageCircle,
  argue: Shield,
  show_proof: FileText,
  de_escalate: HandHelpingIcon,
  call_support: Phone,
  apologize: Heart,
  document: Camera,
  ability: Zap,
  wait: AlertTriangle
};

interface EnhancedCombatViewProps {
  playerUnits: CombatUnit[];
  enemyUnits: CombatUnit[];
  background?: 'street' | 'restaurant' | 'lobby' | 'office' | 'residential';
  onCombatEnd: (victory: boolean, rewards?: any) => void;
}

export function EnhancedCombatView({ 
  playerUnits: initialPlayerUnits, 
  enemyUnits: initialEnemyUnits,
  background = 'street',
  onCombatEnd 
}: EnhancedCombatViewProps) {
  const [playerUnits, setPlayerUnits] = useState(initialPlayerUnits);
  const [enemyUnits, setEnemyUnits] = useState(initialEnemyUnits);
  const [_currentTurn, _setCurrentTurn] = useState<'player' | 'enemy'>('player');
  const [selectedUnit, setSelectedUnit] = useState<CombatUnit | null>(null);
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);
  const [validMoves, setValidMoves] = useState<CombatPosition[]>([]);
  const [validTargets, setValidTargets] = useState<CombatUnit[]>([]);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentDialogue, setCurrentDialogue] = useState<{ unit: CombatUnit; text: string } | null>(null);
  const [turnOrder, setTurnOrder] = useState<CombatUnit[]>([]);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);

  // Background styles
  const backgroundStyles = {
    street: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    restaurant: 'bg-gradient-to-br from-orange-900 via-red-800 to-orange-900',
    lobby: 'bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-900',
    office: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900',
    residential: 'bg-gradient-to-br from-green-900 via-emerald-800 to-green-900'
  };

  // Initialize combat
  useEffect(() => {
    // Show intro dialogue for enemies
    enemyUnits.forEach((enemy, index) => {
      setTimeout(() => {
        const enemyType = enemy.name.toLowerCase().replace(/ /g, '_') as EnemyType;
        const dialogue = ENEMY_DIALOGUE[enemyType];
        if (dialogue) {
          const intro = dialogue.intro[Math.floor(Math.random() * dialogue.intro.length)];
          showDialogue(enemy, intro);
          addToLog(`${enemy.name}: "${intro}"`);
        }
      }, index * 1500);
    });

    // Calculate turn order based on speed
    const allUnits = [...playerUnits, ...enemyUnits].sort((a, b) => b.stats.speed - a.stats.speed);
    setTurnOrder(allUnits);
  }, []);

  // Handle turn changes
  useEffect(() => {
    if (turnOrder.length > 0) {
      const currentUnit = turnOrder[currentUnitIndex];
      setSelectedUnit(currentUnit);
      
      if (currentUnit.type === 'enemy') {
        // AI turn
        setTimeout(() => handleAITurn(currentUnit), 1000);
      }
    }
  }, [currentUnitIndex, turnOrder]);

  const showDialogue = (unit: CombatUnit, text: string) => {
    setCurrentDialogue({ unit, text });
    setTimeout(() => setCurrentDialogue(null), 3000);
  };

  const addToLog = (message: string) => {
    setCombatLog(prev => [...prev, message]);
  };

  const handleActionSelect = (action: CombatAction) => {
    if (!selectedUnit || selectedUnit.type !== 'partner') return;
    
    setSelectedAction(action);
    
    if (action === 'move') {
      const moves = getValidMoves(selectedUnit, [...playerUnits, ...enemyUnits]);
      setValidMoves(moves);
      setValidTargets([]);
    } else if (action === 'wait') {
      endTurn();
    } else {
      // Combat actions target enemies
      const targets = getTargetsInRange(selectedUnit, [...playerUnits, ...enemyUnits], 1);
      setValidTargets(targets);
      setValidMoves([]);
    }
  };

  const handleCellClick = (position: CombatPosition) => {
    if (!selectedUnit || !selectedAction || selectedAction !== 'move') return;
    
    if (validMoves.some(pos => pos.x === position.x && pos.y === position.y)) {
      // Move unit with animation and sound feedback
      const updatedUnits = playerUnits.map(unit => 
        unit.id === selectedUnit.id 
          ? { ...unit, position } 
          : unit
      );
      setPlayerUnits(updatedUnits);
      
      // Update turn order positions
      setTurnOrder(prev => prev.map(unit => 
        unit.id === selectedUnit.id 
          ? { ...unit, position }
          : unit
      ));
      
      addToLog(`${selectedUnit.name} repositioned to sector (${position.x}, ${position.y})`);
      
      // Clear selection and end turn
      setSelectedAction(null);
      setValidMoves([]);
      setValidTargets([]);
      endTurn();
    }
  };

  const handleUnitClick = (target: CombatUnit) => {
    if (!selectedUnit || !selectedAction || selectedAction === 'move') return;
    
    if (validTargets.some(t => t.id === target.id)) {
      performAction(selectedUnit, target, selectedAction);
    }
  };

  const performAction = (attacker: CombatUnit, target: CombatUnit, action: CombatAction) => {
    let message = '';
    let _damage = 0;
    
    switch (action) {
      case 'negotiate':
        _damage = Math.floor(attacker.stats.attack * 0.8);
        message = `${attacker.name} tries to negotiate with ${target.name}`;
        showDialogue(attacker, "Please, I'm just trying to make a living!");
        break;
        
      case 'argue':
        _damage = attacker.stats.attack;
        message = `${attacker.name} argues back at ${target.name}`;
        showDialogue(attacker, "That's not fair and you know it!");
        break;
        
      case 'show_proof':
        _damage = Math.floor(attacker.stats.attack * 1.2);
        message = `${attacker.name} shows delivery proof to ${target.name}`;
        showDialogue(attacker, "Look, here's the confirmation!");
        break;
        
      case 'de_escalate':
        _damage = Math.floor(attacker.stats.attack * 0.6);
        message = `${attacker.name} tries to calm down ${target.name}`;
        showDialogue(attacker, "Let's all just calm down...");
        break;
        
      case 'call_support':
        _damage = Math.floor(attacker.stats.attack * 0.7);
        message = `${attacker.name} calls WHIX support`;
        showDialogue(attacker, "Hello, support? I have a situation...");
        setTimeout(() => showDialogue(attacker, "They put me on hold..."), 1500);
        break;
        
      case 'apologize':
        _damage = Math.floor(attacker.stats.attack * 0.5);
        message = `${attacker.name} apologizes to ${target.name}`;
        showDialogue(attacker, "I'm sorry for the inconvenience...");
        break;
        
      case 'document':
        _damage = Math.floor(attacker.stats.attack * 0.9);
        message = `${attacker.name} documents the interaction`;
        showDialogue(attacker, "This is being recorded for my protection.");
        break;
    }
    
    // Calculate actual damage
    const actualDamage = calculateDamage(attacker, target);
    
    // Apply damage
    const updatedEnemies = enemyUnits.map(enemy => 
      enemy.id === target.id 
        ? { ...enemy, stats: { ...enemy.stats, currentHealth: Math.max(0, enemy.stats.currentHealth - actualDamage) } }
        : enemy
    );
    setEnemyUnits(updatedEnemies);
    
    // Show enemy hurt dialogue
    const enemyType = target.name.toLowerCase().replace(/ /g, '_') as EnemyType;
    const dialogue = ENEMY_DIALOGUE[enemyType];
    if (dialogue) {
      const hurt = dialogue.hurt[Math.floor(Math.random() * dialogue.hurt.length)];
      showDialogue(target, hurt);
    }
    
    addToLog(`${message} dealing ${actualDamage} stress damage!`);
    
    // Check if enemy is defeated
    if (updatedEnemies.find(e => e.id === target.id)?.stats.currentHealth === 0) {
      handleUnitDefeat(target);
    }
    
    endTurn();
  };

  const handleUnitDefeat = (unit: CombatUnit) => {
    if (unit.type === 'enemy') {
      const enemyType = unit.name.toLowerCase().replace(/ /g, '_') as EnemyType;
      const dialogue = ENEMY_DIALOGUE[enemyType];
      if (dialogue) {
        const defeat = dialogue.defeat[Math.floor(Math.random() * dialogue.defeat.length)];
        showDialogue(unit, defeat);
      }
      addToLog(`${unit.name} gives up!`);
      
      // Remove from turn order
      setTurnOrder(prev => prev.filter(u => u.id !== unit.id));
    }
  };

  const handleAITurn = (aiUnit: CombatUnit) => {
    // Enhanced AI - move towards closest player and attack
    const alivePlayers = playerUnits.filter(p => p.stats.currentHealth > 0);
    
    if (alivePlayers.length === 0) {
      endTurn();
      return;
    }
    
    const closestPlayer = alivePlayers
      .sort((a, b) => calculateDistance(aiUnit.position, a.position) - calculateDistance(aiUnit.position, b.position))[0];
    
    const distance = calculateDistance(aiUnit.position, closestPlayer.position);
    
    if (distance === 1) {
      // Attack the closest player
      const enemyType = aiUnit.name.toLowerCase().replace(/ /g, '_') as EnemyType;
      const dialogue = ENEMY_DIALOGUE[enemyType];
      if (dialogue) {
        const attack = dialogue.attack[Math.floor(Math.random() * dialogue.attack.length)];
        showDialogue(aiUnit, attack);
      }
      
      const damage = calculateDamage(aiUnit, closestPlayer);
      const updatedPlayers = playerUnits.map(player => 
        player.id === closestPlayer.id 
          ? { ...player, stats: { ...player.stats, currentHealth: Math.max(0, player.stats.currentHealth - damage) } }
          : player
      );
      setPlayerUnits(updatedPlayers);
      
      addToLog(`${aiUnit.name} attacks ${closestPlayer.name} for ${damage} damage!`);
      
      // Check if player is defeated
      if (updatedPlayers.find(p => p.id === closestPlayer.id)?.stats.currentHealth === 0) {
        addToLog(`${closestPlayer.name} has been defeated!`);
        // Remove from turn order
        setTurnOrder(prev => prev.filter(u => u.id !== closestPlayer.id));
      }
    } else {
      // Move towards player using improved pathfinding
      const allUnits = [...playerUnits, ...enemyUnits];
      const moves = getValidMoves(aiUnit, allUnits, 2);
      
      if (moves.length > 0) {
        // Choose the move that gets closest to the target
        const bestMove = moves
          .sort((a, b) => calculateDistance(a, closestPlayer.position) - calculateDistance(b, closestPlayer.position))[0];
        
        const updatedEnemies = enemyUnits.map(enemy => 
          enemy.id === aiUnit.id 
            ? { ...enemy, position: bestMove }
            : enemy
        );
        setEnemyUnits(updatedEnemies);
        addToLog(`${aiUnit.name} moves closer to ${closestPlayer.name}!`);
      } else {
        // No valid moves, wait
        addToLog(`${aiUnit.name} waits for an opportunity...`);
      }
    }
    
    setTimeout(() => endTurn(), 1000);
  };

  const endTurn = () => {
    setSelectedAction(null);
    setValidMoves([]);
    setValidTargets([]);
    
    // Check victory/defeat conditions first
    const activeEnemies = enemyUnits.filter(e => e.stats.currentHealth > 0);
    const activePlayers = playerUnits.filter(p => p.stats.currentHealth > 0);
    
    if (activeEnemies.length === 0) {
      // Victory!
      addToLog('✅ All conflicts resolved! Customer satisfaction maintained.');
      setTimeout(() => {
        onCombatEnd(true, { tips: 150, experience: 75 });
      }, 1000);
      return;
    } else if (activePlayers.length === 0) {
      // Defeat
      addToLog('❌ All delivery partners overwhelmed. WHIX rating decreased.');
      setTimeout(() => {
        onCombatEnd(false);
      }, 1000);
      return;
    }
    
    // Move to next unit in turn order
    const aliveTurnOrder = turnOrder.filter(unit => 
      unit.type === 'partner' 
        ? playerUnits.some(p => p.id === unit.id && p.stats.currentHealth > 0)
        : enemyUnits.some(e => e.id === unit.id && e.stats.currentHealth > 0)
    );
    
    if (aliveTurnOrder.length > 0) {
      const nextIndex = (currentUnitIndex + 1) % aliveTurnOrder.length;
      setCurrentUnitIndex(nextIndex);
      setTurnOrder(aliveTurnOrder);
    }
  };

  // Create grid
  const grid = Array(COMBAT_GRID_SIZE).fill(null).map(() => Array(COMBAT_GRID_SIZE).fill(null));
  
  // Place units on grid
  [...playerUnits, ...enemyUnits].forEach(unit => {
    if (unit.position.x >= 0 && unit.position.x < COMBAT_GRID_SIZE && 
        unit.position.y >= 0 && unit.position.y < COMBAT_GRID_SIZE &&
        unit.stats.currentHealth > 0) {
      grid[unit.position.y][unit.position.x] = unit;
    }
  });

  const isValidMove = (x: number, y: number) => {
    return validMoves.some(pos => pos.x === x && pos.y === y);
  };
  
  const isValidTarget = (unit: CombatUnit) => {
    return validTargets.some(target => target.id === unit.id);
  };

  return (
    <div className={cn('min-h-screen', backgroundStyles[background])}>
      <div className="container mx-auto p-4">
        {/* Combat Header */}
        <div className="mb-4">
          <Card className="bg-black/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Neural Delivery Conflict</CardTitle>
              <CardDescription>Defend your earnings and maintain your WHIX rating!</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Combat Area */}
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Combat Grid */}
          <div className="lg:col-span-3">
            <Card className="bg-black/50 border-gray-700 p-4">
              <div className="relative">
                {/* Grid */}
                <div className="grid grid-cols-7 gap-1 mx-auto" style={{ width: 'fit-content' }}>
                  {grid.map((row, y) => 
                    row.map((unit, x) => (
                      <motion.div
                        key={`${x}-${y}`}
                        className={cn(
                          "w-16 h-16 border-2 rounded-lg relative cursor-pointer transition-all",
                          "bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm",
                          selectedUnit && unit?.id === selectedUnit.id && "ring-2 ring-yellow-400 bg-yellow-900/30",
                          isValidMove(x, y) && "bg-green-900/50 border-green-400 animate-pulse",
                          unit && isValidTarget(unit) && "bg-red-900/50 border-red-400 animate-pulse",
                          "border-gray-600/50"
                        )}
                        onClick={() => unit ? handleUnitClick(unit) : handleCellClick({ x, y })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {unit && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 p-1 flex flex-col items-center justify-center"
                          >
                            {/* Character representation */}
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs relative overflow-hidden",
                              unit.type === 'partner' ? "bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-blue-400" : "bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-400",
                              "shadow-lg"
                            )}>
                              {/* Character initials with better styling */}
                              <span className="z-10 drop-shadow-sm">
                                {unit.name.substring(0, 2).toUpperCase()}
                              </span>
                              
                              {/* Glowing effect */}
                              <div className={cn(
                                "absolute inset-0 rounded-lg opacity-30",
                                unit.type === 'partner' ? "bg-blue-400" : "bg-red-400"
                              )} />
                            </div>
                            
                            {/* Health bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b">
                              <div 
                                className={cn(
                                  "h-full rounded-b transition-all",
                                  unit.type === 'partner' ? "bg-green-500" : "bg-red-500"
                                )}
                                style={{ width: `${(unit.stats.currentHealth / unit.stats.maxHealth) * 100}%` }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Dialogue Bubbles */}
                <AnimatePresence>
                  {currentDialogue && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10"
                      style={{
                        left: `${currentDialogue.unit.position.x * 68 + 34}px`,
                        top: `${currentDialogue.unit.position.y * 68 - 40}px`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="bg-white text-black p-2 rounded-lg shadow-lg max-w-xs">
                        <div className="text-sm">{currentDialogue.text}</div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              {selectedUnit && selectedUnit.type === 'partner' && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {Object.entries(COMBAT_ACTION_INFO).map(([action, info]) => {
                    const Icon = ACTION_ICONS[action];
                    return (
                      <Button
                        key={action}
                        variant={selectedAction === action ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleActionSelect(action as CombatAction)}
                        className="flex flex-col items-center p-2 h-auto"
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-xs">{info.name}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Turn Order */}
            <Card className="bg-black/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Turn Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  {turnOrder.slice(0, 5).map((unit, index) => (
                    <div
                      key={unit.id}
                      className={cn(
                        "flex items-center gap-2 p-1 rounded",
                        index === 0 && "bg-yellow-900/30 border border-yellow-600/50"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        unit.type === 'partner' ? "bg-blue-600" : "bg-red-600"
                      )}>
                        {unit.name.charAt(0)}
                      </div>
                      <span className="text-xs flex-1">{unit.name}</span>
                      <span className="text-xs text-gray-400">{unit.stats.speed}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Combat Log */}
            <Card className="bg-black/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Combat Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto space-y-1">
                  {combatLog.slice(-10).map((log, index) => (
                    <p key={index} className="text-xs text-gray-400">
                      {log}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unit Stats */}
            {selectedUnit && (
              <Card className="bg-black/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedUnit.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Health</span>
                        <span>{selectedUnit.stats.currentHealth}/{selectedUnit.stats.maxHealth}</span>
                      </div>
                      <Progress 
                        value={(selectedUnit.stats.currentHealth / selectedUnit.stats.maxHealth) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Attack:</span> {selectedUnit.stats.attack}
                      </div>
                      <div>
                        <span className="text-gray-400">Defense:</span> {selectedUnit.stats.defense}
                      </div>
                      <div>
                        <span className="text-gray-400">Speed:</span> {selectedUnit.stats.speed}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}