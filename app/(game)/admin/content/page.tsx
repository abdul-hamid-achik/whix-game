'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentBrowser } from '@/components/cms/ContentBrowser';

export default function ContentManagementPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Content Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse and manage game content stored in markdown files
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-secondary/20 rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">📁 Content Location</h3>
            <code className="text-xs bg-secondary px-2 py-1 rounded">
              /content
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              All game content is stored as markdown files with YAML frontmatter
            </p>
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">✨ Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Type-safe metadata validation</li>
              <li>• Markdown to HTML conversion</li>
              <li>• Full-text search</li>
              <li>• Tag-based relationships</li>
            </ul>
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">🎮 Content Types</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Characters & Partners</li>
              <li>• Levels & Missions</li>
              <li>• Story Chapters</li>
              <li>• Maps & Locations</li>
              <li>• Items & Dialogues</li>
            </ul>
          </div>
        </div>

        {/* Content Browser */}
        <ContentBrowser />

        {/* Usage Example */}
        <div className="mt-8 p-6 bg-secondary/10 rounded-lg border">
          <h3 className="font-semibold mb-3">💡 Using Content in Code</h3>
          <pre className="bg-black/50 p-4 rounded text-sm overflow-x-auto">
            <code className="text-green-400">{`// In a React component
import { useCharacter } from '@/lib/cms/use-content';

export function CharacterProfile({ slug }: { slug: string }) {
  const { content, loading, error } = useCharacter(slug);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!content) return <div>Character not found</div>;
  
  return (
    <div>
      <h1>{content.metadata.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: content.htmlContent }} />
    </div>
  );
}`}</code>
          </pre>
          
          <pre className="bg-black/50 p-4 rounded text-sm overflow-x-auto mt-4">
            <code className="text-blue-400">{`// Server-side loading
import { loadCharacter } from '@/lib/cms/content-loader';

export async function getStaticProps({ params }) {
  const character = await loadCharacter(params.slug);
  
  return {
    props: { character },
    revalidate: 60, // Revalidate every minute
  };
}`}</code>
          </pre>
        </div>
      </motion.div>
    </div>
  );
}