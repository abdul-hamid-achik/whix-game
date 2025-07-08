'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialEncounterView } from '@/components/game/SocialEncounterView';
import { loadAllEncounters, loadEncounter } from '@/lib/game/encounter-loader';
import { Encounter } from '@/lib/schemas/encounter-schemas';

export default function EncounterTestPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    loadAllEncounters().then(data => {
      setEncounters(data);
      setLoading(false);
    });
  }, []);

  const handleSelectEncounter = async (encounterId: string) => {
    const encounter = await loadEncounter(encounterId);
    setSelectedEncounter(encounter);
    setTestMode(true);
  };

  const handleComplete = (outcome: 'victory' | 'defeat') => {
    console.log('Encounter completed:', outcome);
    setTestMode(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading encounters...</div>
      </div>
    );
  }

  if (testMode && selectedEncounter) {
    return (
      <div className="h-screen bg-background">
        <div className="p-4">
          <Button 
            onClick={() => setTestMode(false)}
            variant="outline"
            className="mb-4"
          >
            ← Back to List
          </Button>
        </div>
        <div className="h-[calc(100vh-100px)]">
          <SocialEncounterView
            encounter={selectedEncounter}
            onComplete={handleComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Encounter Test Suite</h1>
        
        {encounters.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No encounters found. Create some markdown files in content/encounters/</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {encounters.map((encounter) => (
              <Card 
                key={encounter.id}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleSelectEncounter(encounter.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{encounter.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{encounter.description}</p>
                    <div className="flex justify-between">
                      <span>Opponent: {encounter.opponent}</span>
                      <span>Difficulty: {encounter.difficulty}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>States: {Object.keys(encounter.states).length}</span>
                      <span>Setting: {encounter.setting}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Quick Test Links:</h2>
          <div className="space-y-1 text-sm">
            <p>• <strong>Grid Navigation:</strong></p>
            <p className="ml-4">• Cathedral District: <code>/combat?grid=true&district=cathedral</code></p>
            <p className="ml-4">• Industrial District: <code>/combat?grid=true&district=industrial</code></p>
            <p className="ml-4">• Nuevo Polanco: <code>/combat?grid=true&district=polanco</code></p>
            <p className="ml-4">• Labyrinthine: <code>/combat?grid=true&district=labyrinth</code></p>
            <p>• <strong>Direct Encounters:</strong></p>
            <p className="ml-4">• Regular Combat: <code>/combat?encounter=angry-customer-cold-food</code></p>
            <p className="ml-4">• Story Combat: <code>/combat?story=true&nodeId=node1&encounter=karen-manager-demand</code></p>
            <p className="ml-4">• Random Enemy: <code>/combat?enemy=angry_customer</code></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}