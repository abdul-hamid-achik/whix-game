'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMissionStore } from '@/lib/stores/missionStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { cn } from '@/lib/utils';
import { 
  Puzzle
} from '@/lib/schemas/puzzle-schemas';

// Route optimization puzzle - find the most efficient delivery path
const generateRouteOptimizationPuzzle = (difficulty: number): Puzzle => {
  const gridSize = 4 + difficulty;
  const numDeliveries = 3 + difficulty;
  
  // Generate random delivery points
  const deliveryPoints = [];
  const usedPositions = new Set<string>();
  
  for (let i = 0; i < numDeliveries; i++) {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        priority: Math.random() > 0.5 ? 'urgent' : 'normal'
      };
    } while (usedPositions.has(`${pos.x},${pos.y}`));
    
    usedPositions.add(`${pos.x},${pos.y}`);
    deliveryPoints.push(pos);
  }
  
  return {
    id: `route-${Date.now()}`,
    type: 'route_optimization',
    difficulty,
    timeLimit: 60 + difficulty * 15,
    description: 'Plot the most efficient delivery route through Polanco. Prioritize urgent deliveries!',
    data: {
      gridSize,
      startPosition: { x: 0, y: 0 },
      deliveryPoints,
      obstacles: [] // Could add traffic zones later
    },
    solution: null // Calculate optimal path
  };
};

// Package sorting puzzle - organize deliveries by district and priority
const generatePackageSortingPuzzle = (difficulty: number): Puzzle => {
  const numPackages = 8 + difficulty * 2;
  const districts = ['Centro', 'Norte', 'Sur', 'Industrial', 'Residencial'];
  
  const packages = Array.from({ length: numPackages }, (_, i) => ({
    id: `PKG-${1000 + i}`,
    district: districts[Math.floor(Math.random() * districts.length)],
    priority: Math.random() > 0.7 ? 'urgent' : Math.random() > 0.4 ? 'normal' : 'low',
    weight: Math.floor(Math.random() * 20) + 1,
    fragile: Math.random() > 0.8
  }));
  
  return {
    id: `sort-${Date.now()}`,
    type: 'package_sorting',
    difficulty,
    timeLimit: 45 + difficulty * 10,
    description: 'Sort packages by district and priority. Urgent and fragile items need special handling!',
    data: {
      packages,
      sortingCriteria: ['district', 'priority', 'fragile']
    },
    solution: null
  };
};

