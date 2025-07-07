import { z } from 'zod';

// Map generation schemas
export const MapThemeSchema = z.enum([
  'polanco_streets',
  'corporate_district',
  'residential_area',
  'underground_tunnels',
  'rooftop_network',
  'market_district',
  'industrial_zone',
  'whix_headquarters'
]);

export const MapTimeOfDaySchema = z.enum([
  'dawn',
  'morning',
  'noon',
  'afternoon',
  'dusk',
  'night',
  'midnight'
]);

export const MapWeatherSchema = z.enum([
  'clear',
  'rain',
  'storm',
  'fog',
  'smog',
  'heat_wave',
  'dust_storm'
]);

export const BackgroundTypeSchema = z.enum([
  'combat_street',
  'combat_restaurant',
  'combat_office',
  'combat_residential',
  'map_overview',
  'story_scene',
  'shop_interior',
  'rest_area'
]);

export type MapTheme = z.infer<typeof MapThemeSchema>;
export type MapTimeOfDay = z.infer<typeof MapTimeOfDaySchema>;
export type MapWeather = z.infer<typeof MapWeatherSchema>;
export type BackgroundType = z.infer<typeof BackgroundTypeSchema>;

interface MapGenerationParams {
  theme: MapTheme;
  timeOfDay: MapTimeOfDay;
  weather: MapWeather;
  gridSize: { width: number; height: number };
  style: 'pixel_art' | 'illustrated';
}

interface BackgroundGenerationParams {
  type: BackgroundType;
  theme: MapTheme;
  timeOfDay: MapTimeOfDay;
  weather: MapWeather;
  details?: string[];
}

export class MapGenerationService {
  private openaiApiKey: string;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openaiApiKey = apiKey;
  }
  
  // Generate a chapter map overview
  async generateMapImage(params: MapGenerationParams): Promise<string> {
    const prompt = this.createMapPrompt(params);
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating map:', error);
      throw error;
    }
  }
  
  // Generate a background for combat or scenes
  async generateBackgroundImage(params: BackgroundGenerationParams): Promise<string> {
    const prompt = this.createBackgroundPrompt(params);
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1792x1024', // Wide format for backgrounds
          quality: 'standard',
          style: 'natural'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating background:', error);
      throw error;
    }
  }
  
  private createMapPrompt(params: MapGenerationParams): string {
    const themeDescriptions: Record<MapTheme, string> = {
      polanco_streets: 'upscale Mexico City streets with modern buildings and delivery routes',
      corporate_district: 'towering glass skyscrapers with WHIX corporate logos',
      residential_area: 'mixed income housing blocks with security gates',
      underground_tunnels: 'secret delivery tunnels beneath the city',
      rooftop_network: 'connected rooftops for courier shortcuts',
      market_district: 'bustling street markets and food vendors',
      industrial_zone: 'warehouses and distribution centers',
      whix_headquarters: 'dystopian corporate campus with surveillance'
    };
    
    const weatherEffects: Record<MapWeather, string> = {
      clear: 'clear skies',
      rain: 'heavy rain with puddles',
      storm: 'thunderstorm with lightning',
      fog: 'thick fog limiting visibility',
      smog: 'heavy pollution haze',
      heat_wave: 'shimmering heat waves',
      dust_storm: 'swirling dust clouds'
    };
    
    const timeEffects: Record<MapTimeOfDay, string> = {
      dawn: 'early morning golden light',
      morning: 'bright morning sun',
      noon: 'harsh midday shadows',
      afternoon: 'warm afternoon glow',
      dusk: 'orange sunset colors',
      night: 'neon lights and darkness',
      midnight: 'deep night with minimal lighting'
    };
    
    const styleDesc = params.style === 'pixel_art' 
      ? 'pixel art style, 16-bit aesthetic, dithering effect'
      : 'illustrated map style, hand-drawn aesthetic';
    
    return [
      `Top-down isometric map view of ${themeDescriptions[params.theme]}`,
      'Aztec-Soviet architectural fusion',
      'Cyberpunk dystopian atmosphere',
      `${params.gridSize.width}x${params.gridSize.height} grid overlay visible`,
      'Delivery route paths marked',
      weatherEffects[params.weather],
      timeEffects[params.timeOfDay],
      styleDesc,
      'Mexico City Polanco district',
      'Gig economy dystopia theme',
      'High detail, game map aesthetic'
    ].join(', ');
  }
  
  private createBackgroundPrompt(params: BackgroundGenerationParams): string {
    const typeDescriptions: Record<BackgroundType, string> = {
      combat_street: 'street level view for delivery conflict, parked cars and storefronts',
      combat_restaurant: 'restaurant entrance with angry customers',
      combat_office: 'corporate office lobby with security',
      combat_residential: 'apartment building entrance with doorman',
      map_overview: 'aerial view of city district',
      story_scene: 'cinematic scene location',
      shop_interior: 'equipment shop interior with delivery gear',
      rest_area: 'courier rest stop with benches'
    };
    
    const baseDesc = typeDescriptions[params.type];
    
    const details = params.details?.join(', ') || '';
    
    return [
      baseDesc,
      'Aztec-Soviet aesthetic fusion',
      'Cyberpunk dystopian atmosphere',
      'Mexico City Polanco setting',
      `${params.timeOfDay} lighting`,
      `${params.weather} weather conditions`,
      'Pixel art style',
      '16-bit game aesthetic',
      'Side-scrolling game background',
      'High detail environmental art',
      details,
      'Moody atmospheric lighting',
      'Delivery courier themed'
    ].filter(Boolean).join(', ');
  }
  
  // Generate a set of backgrounds for a chapter
  async generateChapterBackgrounds(
    chapter: number,
    theme: MapTheme
  ): Promise<Record<BackgroundType, string>> {
    const backgrounds: Partial<Record<BackgroundType, string>> = {};
    
    // Define which backgrounds are needed per chapter
    const requiredBackgrounds: BackgroundType[] = [
      'combat_street',
      'map_overview',
      'story_scene'
    ];
    
    if (chapter > 1) {
      requiredBackgrounds.push('combat_office', 'combat_residential');
    }
    
    for (const bgType of requiredBackgrounds) {
      try {
        const url = await this.generateBackgroundImage({
          type: bgType,
          theme,
          timeOfDay: 'night', // Default for dystopian feel
          weather: 'smog',
          details: [`Chapter ${chapter} themed`]
        });
        
        backgrounds[bgType] = url;
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to generate ${bgType}:`, error);
      }
    }
    
    return backgrounds as Record<BackgroundType, string>;
  }
}

// Singleton instance
let mapService: MapGenerationService | null = null;

export function getMapGenerationService(): MapGenerationService {
  if (!mapService) {
    mapService = new MapGenerationService();
  }
  return mapService;
}