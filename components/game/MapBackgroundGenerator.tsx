'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Map, Image as ImageIcon, Loader2, Download, 
  Cloud, Sun, CloudRain, Zap 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapTheme, 
  MapTimeOfDay, 
  MapWeather, 
  BackgroundType 
} from '@/lib/services/mapGenerationService';

const WEATHER_ICONS = {
  clear: Sun,
  rain: CloudRain,
  storm: Zap,
  fog: Cloud,
  smog: Cloud,
  heat_wave: Sun,
  dust_storm: Cloud
};

export function MapBackgroundGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Map generation state
  const [mapTheme, setMapTheme] = useState<MapTheme>('polanco_streets');
  const [mapTime, setMapTime] = useState<MapTimeOfDay>('night');
  const [mapWeather, setMapWeather] = useState<MapWeather>('clear');
  const [mapSize, setMapSize] = useState({ width: 20, height: 20 });
  
  // Background generation state
  const [bgType, setBgType] = useState<BackgroundType>('combat_street');
  const [bgTheme, setBgTheme] = useState<MapTheme>('polanco_streets');
  const [bgTime, setBgTime] = useState<MapTimeOfDay>('night');
  const [bgWeather, setBgWeather] = useState<MapWeather>('smog');
  
  const generateMap = async () => {
    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      const response = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'map',
          params: {
            theme: mapTheme,
            timeOfDay: mapTime,
            weather: mapWeather,
            gridSize: mapSize,
            style: 'pixel_art'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate map');
      }
      
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateBackground = async () => {
    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      const response = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'background',
          params: {
            type: bgType,
            theme: bgTheme,
            timeOfDay: bgTime,
            weather: bgWeather
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate background');
      }
      
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const WeatherIcon = mapWeather ? WEATHER_ICONS[mapWeather] : Sun;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Map className="w-8 h-8 text-blue-500" />
          Map & Background Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate AI-powered maps and backgrounds for the WHIX dystopia
        </p>
      </div>
      
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Chapter Maps</TabsTrigger>
          <TabsTrigger value="background">Backgrounds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Chapter Map</CardTitle>
              <CardDescription>
                Create top-down isometric maps for story chapters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={mapTheme} onValueChange={(v) => setMapTheme(v as MapTheme)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polanco_streets">Polanco Streets</SelectItem>
                      <SelectItem value="corporate_district">Corporate District</SelectItem>
                      <SelectItem value="residential_area">Residential Area</SelectItem>
                      <SelectItem value="underground_tunnels">Underground Tunnels</SelectItem>
                      <SelectItem value="rooftop_network">Rooftop Network</SelectItem>
                      <SelectItem value="market_district">Market District</SelectItem>
                      <SelectItem value="industrial_zone">Industrial Zone</SelectItem>
                      <SelectItem value="whix_headquarters">WHIX Headquarters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Time of Day</Label>
                  <Select value={mapTime} onValueChange={(v) => setMapTime(v as MapTimeOfDay)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dawn">Dawn</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="noon">Noon</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="dusk">Dusk</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="midnight">Midnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Weather</Label>
                  <Select value={mapWeather} onValueChange={(v) => setMapWeather(v as MapWeather)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="rain">Rain</SelectItem>
                      <SelectItem value="storm">Storm</SelectItem>
                      <SelectItem value="fog">Fog</SelectItem>
                      <SelectItem value="smog">Smog</SelectItem>
                      <SelectItem value="heat_wave">Heat Wave</SelectItem>
                      <SelectItem value="dust_storm">Dust Storm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Grid Size</Label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={mapSize.width}
                      onChange={(e) => setMapSize({ ...mapSize, width: parseInt(e.target.value) })}
                      className="w-20 px-2 py-1 rounded border"
                      min="10"
                      max="30"
                    />
                    <span className="self-center">×</span>
                    <input
                      type="number"
                      value={mapSize.height}
                      onChange={(e) => setMapSize({ ...mapSize, height: parseInt(e.target.value) })}
                      className="w-20 px-2 py-1 rounded border"
                      min="10"
                      max="30"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <WeatherIcon className="w-5 h-5" />
                <span className="text-sm">
                  {mapTheme.replace(/_/g, ' ')} • {mapTime} • {mapWeather}
                </span>
              </div>
              
              <Button
                onClick={generateMap}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Map...
                  </>
                ) : (
                  <>
                    <Map className="mr-2 h-4 w-4" />
                    Generate Map
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="background" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Background</CardTitle>
              <CardDescription>
                Create backgrounds for combat and story scenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Type</Label>
                  <Select value={bgType} onValueChange={(v) => setBgType(v as BackgroundType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combat_street">Combat - Street</SelectItem>
                      <SelectItem value="combat_restaurant">Combat - Restaurant</SelectItem>
                      <SelectItem value="combat_office">Combat - Office</SelectItem>
                      <SelectItem value="combat_residential">Combat - Residential</SelectItem>
                      <SelectItem value="story_scene">Story Scene</SelectItem>
                      <SelectItem value="shop_interior">Shop Interior</SelectItem>
                      <SelectItem value="rest_area">Rest Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={bgTheme} onValueChange={(v) => setBgTheme(v as MapTheme)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polanco_streets">Polanco Streets</SelectItem>
                      <SelectItem value="corporate_district">Corporate District</SelectItem>
                      <SelectItem value="residential_area">Residential Area</SelectItem>
                      <SelectItem value="market_district">Market District</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Select value={bgTime} onValueChange={(v) => setBgTime(v as MapTimeOfDay)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dawn">Dawn</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="dusk">Dusk</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Weather</Label>
                  <Select value={bgWeather} onValueChange={(v) => setBgWeather(v as MapWeather)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="rain">Rain</SelectItem>
                      <SelectItem value="smog">Smog</SelectItem>
                      <SelectItem value="fog">Fog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={generateBackground}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Background...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Background
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Error Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Generated Image Display */}
      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Image
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(generatedImage, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={generatedImage}
                alt="Generated map or background"
                width={800}
                height={600}
                className="w-full rounded-lg"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}