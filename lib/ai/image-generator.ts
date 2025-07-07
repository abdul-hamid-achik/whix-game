import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ImageStyle = 
  | 'pixel-art'
  | 'fantasy-portrait'
  | 'medieval-background'
  | 'kingdom-rush-style'
  | 'roguelike-dungeon';

export type ImageSize = '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';

export interface ImageGenerationRequest {
  prompt: string;
  style?: ImageStyle;
  size?: ImageSize;
  count?: number;
  quality?: 'standard' | 'hd';
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  size: string;
  createdAt: Date;
}

// Style-specific prompt templates
const stylePrompts = {
  'pixel-art': 'pixel art style, 16-bit, retro gaming aesthetic, clean pixels, vibrant colors',
  'fantasy-portrait': 'fantasy character portrait, medieval RPG style, detailed artwork, Kingdom Rush inspired',
  'medieval-background': 'medieval fantasy landscape, Kingdom Rush style, vibrant colors, fantasy architecture',
  'kingdom-rush-style': 'Kingdom Rush art style, colorful fantasy, medieval theme, tower defense game aesthetic',
  'roguelike-dungeon': 'roguelike dungeon room, top-down view, pixel art, fantasy RPG style'
};

export class ImageGenerator {
  private static instance: ImageGenerator;
  
  public static getInstance(): ImageGenerator {
    if (!ImageGenerator.instance) {
      ImageGenerator.instance = new ImageGenerator();
    }
    return ImageGenerator.instance;
  }

  private constructor() {}

  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const {
      prompt,
      style = 'pixel-art',
      size = '512x512',
      count = 1,
      quality = 'standard'
    } = request;

    // Enhance prompt with style-specific details
    const stylePrompt = stylePrompts[style];
    const enhancedPrompt = `${prompt}, ${stylePrompt}`;

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        size: size,
        quality: quality,
        n: count,
        response_format: 'url',
      });

      const image = response.data[0];
      
      if (!image?.url) {
        throw new Error('No image URL received from OpenAI');
      }

      return {
        url: image.url,
        prompt: enhancedPrompt,
        style,
        size,
        createdAt: new Date(),
      };

    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateCharacterPortrait(
    characterName: string,
    partnerClass: string,
    traits: string[],
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const traitDescriptions = traits.join(', ');
    const prompt = `Portrait of ${characterName}, a ${partnerClass} character with traits: ${traitDescriptions}. Medieval fantasy RPG character, positive neurodivergent representation, diverse appearance, detailed face and clothing`;

    return this.generateImage({
      prompt,
      style: 'fantasy-portrait',
      size: '512x512',
      ...options,
    });
  }

  async generateLevelBackground(
    levelName: string,
    environment: string,
    difficulty: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const prompt = `${levelName} level background, ${environment} environment, ${difficulty} difficulty, medieval fantasy setting, Kingdom Rush inspired artwork`;

    return this.generateImage({
      prompt,
      style: 'medieval-background',
      size: '1024x768',
      ...options,
    });
  }

  async generateItemIcon(
    itemName: string,
    itemType: string,
    rarity: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const prompt = `${itemName} icon, ${itemType} item, ${rarity} rarity, fantasy RPG item icon, detailed design, medieval fantasy style`;

    return this.generateImage({
      prompt,
      style: 'pixel-art',
      size: '256x256',
      ...options,
    });
  }

  async generateBattlefieldTile(
    tileType: string,
    environment: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const prompt = `${tileType} battlefield tile, ${environment} environment, top-down view, tactical RPG grid, Kingdom Rush style`;

    return this.generateImage({
      prompt,
      style: 'kingdom-rush-style',
      size: '256x256',
      ...options,
    });
  }

  async generateUIElement(
    elementType: string,
    theme: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const prompt = `${elementType} UI element, ${theme} theme, medieval fantasy interface, Kingdom Rush inspired UI design`;

    return this.generateImage({
      prompt,
      style: 'kingdom-rush-style',
      size: '512x512',
      ...options,
    });
  }

  // Batch generation for multiple related images
  async generateBatch(requests: ImageGenerationRequest[]): Promise<GeneratedImage[]> {
    const promises = requests.map(request => this.generateImage(request));
    return Promise.all(promises);
  }

  // Generate a complete character asset pack
  async generateCharacterAssetPack(
    characterName: string,
    partnerClass: string,
    traits: string[]
  ): Promise<{
    portrait: GeneratedImage;
    sprite: GeneratedImage;
    icon: GeneratedImage;
  }> {
    const basePrompt = `${characterName}, ${partnerClass} character with traits: ${traits.join(', ')}`;
    
    const [portrait, sprite, icon] = await Promise.all([
      this.generateCharacterPortrait(characterName, partnerClass, traits),
      this.generateImage({
        prompt: `${basePrompt}, full body sprite, medieval fantasy character`,
        style: 'pixel-art',
        size: '256x256',
      }),
      this.generateImage({
        prompt: `${basePrompt}, character icon, portrait style`,
        style: 'pixel-art',
        size: '128x128',
      }),
    ]);

    return { portrait, sprite, icon };
  }
}

export const imageGenerator = ImageGenerator.getInstance();