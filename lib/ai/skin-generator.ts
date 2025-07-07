import { imageGenerator, ImageGenerationRequest } from './image-generator';

export interface SkinData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  skinType: 'outfit' | 'accessory' | 'vehicle' | 'device' | 'background';
  category: 'delivery_uniform' | 'street_wear' | 'corporate' | 'tech_gear' | 'courier_bike' | 'data_pad' | 'neural_interface' | 'city_backdrop';
  basePrompt: string;
  styleModifiers: Record<string, string>;
  partnerClassCompatible: string[];
  traitSynergies: string[];
  tipCost: number;
}

// Aztec-Soviet delivery world skin prompts
const WHIX_SKIN_PROMPTS = {
  // Outfits - What couriers wear in the Polanco collective dystopia
  delivery_uniform: {
    common: "Standard WHIX delivery jacket, soviet-style utility design with Aztec geometric patterns, worn red and gold fabric, collective emblem faded",
    rare: "Modified WHIX uniform with geometric Aztec embroidery, Soviet utility belt, weather-resistant, revolutionary style courier gear",
    epic: "Elite courier outfit, tactical soviet design, integrated data displays with Aztec glyph interfaces, red and gold accent lines",
    legendary: "Legendary collective courier gear, resistance tech integration, ancient Aztec-inspired armor meets Soviet engineering"
  },
  
  street_wear: {
    common: "Polanco street clothes, patched hoodie with Aztec motifs, worn soviet-style work pants, survival fashion in collective dystopia",
    rare: "Augmented street wear with embedded Aztec patterns, temperature regulation, urban collective survivalist chic",
    epic: "High-tech street fashion, programmable geometric LEDs, adaptive Aztec camouflage, resistance movement style with Soviet durability",
    legendary: "Legendary underground leader outfit, revolutionary Aztec-Soviet symbols, advanced tech integration with ancient design"
  },
  
  corporate: {
    common: "Corporate middle management attire, cheap synthetic suit with subtle geometric patterns, desperate professionalism in collective dystopia",
    rare: "Mid-tier executive wear, quality materials with Aztec-inspired details, subtle power symbols, climbing the collective hierarchy",
    epic: "High-level corporate fashion, luxury fabrics with golden geometric trim, intimidating presence, algorithmic collective elite",
    legendary: "Corporate overlord attire, ultimate power suit combining Soviet authority with Aztec ceremonial elements"
  },
  
  // Accessories - Gear for surviving the delivery dystopia
  tech_gear: {
    common: "Basic delivery scanner, cracked screen, jury-rigged repairs, gig economy survival tool",
    rare: "Enhanced delivery device, faster processing, custom modifications, courier efficiency boost",
    epic: "Advanced neural interface, direct brain connection, matrix-style data access",
    legendary: "Legendary hacker device, reality manipulation capabilities, system-breaking technology"
  },
  
  // Vehicles - What you use to navigate Neo Prosperity's chaos
  courier_bike: {
    common: "Beat-up delivery bike, rust spots, multiple repairs, economic desperation on wheels",
    rare: "Modified street bike, performance upgrades, courier optimization, urban navigation specialist",
    epic: "High-tech hover bike, anti-gravity systems, neon underglow, future delivery vehicle",
    legendary: "Legendary resistance transport, stealth capabilities, revolution on wheels"
  },
  
  // Devices - Tools of the trade in algorithm surveillance state
  data_pad: {
    common: "Standard WHIX tablet, corporate surveillance device, cracked screen, wage slave technology",
    rare: "Jailbroken delivery tablet, custom firmware, resistance apps, underground network access",
    epic: "Advanced hacking pad, system penetration tools, corporate espionage device",
    legendary: "Reality-hacking device, algorithm manipulation, matrix-breaking technology"
  },
  
  neural_interface: {
    common: "Basic neural jack, cheap cybernetics, gig economy body modification",
    rare: "Enhanced brain-computer interface, faster data processing, courier advantage",
    epic: "Military-grade neural implant, combat data integration, enhanced human capabilities",
    legendary: "Legendary consciousness merger, human-AI hybrid, transcendent technology"
  },
  
  // Backgrounds - The environments of Neo Prosperity's dystopia
  city_backdrop: {
    common: "Rain-soaked Polanco streets, neon signs, economic decay, cyberpunk urban decay",
    rare: "Corporate district skyline, glass towers, algorithmic city, dystopian prosperity",
    epic: "Underground resistance hideout, hidden technology, revolution planning, anti-corporate base",
    legendary: "The Algorithm's core chamber, digital reality, corporate consciousness, cyberpunk matrix"
  }
};

// Trait synergies for visual enhancement
const TRAIT_VISUAL_SYNERGIES = {
  hyperfocus: "intense concentration effects, laser-focused details, enhanced precision elements",
  pattern_recognition: "data visualization overlays, pattern-highlighting effects, analytical enhancement visuals",
  enhanced_senses: "sensory amplification effects, heightened awareness visuals, perception enhancement",
  systematic_thinking: "organizational efficiency effects, systematic arrangement, logical flow visuals",
  attention_to_detail: "precision enhancement effects, fine detail emphasis, meticulous craftsmanship",
  routine_mastery: "optimized workflow effects, efficient movement patterns, mastery demonstration",
  sensory_processing: "environmental adaptation effects, sensory filtering visuals, comfort optimization"
};

