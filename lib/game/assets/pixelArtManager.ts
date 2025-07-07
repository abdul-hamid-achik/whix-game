/**
 * Pixel Art Asset Management System for WHIX Game
 * 
 * This system manages all pixel art assets including:
 * - Character sprites (partners, NPCs, enemies)
 * - Environment tiles and backgrounds
 * - UI elements and icons
 * - Combat animations and effects
 */

import { Assets, Sprite, Texture, Rectangle } from 'pixi.js';

// Extended sprite type that includes animation properties
export interface AnimatedSprite extends Sprite {
  animationFrames: Texture[];
  currentFrame: number;
  animationSpeed: number;
}

export interface SpriteSheet {
  name: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, AnimationData>;
}

export interface AnimationData {
  frames: number[];
  frameRate: number;
  loop: boolean;
}

export interface CharacterSprite {
  id: string;
  name: string;
  spriteSheet: string;
  defaultAnimation: string;
  animations: {
    idle: string;
    walk: string;
    run: string;
    attack: string;
    hurt: string;
    special?: string;
  };
  scale: number;
}

// Sprite sheet definitions for all game assets
export const SPRITE_SHEETS: Record<string, SpriteSheet> = {
  // Partner character sprites
  partners: {
    name: 'partners',
    path: '/assets/sprites/partners.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      courier_idle: { frames: [0, 1, 2, 3], frameRate: 4, loop: true },
      courier_walk: { frames: [4, 5, 6, 7], frameRate: 8, loop: true },
      courier_run: { frames: [8, 9, 10, 11], frameRate: 12, loop: true },
      analyst_idle: { frames: [12, 13, 14, 15], frameRate: 4, loop: true },
      analyst_walk: { frames: [16, 17, 18, 19], frameRate: 8, loop: true },
      negotiator_idle: { frames: [24, 25, 26, 27], frameRate: 4, loop: true },
      specialist_idle: { frames: [36, 37, 38, 39], frameRate: 4, loop: true },
      investigator_idle: { frames: [48, 49, 50, 51], frameRate: 4, loop: true },
    }
  },
  
  // Environment tiles
  environment: {
    name: 'environment',
    path: '/assets/sprites/environment.png',
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      // Cyberpunk city tiles
      street: { frames: [0], frameRate: 0, loop: false },
      sidewalk: { frames: [1], frameRate: 0, loop: false },
      building_wall: { frames: [2], frameRate: 0, loop: false },
      neon_sign: { frames: [3, 4, 5], frameRate: 2, loop: true },
      rain_puddle: { frames: [6, 7], frameRate: 1, loop: true },
    }
  },
  
  // UI elements
  ui: {
    name: 'ui',
    path: '/assets/sprites/ui.png',
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      health_full: { frames: [0], frameRate: 0, loop: false },
      health_empty: { frames: [1], frameRate: 0, loop: false },
      energy_full: { frames: [2], frameRate: 0, loop: false },
      energy_empty: { frames: [3], frameRate: 0, loop: false },
      currency_tip: { frames: [4, 5], frameRate: 2, loop: true },
      star_fragment: { frames: [6, 7, 8], frameRate: 3, loop: true },
    }
  },
  
  // Combat effects
  effects: {
    name: 'effects',
    path: '/assets/sprites/effects.png',
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      hit_normal: { frames: [0, 1, 2], frameRate: 12, loop: false },
      hit_critical: { frames: [3, 4, 5, 6], frameRate: 15, loop: false },
      heal: { frames: [7, 8, 9, 10], frameRate: 10, loop: false },
      shield: { frames: [11, 12, 13], frameRate: 8, loop: true },
      boost: { frames: [14, 15, 16, 17], frameRate: 10, loop: false },
    }
  }
};

// Character definitions mapping to sprite sheets
export const CHARACTER_SPRITES: Record<string, CharacterSprite> = {
  // Courier class partners
  courier_basic: {
    id: 'courier_basic',
    name: 'Basic Courier',
    spriteSheet: 'partners',
    defaultAnimation: 'courier_idle',
    animations: {
      idle: 'courier_idle',
      walk: 'courier_walk',
      run: 'courier_run',
      attack: 'courier_attack',
      hurt: 'courier_hurt',
    },
    scale: 2
  },
  
  // Add more character definitions...
};

export class PixelArtManager {
  private static instance: PixelArtManager;
  private loadedTextures: Map<string, Texture> = new Map();
  private spriteSheets: Map<string, Texture> = new Map();
  
