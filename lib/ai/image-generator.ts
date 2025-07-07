import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ImageStyle = 
  | 'pixel-art'
  | 'cyberpunk-portrait'
  | 'dystopian-background'
  | 'aztec-soviet-style'
  | 'urban-delivery';

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
  'pixel-art': 'pixel art style, 16-bit, retro gaming aesthetic, clean pixels, neon colors, cyberpunk',
  'cyberpunk-portrait': 'cyberpunk character portrait, gig worker, Aztec-Soviet aesthetic, neon accents, delivery uniform',
  'dystopian-background': 'dystopian cityscape, Polanco district, Aztec pyramids meets Soviet brutalism, neon signs, rain',
  'aztec-soviet-style': 'Aztec-Soviet fusion art style, geometric patterns, gold and red color scheme, propaganda poster aesthetic',
  'urban-delivery': 'urban delivery scene, courier on bike, dystopian city, corporate surveillance, neon-lit streets'
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

      const image = response.data?.[0];
      
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
    const prompt = `Portrait of ${characterName}, a ${partnerClass} gig worker with traits: ${traitDescriptions}. Polanco delivery courier, WHIX uniform with Aztec-Soviet patches, neurodivergent representation, diverse appearance, urban dystopian setting`;

    return this.generateImage({
      prompt,
      style: 'cyberpunk-portrait',
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
    const prompt = `${levelName} delivery zone, ${environment} district in Polanco, ${difficulty} security level, cyberpunk dystopia with Aztec pyramids and Soviet architecture, rain-slicked streets, neon signs`;

    return this.generateImage({
      prompt,
      style: 'dystopian-background',
      size: '1792x1024',
      ...options,
    });
  }

  async generateItemIcon(
    itemName: string,
    itemType: string,
    rarity: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const prompt = `${itemName} icon, ${itemType} delivery equipment, ${rarity} tech level, cyberpunk courier gear, WHIX branded, Aztec-Soviet design elements`;

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
    const prompt = `${tileType} city block tile, ${environment} district, top-down view, tactical delivery route grid, Polanco urban layout, surveillance cameras`;

    return this.generateImage({
      prompt,
      style: 'aztec-soviet-style',
      size: '256x256',
      ...options,
    });
  }

  async generateUIElement(
    elementType: string,
    theme: string,
    options: Partial<ImageGenerationRequest> = {}
  ): Promise<GeneratedImage> {
    const prompt = `${elementType} UI element, ${theme} theme, cyberpunk interface, WHIX app design, Aztec geometric patterns with Soviet brutalist aesthetics`;

    return this.generateImage({
      prompt,
      style: 'aztec-soviet-style',
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
        prompt: `${basePrompt}, full body sprite, delivery courier character, WHIX uniform`,
        style: 'pixel-art',
        size: '256x256',
      }),
      this.generateImage({
        prompt: `${basePrompt}, character icon, portrait style`,
        style: 'pixel-art',
        size: '256x256',
      }),
    ]);

    return { portrait, sprite, icon };
  }
}

export const imageGenerator = ImageGenerator.getInstance();