export class SkinGenerator {
  private static instance: SkinGenerator;
  
  public static getInstance(): SkinGenerator {
    if (!SkinGenerator.instance) {
      SkinGenerator.instance = new SkinGenerator();
    }
    return SkinGenerator.instance;
  }

  private constructor() {}

  generateSkinPrompt(
    skinData: SkinData, 
    partnerClass: string, 
    partnerTraits: string[], 
    _partnerName?: string
  ): string {
    const basePrompt = this.getBasePrompt(skinData);
    const rarityModifier = this.getRarityModifier(skinData.rarity);
    const classModifier = this.getClassModifier(partnerClass);
    const traitModifiers = this.getTraitModifiers(partnerTraits, skinData.traitSynergies);
    const contextModifier = this.getContextModifier(skinData.skinType);
    
    const fullPrompt = [
      basePrompt,
      rarityModifier,
      classModifier,
      traitModifiers,
      contextModifier,
      "Polanco cyberpunk delivery dystopia, gig economy survival, corporate surveillance state",
      "pixel art style, cyberpunk aesthetic, detailed character design"
    ].filter(Boolean).join(', ');

    return fullPrompt;
  }

  private getBasePrompt(skinData: SkinData): string {
    const categoryPrompts = WHIX_SKIN_PROMPTS[skinData.category as keyof typeof WHIX_SKIN_PROMPTS];
    if (categoryPrompts) {
      return categoryPrompts[skinData.rarity] || skinData.basePrompt;
    }
    return skinData.basePrompt;
  }

  private getRarityModifier(rarity: string): string {
    switch (rarity) {
      case 'common':
        return "worn, weathered, everyday survivor gear";
      case 'rare':
        return "enhanced, modified, street-smart upgrades";
      case 'epic':
        return "high-tech, advanced systems, elite equipment";
      case 'legendary':
        return "revolutionary, reality-bending, legendary status, ultimate power";
      default:
        return "";
    }
  }

  private getClassModifier(partnerClass: string): string {
    switch (partnerClass) {
      case 'courier':
        return "speed optimization, delivery efficiency, urban navigation specialist";
      case 'analyst':
        return "data processing enhancement, information analysis, pattern recognition tech";
      case 'negotiator':
        return "social interaction tools, communication enhancement, relationship building tech";
      case 'specialist':
        return "task-specific optimization, specialized equipment, expert-level gear";
      case 'investigator':
        return "surveillance tools, investigation enhancement, stealth technology";
      default:
        return "";
    }
  }

  private getTraitModifiers(partnerTraits: string[], traitSynergies: string[]): string {
    const relevantTraits = partnerTraits.filter(trait => 
      traitSynergies.includes(trait) || traitSynergies.length === 0
    );
    
    return relevantTraits
      .map(trait => TRAIT_VISUAL_SYNERGIES[trait as keyof typeof TRAIT_VISUAL_SYNERGIES])
      .filter(Boolean)
      .join(', ');
  }

  private getContextModifier(skinType: string): string {
    switch (skinType) {
      case 'outfit':
        return "character wearing outfit, full body visible, fashion focus";
      case 'accessory':
        return "detailed accessory focus, worn/held by character, functional design";
      case 'vehicle':
        return "vehicle in urban environment, courier transportation, street-ready";
      case 'device':
        return "handheld technology, user interface visible, dystopian tech design";
      case 'background':
        return "environmental backdrop, atmospheric setting, world immersion";
      default:
        return "";
    }
  }

  async generateSkinImage(
    skinData: SkinData,
    partnerClass: string,
    partnerTraits: string[],
    partnerName?: string
  ) {
    const prompt = this.generateSkinPrompt(skinData, partnerClass, partnerTraits, partnerName);
    
    const request: ImageGenerationRequest = {
      prompt,
      style: 'pixel-art',
      size: '512x512',
      quality: 'standard'
    };

    return await imageGenerator.generateImage(request);
  }

  // Generate multiple skin variations for gacha
  async generateSkinVariations(
    baseSkinData: SkinData,
    partnerClass: string,
    partnerTraits: string[],
    count: number = 3
  ) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const variation = {
        ...baseSkinData,
        name: `${baseSkinData.name} (Variant ${i + 1})`,
        styleModifiers: {
          ...baseSkinData.styleModifiers,
          variation: `style variation ${i + 1}, unique details, individual character`
        }
      };
      
      const generatedImage = await this.generateSkinImage(
        variation,
        partnerClass,
        partnerTraits
      );
      
      variations.push({
        skinData: variation,
        image: generatedImage
      });
    }
    
    return variations;
  }
}

export const skinGenerator = SkinGenerator.getInstance();