export default function PuzzleMissionPage() {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [_playerSolution, _setPlayerSolution] = useState<unknown>(null);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  const { activeMissions, updateMissionProgress, completeMission } = useMissionStore();
  const { level, earnTips, gainExperience } = useGameStore();
  
  // Find the active puzzle mission
  const puzzleMission = activeMissions.find(m => m.missionId.includes('data_analysis'));
  
  useEffect(() => {
    if (puzzleMission && !currentPuzzle) {
      // Generate a puzzle based on mission difficulty
      const difficulty = Math.min(Math.floor(level / 10) + 1, 5);
      const puzzleType = Math.random() > 0.5 ? 'route_optimization' : 'package_sorting';
      
      const puzzle = puzzleType === 'route_optimization' 
        ? generateRouteOptimizationPuzzle(difficulty)
        : generatePackageSortingPuzzle(difficulty);
        
      setCurrentPuzzle(puzzle);
      setTimeRemaining(puzzle.timeLimit);
    }
  }, [puzzleMission, level]);
  
  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !puzzleComplete) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentPuzzle) {
      // Time's up!
      handlePuzzleFailure();
    }
  }, [timeRemaining, puzzleComplete]);
  
  const handlePuzzleFailure = () => {
    setPuzzleComplete(true);
    setScore(0);
    // Update mission progress as failed
    if (puzzleMission) {
      updateMissionProgress(puzzleMission.missionId, 'puzzle_solved', 0);
    }
  };
  
  const handlePuzzleSuccess = () => {
    setPuzzleComplete(true);
    const baseScore = 100;
    const timeBonus = Math.floor((timeRemaining / currentPuzzle!.timeLimit) * 50);
    const finalScore = baseScore + timeBonus;
    
    setScore(finalScore);
    
    // Rewards
    earnTips(finalScore);
    gainExperience(50);
    
    // Update mission progress
    if (puzzleMission) {
      updateMissionProgress(puzzleMission.missionId, 'puzzle_solved', 100);
      completeMission(puzzleMission.missionId, true);
    }
  };
  
  const resetPuzzle = () => {
    if (currentPuzzle) {
      setTimeRemaining(currentPuzzle.timeLimit);
      setPuzzleComplete(false);
      _setPlayerSolution(null);
      setScore(0);
    }
  };
  
  // Render different puzzle types
  const renderPuzzle = () => {
    if (!currentPuzzle) return null;
    
    switch (currentPuzzle.type) {
      case 'route_optimization':
        return <RouteOptimizationPuzzle puzzle={currentPuzzle} onSolve={handlePuzzleSuccess} />;
      case 'package_sorting':
        return <PackageSortingPuzzle puzzle={currentPuzzle} onSolve={handlePuzzleSuccess} />;
      default:
        return <div>Unknown puzzle type</div>;
    }
  };
  
  if (!puzzleMission) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No active puzzle mission. Start one from the missions page!</p>
            <Link href="/missions">
              <Button className="mt-4">
                Go to Missions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Data Analysis Challenge</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Use your analytical skills to solve WHIX logistics puzzles
        </p>
      </div>
      
      {/* Puzzle Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {currentPuzzle?.type.replace('_', ' ').toUpperCase()}
              </CardTitle>
              <CardDescription>{currentPuzzle?.description}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg",
                timeRemaining < 10 ? "bg-red-900/20 text-red-500" : "bg-gray-900/20"
              )}>
                <Clock className="w-4 h-4" />
                <span className="font-mono">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* Difficulty */}
              <Badge variant="outline">
                Difficulty {currentPuzzle?.difficulty}/5
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Puzzle Content */}
      <div className="mb-6">
        {puzzleComplete ? (
          <Card>
            <CardContent className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-6"
              >
                {score > 0 ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                ) : (
                  <RotateCcw className="w-16 h-16 text-red-500 mx-auto" />
                )}
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">
                {score > 0 ? 'Puzzle Solved!' : 'Time\'s Up!'}
              </h2>
              
              {score > 0 && (
                <div className="text-lg mb-4">
                  <p>Score: <span className="font-bold text-primary">{score}</span></p>
                  <p className="text-sm text-muted-foreground">
                    +{score} tips earned
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={resetPuzzle} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/missions">
                  <Button>
                    Back to Missions
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          renderPuzzle()
        )}
      </div>
      
      {/* Progress Bar */}
      {!puzzleComplete && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Mission Progress</span>
              <span className="text-sm font-medium">
                {puzzleMission.objectiveProgress.puzzle_solved || 0}%
              </span>
            </div>
            <Progress value={puzzleMission.objectiveProgress.puzzle_solved || 0} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Route Optimization Puzzle Component
function RouteOptimizationPuzzle({ puzzle, onSolve }: { puzzle: Puzzle; onSolve: () => void }) {
  const [selectedPath, setSelectedPath] = useState<Array<{x: number, y: number}>>([]);
  
  // Type guard to ensure we have route optimization data
  if (puzzle.type !== 'route_optimization') {
    return null;
  }
  
  const data = puzzle.data as { 
    gridSize: number; 
    startPosition: { x: number; y: number }; 
    deliveryPoints: Array<{ x: number; y: number; priority?: string }>; 
    obstacles: Array<{ x: number; y: number }> 
  };
  const { gridSize, startPosition, deliveryPoints } = data;
  
  // Simplified puzzle - just click deliveries in order
  const handleCellClick = (x: number, y: number) => {
    const delivery = deliveryPoints.find((d: {x: number; y: number; priority?: string}) => d.x === x && d.y === y);
    if (delivery && !selectedPath.find(p => p.x === x && p.y === y)) {
      setSelectedPath([...selectedPath, { x, y }]);
      
      // Check if all deliveries collected
      if (selectedPath.length + 1 === deliveryPoints.length) {
        onSolve();
      }
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isStart = x === startPosition.x && y === startPosition.y;
            const delivery = deliveryPoints.find((d: {x: number; y: number; priority?: string}) => d.x === x && d.y === y);
            const isSelected = selectedPath.find(p => p.x === x && p.y === y);
            
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(x, y)}
                className={cn(
                  "aspect-square border rounded-lg flex items-center justify-center cursor-pointer transition-colors",
                  isStart && "bg-blue-500 text-white",
                  delivery && !isSelected && (delivery.priority === 'urgent' ? "bg-red-900/50 border-red-500" : "bg-gray-900/50"),
                  isSelected && "bg-green-500 text-white",
                  !isStart && !delivery && "bg-gray-800 hover:bg-gray-700"
                )}
              >
                {isStart && <span className="text-xs font-bold">START</span>}
                {delivery && !isSelected && (
                  <span className="text-xs">{delivery.priority === 'urgent' ? '!' : '📦'}</span>
                )}
                {isSelected && <span className="text-xs">✓</span>}
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Click delivery points in order. Prioritize urgent deliveries (red)!
        </div>
      </CardContent>
    </Card>
  );
}

// Package Sorting Puzzle Component
function PackageSortingPuzzle({ puzzle, onSolve }: { puzzle: Puzzle; onSolve: () => void }) {
  const [_sortedPackages, _setSortedPackages] = useState<Array<{id: string; district: string; priority: string; weight: number}>>([]);
  
  // Simple implementation - just displays packages
  useEffect(() => {
    // Auto-solve after a delay for now
    const timer = setTimeout(() => {
      onSolve();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onSolve]);
  
  // Type guard to ensure we have package sorting data
  if (puzzle.type !== 'package_sorting') {
    return null;
  }
  
  const data = puzzle.data as {
    packages: Array<{id: string; district: string; priority: string; weight: number; fragile?: boolean}>;
    sortingCriteria?: string[];
  };
  const { packages } = data;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "p-3 rounded-lg border text-sm",
                pkg.priority === 'urgent' && "border-red-500 bg-red-900/20",
                pkg.fragile && "border-yellow-500"
              )}
            >
              <div className="font-mono text-xs mb-1">{pkg.id}</div>
              <div className="text-xs text-muted-foreground">
                {pkg.district} • {pkg.weight}kg
              </div>
              <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {pkg.priority}
                </Badge>
                {pkg.fragile && (
                  <Badge variant="outline" className="text-xs">
                    Fragile
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Sorting packages... (Auto-completing for demo)
        </div>
      </CardContent>
    </Card>
  );
}