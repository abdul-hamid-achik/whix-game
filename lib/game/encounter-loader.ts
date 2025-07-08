import { Encounter, EncounterSchema } from '@/lib/schemas/encounter-schemas';

// Cache for loaded encounters
const encounterCache = new Map<string, Encounter>();

/**
 * Load an encounter from the API
 */
export async function loadEncounter(encounterId: string): Promise<Encounter> {
  // Check cache first
  if (encounterCache.has(encounterId)) {
    return encounterCache.get(encounterId)!;
  }
  
  try {
    const response = await fetch(`/api/content/encounters?id=${encounterId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load encounter: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate with Zod
    const encounter = EncounterSchema.parse(data);
    
    // Cache it
    encounterCache.set(encounterId, encounter);
    
    return encounter;
  } catch (error) {
    console.error(`Error loading encounter ${encounterId}:`, error);
    throw error;
  }
}

/**
 * Load all available encounters
 */
export async function loadAllEncounters(): Promise<Encounter[]> {
  try {
    const response = await fetch('/api/content/encounters');
    
    if (!response.ok) {
      throw new Error(`Failed to load encounters: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache each encounter
    data.results.forEach((encounter: Encounter) => {
      encounterCache.set(encounter.id, encounter);
    });
    
    return data.results;
  } catch (error) {
    console.error('Error loading encounters:', error);
    return [];
  }
}

/**
 * Get a random encounter based on difficulty
 */
export async function getRandomEncounter(
  minDifficulty: number = 1,
  maxDifficulty: number = 10
): Promise<Encounter | null> {
  const encounters = await loadAllEncounters();
  
  const filtered = encounters.filter(
    e => e.difficulty >= minDifficulty && e.difficulty <= maxDifficulty
  );
  
  if (filtered.length === 0) return null;
  
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get encounters by opponent type
 */
export async function getEncountersByOpponent(opponentType: string): Promise<Encounter[]> {
  const encounters = await loadAllEncounters();
  return encounters.filter(e => e.opponent === opponentType);
}

/**
 * Clear the encounter cache
 */
export function clearEncounterCache() {
  encounterCache.clear();
}

/**
 * Validate encounter data without throwing
 */
export function validateEncounter(data: unknown): {
  valid: boolean;
  encounter?: Encounter;
  errors?: string[];
} {
  try {
    const encounter = EncounterSchema.parse(data);
    return { valid: true, encounter };
  } catch (error: any) {
    return {
      valid: false,
      errors: error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || ['Unknown validation error'],
    };
  }
}