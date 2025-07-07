'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Sparkles, Image as ImageIcon, Loader2, Download, 
  Package, Zap, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCharacterImageStore } from '@/lib/stores/characterImageStore';
import { CharacterRarity } from '@/lib/game/gacha';
import { cn } from '@/lib/utils';

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/10',
  rare: 'border-blue-500 bg-blue-500/10',
  epic: 'border-purple-500 bg-purple-500/10',
  legendary: 'border-yellow-500 bg-yellow-500/10',
  mythic: 'border-pink-500 bg-pink-500/10'
};

export function CharacterImageGenerator() {
  const {
    _imagePools,
    isGenerating,
    setGenerating,
    addToPool,
    addBatchToPool,
    getPoolStats,
    generationHistory
  } = useCharacterImageStore();
  
  const [selectedRarity, setSelectedRarity] = useState<CharacterRarity>('common');
  const [batchSize, setBatchSize] = useState(5);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const poolStats = getPoolStats();
  
  // Generate single character image
  const generateSingle = async () => {
    setError(null);
    setGenerating(true);
    setGenerationProgress(0);
    
    try {
      const response = await fetch('/api/generate-character-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: `gen_${Date.now()}`,
          name: `Courier_${Math.random().toString(36).substring(7)}`,
          rarity: selectedRarity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      if (data.success && data.image) {
        addToPool(data.image);
        setGenerationProgress(100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };
  
  // Generate batch of images
  const generateBatch = async () => {
    setError(null);
    setGenerating(true);
    setGenerationProgress(0);
    
    try {
      const response = await fetch('/api/generate-character-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: batchSize,
          rarityWeights: {
            common: 50,
            rare: 30,
            epic: 15,
            legendary: 4,
            mythic: 1
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate batch');
      }
      
      const data = await response.json();
      if (data.success && data.images) {
        addBatchToPool(data.images);
        setGenerationProgress(100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch generation failed');
    } finally {
      setGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          Character Image Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate unique pixel art couriers for the WHIX delivery dystopia
        </p>
      </div>
      
      {/* Pool Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Image Pool Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(poolStats).map(([rarity, count]) => (
              <div
                key={rarity}
                className={cn(
                  "text-center p-3 rounded-lg border-2",
                  RARITY_COLORS[rarity as CharacterRarity]
                )}
              >
                <p className="text-sm font-medium capitalize">{rarity}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Generator Tabs */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Generation</TabsTrigger>
          <TabsTrigger value="batch">Batch Generation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Single Character</CardTitle>
              <CardDescription>
                Create one character image with specific rarity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Rarity
                </label>
                <Select value={selectedRarity} onValueChange={(v) => setSelectedRarity(v as CharacterRarity)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['common', 'rare', 'epic', 'legendary', 'mythic'] as CharacterRarity[]).map(rarity => (
                      <SelectItem key={rarity} value={rarity}>
                        <span className="capitalize">{rarity}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={generateSingle}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Character
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Generation</CardTitle>
              <CardDescription>
                Generate multiple characters with weighted rarities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Batch Size: {batchSize}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Rarity Distribution:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Common: 50%</li>
                  <li>• Rare: 30%</li>
                  <li>• Epic: 15%</li>
                  <li>• Legendary: 4%</li>
                  <li>• Mythic: 1%</li>
                </ul>
              </div>
              
              <Button
                onClick={generateBatch}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Batch...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate {batchSize} Characters
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Progress Bar */}
      {generationProgress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Progress value={generationProgress} className="h-2" />
            <p className="text-sm text-center mt-2">
              {generationProgress === 100 ? 'Complete!' : 'Generating...'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Error Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Generations */}
      {generationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {generationHistory.slice(-10).map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative group cursor-pointer rounded-lg overflow-hidden border-2",
                    RARITY_COLORS[image.attributes.rarity as CharacterRarity]
                  )}
                >
                  <Image
                    src={image.thumbnailUrl || image.url}
                    alt={image.attributes.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge 
                    className="absolute bottom-1 right-1 text-xs" 
                    variant="secondary"
                  >
                    {image.attributes.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}