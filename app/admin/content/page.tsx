'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  FileText, 
  Users, 
  Sparkles, 
  Map, 
  Package, 
  BookOpen,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentStats {
  totalContent: number;
  byType: {
    characters: number;
    traits: number;
    levels: number;
    items: number;
    maps: number;
    chapters: number;
  };
  charactersByClass: Record<string, number>;
  traitsByCategory: Record<string, number>;
  levelsByDifficulty: Record<string, number>;
  itemsByRarity: Record<string, number>;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  name: string;
  description: string;
  category?: string;
  class?: string;
  rarity?: string;
  difficulty?: string;
}

export default function ContentManagementPage() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationStatus, setValidationStatus] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Load content statistics
      const statsResponse = await fetch('/api/content/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Load content items for search
      const searchResponse = await fetch('/api/content/search?q=');
      const searchData = await searchResponse.json();
      setContentItems(searchData.results || []);

      // Validate content
      const validationResponse = await fetch('/api/content/validate');
      const validationData = await validationResponse.json();
      setValidationStatus(validationData);

    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load content data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(searchQuery)}&type=${selectedType}`);
      const data = await response.json();
      setContentItems(data.results || []);
    } catch (error) {
      console.error('Error searching content:', error);
      toast({
        title: "Error",
        description: "Failed to search content",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'characters': return <Users className="w-4 h-4" />;
      case 'traits': return <Sparkles className="w-4 h-4" />;
      case 'levels': return <Map className="w-4 h-4" />;
      case 'items': return <Package className="w-4 h-4" />;
      case 'maps': return <Map className="w-4 h-4" />;
      case 'chapters': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management System</h1>
          <p className="text-muted-foreground">
            Manage game content including characters, traits, levels, items, and more
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadContent}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Content Validation Status */}
      {validationStatus && (
        <Card className={validationStatus.valid ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {validationStatus.valid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <CardTitle>
                Content Validation {validationStatus.valid ? 'Passed' : 'Failed'}
              </CardTitle>
            </div>
          </CardHeader>
          {!validationStatus.valid && validationStatus.errors.length > 0 && (
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {validationStatus.errors.map((error, index) => (
                  <li key={index} className="text-red-600">{error}</li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search & Browse</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <>
              {/* Content Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalContent}</div>
                    <p className="text-xs text-muted-foreground">Across all types</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Characters</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.byType.characters}</div>
                    <p className="text-xs text-muted-foreground">Partner characters</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Traits</CardTitle>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.byType.traits}</div>
                    <p className="text-xs text-muted-foreground">Neurodivergent traits</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Levels</CardTitle>
                    <Map className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.byType.levels}</div>
                    <p className="text-xs text-muted-foreground">Game levels</p>
                  </CardContent>
                </Card>
              </div>

              {/* Content Breakdown Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Characters by Class</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.charactersByClass).map(([cls, count]) => (
                        <div key={cls} className="flex justify-between items-center">
                          <span className="capitalize">{cls}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traits by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.traitsByCategory).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="capitalize">{category}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Levels by Difficulty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.levelsByDifficulty).map(([difficulty, count]) => (
                        <div key={difficulty} className="flex justify-between items-center">
                          <span className="capitalize">{difficulty}</span>
                          <Badge variant="secondary" className={getDifficultyColor(difficulty)}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Items by Rarity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.itemsByRarity).map(([rarity, count]) => (
                        <div key={rarity} className="flex justify-between items-center">
                          <span className="capitalize">{rarity}</span>
                          <Badge variant="secondary" className={getRarityColor(rarity)}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Content</CardTitle>
              <CardDescription>
                Search across all content types including characters, traits, levels, and items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="characters">Characters</option>
                  <option value="traits">Traits</option>
                  <option value="levels">Levels</option>
                  <option value="items">Items</option>
                  <option value="maps">Maps</option>
                  <option value="chapters">Chapters</option>
                </select>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {contentItems.map((item) => (
                    <Card key={`${item.type}-${item.id}`} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <h4 className="font-semibold">{item.title || item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{item.type}</Badge>
                              {item.rarity && (
                                <Badge className={getRarityColor(item.rarity)}>
                                  {item.rarity}
                                </Badge>
                              )}
                              {item.difficulty && (
                                <Badge className={getDifficultyColor(item.difficulty)}>
                                  {item.difficulty}
                                </Badge>
                              )}
                              {item.class && (
                                <Badge variant="secondary">{item.class}</Badge>
                              )}
                              {item.category && (
                                <Badge variant="secondary">{item.category}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle>Character Management</CardTitle>
              <CardDescription>
                Manage partner characters and their traits, abilities, and progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Character management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traits">
          <Card>
            <CardHeader>
              <CardTitle>Trait Management</CardTitle>
              <CardDescription>
                Manage neurodivergent traits and their gameplay effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Trait management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>Level Management</CardTitle>
              <CardDescription>
                Manage game levels, their roguelike elements, and accessibility features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Level management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Item Management</CardTitle>
              <CardDescription>
                Manage equipment, consumables, and other game items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Item management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}