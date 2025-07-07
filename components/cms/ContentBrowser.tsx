'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Users, Map, Package, MessageSquare, Book } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContent } from '@/lib/cms/use-content';
import { ContentMetadata } from '@/lib/cms/content-types';
import { cn } from '@/lib/utils';

const contentTypeConfig = {
  character: { icon: Users, color: 'text-purple-500' },
  level: { icon: Package, color: 'text-green-500' },
  chapter: { icon: Book, color: 'text-blue-500' },
  map: { icon: Map, color: 'text-orange-500' },
  item: { icon: FileText, color: 'text-yellow-500' },
  dialogue: { icon: MessageSquare, color: 'text-pink-500' },
};

export function ContentBrowser() {
  const [activeType, setActiveType] = useState<ContentMetadata['type']>('character');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const { content, loading, error } = useContent({
    type: activeType,
    query: searchQuery || undefined,
  });

  const contentArray = Array.isArray(content) ? content : [];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Type Tabs */}
      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ContentMetadata['type'])}>
        <TabsList className="grid w-full grid-cols-6">
          {Object.entries(contentTypeConfig).map(([type, config]) => (
            <TabsTrigger key={type} value={type} className="flex items-center gap-2">
              <config.icon className={cn("h-4 w-4", config.color)} />
              <span className="hidden sm:inline">{type}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content Grid */}
        <TabsContent value={activeType} className="mt-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive">
              Error loading content: {error.message}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contentArray.map((item) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedContent === item.slug && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedContent(item.slug)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.metadata.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {item.metadata.description}
                          </CardDescription>
                        </div>
                        {renderContentTypeIcon(item.metadata)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {item.metadata.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {renderContentSpecificInfo(item.metadata)}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && contentArray.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No content found matching your search.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected Content Preview */}
      {selectedContent && (
        <ContentPreview 
          type={activeType} 
          slug={selectedContent} 
          onClose={() => setSelectedContent(null)} 
        />
      )}
    </div>
  );
}

function renderContentTypeIcon(metadata: ContentMetadata) {
  const config = contentTypeConfig[metadata.type];
  const Icon = config.icon;
  
  return (
    <div className={cn("p-2 rounded-full bg-secondary", config.color)}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function renderContentSpecificInfo(metadata: ContentMetadata) {
  switch (metadata.type) {
    case 'character':
      return (
        <div className="mt-4 space-y-1 text-sm">
          <p>Role: <span className="font-medium">{metadata.role}</span></p>
          {metadata.class && <p>Class: <span className="font-medium">{metadata.class}</span></p>}
          {metadata.traits && <p>Traits: {metadata.traits.join(', ')}</p>}
        </div>
      );
    case 'level':
      return (
        <div className="mt-4 space-y-1 text-sm">
          <p>Type: <span className="font-medium">{metadata.missionType}</span></p>
          <p>Difficulty: <span className="font-medium">{metadata.difficulty}</span></p>
          <p>Objectives: {metadata.objectives.length}</p>
        </div>
      );
    case 'chapter':
      return (
        <div className="mt-4 space-y-1 text-sm">
          <p>Chapter {metadata.chapterNumber}</p>
          <p>Setting: {metadata.setting}</p>
          <p>Choices: {metadata.choices.length}</p>
        </div>
      );
    case 'map':
      return (
        <div className="mt-4 space-y-1 text-sm">
          <p>Zone: <span className="font-medium">{metadata.zone}</span></p>
          <p>Size: {metadata.size.width}x{metadata.size.height}</p>
          <p>Type: {metadata.gridType}</p>
        </div>
      );
    case 'item':
      return (
        <div className="mt-4 space-y-1 text-sm">
          <p>Category: <span className="font-medium">{metadata.category}</span></p>
          <p>Rarity: <span className="font-medium">{metadata.rarity}</span></p>
          <p>Value: {metadata.value} tips</p>
        </div>
      );
    case 'dialogue':
      return (
        <div className="mt-4 space-y-1 text-sm">
          <p>Trigger: <span className="font-medium">{metadata.trigger}</span></p>
          <p>Priority: <span className="font-medium">{metadata.priority}</span></p>
          <p>Characters: {metadata.characters.length}</p>
        </div>
      );
    default:
      return null;
  }
}

function ContentPreview({ 
  type, 
  slug, 
  onClose 
}: { 
  type: ContentMetadata['type']; 
  slug: string; 
  onClose: () => void;
}) {
  const { content, loading } = useContent({ type, slug });
  const item = !Array.isArray(content) ? content : null;

  if (loading || !item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 bottom-0 bg-background border-t p-6 max-h-[50vh] overflow-y-auto z-50"
    >
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold">{item.metadata.title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: item.htmlContent }}
        />
      </div>
    </motion.div>
  );
}