  private constructor() {}
  
  static getInstance(): PixelArtManager {
    if (!PixelArtManager.instance) {
      PixelArtManager.instance = new PixelArtManager();
    }
    return PixelArtManager.instance;
  }
  
  /**
   * Load all sprite sheets defined in SPRITE_SHEETS
   */
  async loadAllAssets(): Promise<void> {
    const loadPromises = Object.entries(SPRITE_SHEETS).map(async ([key, sheet]) => {
      try {
        const texture = await Assets.load(sheet.path);
        this.spriteSheets.set(key, texture);
        
        // Pre-generate textures for all animations
        this.generateAnimationTextures(key, sheet, texture);
      } catch (error) {
        console.error(`Failed to load sprite sheet ${key}:`, error);
      }
    });
    
    await Promise.all(loadPromises);
  }
  
  /**
   * Generate individual frame textures from sprite sheet
   */
  private generateAnimationTextures(
    sheetKey: string, 
    sheet: SpriteSheet, 
    baseTexture: Texture
  ): void {
    Object.entries(sheet.animations).forEach(([animName, animData]) => {
      animData.frames.forEach((frameIndex, i) => {
        const x = (frameIndex % (baseTexture.width / sheet.frameWidth)) * sheet.frameWidth;
        const y = Math.floor(frameIndex / (baseTexture.width / sheet.frameWidth)) * sheet.frameHeight;
        
        const frameTexture = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(x, y, sheet.frameWidth, sheet.frameHeight)
        });
        
        const textureKey = `${sheetKey}_${animName}_${i}`;
        this.loadedTextures.set(textureKey, frameTexture);
      });
    });
  }
  
  /**
   * Get a specific animation frame texture
   */
  getAnimationFrame(sheetKey: string, animationName: string, frameIndex: number): Texture | null {
    const textureKey = `${sheetKey}_${animationName}_${frameIndex}`;
    return this.loadedTextures.get(textureKey) || null;
  }
  
  /**
   * Get all frames for an animation
   */
  getAnimationFrames(sheetKey: string, animationName: string): Texture[] {
    const sheet = SPRITE_SHEETS[sheetKey];
    if (!sheet || !sheet.animations[animationName]) return [];
    
    const animation = sheet.animations[animationName];
    return animation.frames.map((_, i) => 
      this.getAnimationFrame(sheetKey, animationName, i)
    ).filter((tex): tex is Texture => tex !== null);
  }
  
  /**
   * Create a sprite with a specific animation
   */
  createAnimatedSprite(characterId: string, animationName?: string): Sprite | null {
    const character = CHARACTER_SPRITES[characterId];
    if (!character) return null;
    
    const animation = animationName || character.defaultAnimation;
    const frames = this.getAnimationFrames(character.spriteSheet, animation);
    
    if (frames.length === 0) return null;
    
    const sprite = new Sprite(frames[0]) as AnimatedSprite;
    sprite.scale.set(character.scale);
    
    // Store animation data on sprite for animation system
    sprite.animationFrames = frames;
    sprite.currentFrame = 0;
    sprite.animationSpeed = SPRITE_SHEETS[character.spriteSheet].animations[animation].frameRate;
    
    return sprite;
  }
  
  /**
   * Get color palette for maintaining consistent pixel art style
   */
  static getGamePalette() {
    return {
      // Cyberpunk color palette
      primary: {
        cyan: '#00FFFF',
        purple: '#9D4EDD',
        pink: '#FF006E',
        yellow: '#FFBE0B',
      },
      neutral: {
        black: '#0A0A0A',
        darkGray: '#1A1A1A',
        gray: '#404040',
        lightGray: '#808080',
        white: '#F0F0F0',
      },
      accent: {
        neonGreen: '#39FF14',
        electricBlue: '#0077FF',
        hotPink: '#FF1493',
        warning: '#FF4444',
      },
      environment: {
        asphalt: '#2C2C2C',
        concrete: '#4A4A4A',
        glass: '#1A3A4A',
        neon: '#FF00FF',
      }
    };
  }
  
  /**
   * Apply pixel-perfect scaling
   */
  static getPixelScale(baseSize: number = 1): number {
    // Ensure pixel art stays crisp at different resolutions
    const dpr = window.devicePixelRatio || 1;
    return Math.floor(baseSize * dpr) / dpr;
  }
}