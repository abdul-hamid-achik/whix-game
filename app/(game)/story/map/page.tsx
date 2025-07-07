'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Map as MapIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChapterMapView } from '@/components/game/ChapterMapView';
import { useChapterMapStore } from '@/lib/stores/chapterMapStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { NodeType } from '@/lib/game/chapterMap';

export default function StoryMapPage() {
  const router = useRouter();
  const { 
    currentChapter, 
    currentMap, 
    unlockedChapters,
    initializeChapter,
    loadChapter,
    moveToNode,
    completeNode,
    getProgress
  } = useChapterMapStore();
  
  const { earnTips, gainExperience } = useGameStore();
  const { setState } = useUIStore();
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);

  useEffect(() => {
    // Set UI state to adventure map
    setState(GameState.ADVENTURE_MAP);
    
    // Force initialize chapter 1 and debug
    console.log('🗺️ Map Page: currentMap:', currentMap);
    console.log('🗺️ Map Page: currentChapter:', currentChapter);
    
    if (!currentMap) {
      console.log('🗺️ Initializing chapter 1...');
      initializeChapter(1);
    } else {
      console.log('🗺️ Map exists, nodes count:', currentMap.nodes instanceof Map ? currentMap.nodes.size : Object.keys(currentMap.nodes || {}).length);
    }
  }, [currentMap, initializeChapter, currentChapter, setState]);

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    loadChapter(chapter);
  };

  const handleNodeClick = (nodeId: string) => {
    if (!currentMap) return;
    
    const node = currentMap.nodes.get(nodeId);
    if (!node) return;

    // Move to the node
    moveToNode(nodeId);

    // Handle different node types
    switch (node.type) {
      case NodeType.DELIVERY:
        // Start delivery mission
        router.push('/missions');
        break;
        
      case NodeType.COMBAT:
        // Start combat encounter
        router.push(`/combat?story=true&nodeId=${nodeId}`);
        break;
        
      case NodeType.PUZZLE:
        // Start puzzle mission
        router.push('/missions/puzzle');
        break;
        
      case NodeType.SOCIAL:
        // Start social encounter
        router.push(`/missions/social?story=true&nodeId=${nodeId}`);
        break;
        
      case NodeType.SHOP:
        // Go to shop
        router.push('/shop');
        break;
        
      case NodeType.REST:
        // Rest area - heal and recover
        handleRest(nodeId);
        break;
        
      case NodeType.STORY:
        // Story node - show dialog/cutscene
        handleStoryNode(nodeId);
        break;
        
      case NodeType.BOSS:
        // Boss battle
        router.push(`/combat?story=true&nodeId=${nodeId}&boss=true`);
        break;
        
      case NodeType.END:
        // Chapter complete
        handleChapterComplete();
        break;
    }
  };

  const handleRest = (nodeId: string) => {
    // Give small rewards for resting
    earnTips(50);
    gainExperience(10);
    completeNode(nodeId);
    
    // Show rest dialog
    alert('Your team rests and recovers. +50 tips, +10 XP');
  };

  const handleStoryNode = (nodeId: string) => {
    // Show story content
    completeNode(nodeId);
    gainExperience(50);
    
    // In a real implementation, this would show a dialog/cutscene
    alert('You discover important information about Tanya\'s whereabouts! +50 XP');
  };

  const handleChapterComplete = () => {
    // Give chapter completion rewards
    const chapterRewards = {
      tips: 1000 * currentChapter,
      experience: 200 * currentChapter
    };
    
    earnTips(chapterRewards.tips);
    gainExperience(chapterRewards.experience);
    
    // Show completion dialog
    alert(`Chapter ${currentChapter} Complete! +${chapterRewards.tips} tips, +${chapterRewards.experience} XP`);
    
    // Load next chapter if available
    const nextChapter = currentChapter + 1;
    if (unlockedChapters.includes(nextChapter)) {
      loadChapter(nextChapter);
    }
  };

  const totalProgress = getProgress();

  return (
    <div className="container mx-auto p-6 max-w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <MapIcon className="w-8 h-8" />
              Story Map
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Navigate through Polanco to find Tanya and uncover the truth
            </p>
          </div>
          
          <div className="text-right space-y-2">
            <p className="text-sm text-gray-500">Overall Progress</p>
            <p className="text-2xl font-bold text-primary">{totalProgress}%</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('🔄 Force regenerating map...');
                initializeChapter(currentChapter);
              }}
            >
              🔄 Regenerate Map
            </Button>
          </div>
        </div>
        
        {/* Chapter selector */}
        <Tabs value={selectedChapter.toString()} onValueChange={(v) => handleChapterSelect(parseInt(v))}>
          <TabsList className="grid grid-cols-8 w-full">
            {Array.from({ length: 8 }).map((_, i) => {
              const chapter = i + 1;
              const isUnlocked = unlockedChapters.includes(chapter);
              
              return (
                <TabsTrigger 
                  key={chapter}
                  value={chapter.toString()}
                  disabled={!isUnlocked}
                  className={!isUnlocked ? 'opacity-50' : ''}
                >
                  Ch.{chapter}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Map view */}
      {currentMap && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map container */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] overflow-hidden crt-effect scanlines">
              <ChapterMapView
                map={currentMap}
                onNodeClick={handleNodeClick}
                onNodeComplete={completeNode}
              />
            </Card>
          </div>
          
          {/* Chapter info sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentMap.title}</CardTitle>
                <CardDescription>{currentMap.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="font-medium capitalize">{currentMap.theme}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weather</p>
                  <p className="font-medium capitalize">{currentMap.weatherEffect || 'Clear'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time of Day</p>
                  <p className="font-medium capitalize">{currentMap.timeOfDay}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Legend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600" />
                    <span>Delivery Mission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-600" />
                    <span>Combat Encounter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-600" />
                    <span>Puzzle Challenge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-600" />
                    <span>Social Interaction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-600" />
                    <span>Rest Area</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-600" />
                    <span>Shop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-600" />
                    <span>Story Event</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-800" />
                    <span>Boss Battle</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/story')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/missions')}
              >
                Missions
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg"
      >
        <p className="text-sm text-blue-400">
          <strong>How to Play:</strong> Click on available nodes (glowing) to move through the map. 
          Complete encounters to unlock new paths. Your goal is to reach the end of each chapter, 
          getting closer to finding Tanya and uncovering the truth about WHIX.
        </p>
      </motion.div>
    </div>
  );
}