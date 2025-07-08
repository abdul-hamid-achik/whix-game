import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { 
  ContentMetadata, 
  ContentMetadataSchema,
  CharacterMetadata,
  LevelMetadata,
  ChapterMetadata,
  MapMetadata,
  ItemMetadata,
  TraitMetadata,
  DialogueMetadata
} from './content-types';

// Base content directory
const CONTENT_DIR = path.join(process.cwd(), 'content');

// Content type to directory mapping
const CONTENT_DIRECTORIES = {
  character: 'characters',
  level: 'levels',
  chapter: 'chapters',
  map: 'maps',
  item: 'items',
  trait: 'traits',
  dialogue: 'dialogues',
  'ui-content': 'ui',
} as const;

export interface ContentFile<T extends ContentMetadata = ContentMetadata> {
  metadata: T;
  content: string;
  htmlContent: string;
  slug: string;
  filePath: string;
}

// Process markdown content to HTML
async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

// Get all files in a directory recursively
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return arrayOfFiles;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      } else if (file.endsWith('.md')) {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return arrayOfFiles;
  }
}

// Load a single content file
export async function loadContentFile<T extends ContentMetadata>(
  filePath: string
): Promise<ContentFile<T> | null> {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Validate metadata
    const validatedMetadata = ContentMetadataSchema.parse(data) as T;
    
    // Convert markdown to HTML
    const htmlContent = await markdownToHtml(content);
    
    // Extract slug from filename
    const slug = path.basename(filePath, '.md');
    
    return {
      metadata: validatedMetadata,
      content,
      htmlContent,
      slug,
      filePath,
    };
  } catch (error) {
    console.error(`Error loading content file ${filePath}:`, error);
    return null;
  }
}

// Load all content files of a specific type
export async function loadContentByType<T extends ContentMetadata>(
  type: T['type']
): Promise<ContentFile<T>[]> {
  const contentDir = path.join(CONTENT_DIR, CONTENT_DIRECTORIES[type]);
  const files = getAllFiles(contentDir);
  
  const contentFiles = await Promise.all(
    files.map(file => loadContentFile<T>(file))
  );
  
  return contentFiles.filter((file): file is ContentFile<T> => 
    file !== null && file.metadata.type === type
  );
}

// Load a specific content file by type and slug
export async function loadContentBySlug<T extends ContentMetadata>(
  type: T['type'],
  slug: string
): Promise<ContentFile<T> | null> {
  const filePath = path.join(CONTENT_DIR, CONTENT_DIRECTORIES[type], `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    // Try to find in subdirectories
    const contentDir = path.join(CONTENT_DIR, CONTENT_DIRECTORIES[type]);
    const allFiles = getAllFiles(contentDir);
    const targetFile = allFiles.find(file => path.basename(file, '.md') === slug);
    
    if (targetFile) {
      return loadContentFile<T>(targetFile);
    }
    
    return null;
  }
  
  return loadContentFile<T>(filePath);
}

// Type-specific loaders for better type safety
export const loadCharacter = (slug: string) => 
  loadContentBySlug<CharacterMetadata>('character', slug);

export const loadAllCharacters = () => 
  loadContentByType<CharacterMetadata>('character');

export const loadLevel = (slug: string) => 
  loadContentBySlug<LevelMetadata>('level', slug);

export const loadAllLevels = () => 
  loadContentByType<LevelMetadata>('level');

export const loadChapter = (slug: string) => 
  loadContentBySlug<ChapterMetadata>('chapter', slug);

export const loadAllChapters = () => 
  loadContentByType<ChapterMetadata>('chapter');

export const loadMap = (slug: string) => 
  loadContentBySlug<MapMetadata>('map', slug);

export const loadAllMaps = () => 
  loadContentByType<MapMetadata>('map');

export const loadItem = (slug: string) => 
  loadContentBySlug<ItemMetadata>('item', slug);

export const loadAllItems = () => 
  loadContentByType<ItemMetadata>('item');

export const loadTrait = (slug: string) => 
  loadContentBySlug<TraitMetadata>('trait', slug);

export const loadAllTraits = () => 
  loadContentByType<TraitMetadata>('trait');

export const loadDialogue = (slug: string) => 
  loadContentBySlug<DialogueMetadata>('dialogue', slug);

export const loadAllDialogues = () => 
  loadContentByType<DialogueMetadata>('dialogue');

// Search content across all types
export async function searchContent(
  query: string,
  types?: ContentMetadata['type'][]
): Promise<ContentFile[]> {
  const typesToSearch = types || Object.keys(CONTENT_DIRECTORIES) as ContentMetadata['type'][];
  const allContent: ContentFile[] = [];
  
  for (const type of typesToSearch) {
    const content = await loadContentByType(type);
    allContent.push(...content);
  }
  
  const lowerQuery = query.toLowerCase();
  
  return allContent.filter(file => 
    file.metadata.title.toLowerCase().includes(lowerQuery) ||
    file.metadata.description.toLowerCase().includes(lowerQuery) ||
    file.content.toLowerCase().includes(lowerQuery) ||
    file.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get related content based on tags
export async function getRelatedContent(
  contentFile: ContentFile,
  limit: number = 5
): Promise<ContentFile[]> {
  if (!contentFile.metadata.tags || contentFile.metadata.tags.length === 0) {
    return [];
  }
  
  const allContent: ContentFile[] = [];
  
  for (const type of Object.keys(CONTENT_DIRECTORIES) as ContentMetadata['type'][]) {
    const content = await loadContentByType(type);
    allContent.push(...content);
  }
  
  // Calculate relevance score based on shared tags
  const scoredContent = allContent
    .filter(file => file.slug !== contentFile.slug)
    .map(file => {
      const sharedTags = file.metadata.tags?.filter(tag => 
        contentFile.metadata.tags?.includes(tag)
      ).length || 0;
      
      return { file, score: sharedTags };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scoredContent.map(item => item.file);
}

// Initialize content directories
export function initializeContentDirectories(): void {
  Object.values(CONTENT_DIRECTORIES).forEach(dir => {
    const dirPath = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Watch for content changes (for development)
export function watchContent(
  callback: (event: string, filename: string) => void
): fs.FSWatcher {
  return fs.watch(CONTENT_DIR, { recursive: true }, (event, filename) => {
    if (filename) {
      callback(event, filename);
    }
  });
}