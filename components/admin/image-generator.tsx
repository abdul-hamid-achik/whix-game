'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  Download, 
  Loader2, 
  Image as ImageIcon,
  Users,
  Map,
  Palette,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GeneratedImage } from '@/lib/ai/image-generator';

interface ImageGeneratorProps {
  onImageGenerated?: (image: GeneratedImage) => void;
}

export function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [formData, setFormData] = useState({
    prompt: '',
    style: 'pixel-art',
    size: '512x512',
    quality: 'standard',
  });
  const [characterData, setCharacterData] = useState({
    name: '',
    class: '',
    traits: '',
  });
  const [levelData, setLevelData] = useState({
    name: '',
    environment: '',
    difficulty: 'medium',
  });
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!formData.prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedImage(result.data);
        onImageGenerated?.(result.data);
        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
      } else {
        throw new Error(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCharacterPortrait = async () => {
    if (!characterData.name || !characterData.class || !characterData.traits) {
      toast({
        title: "Error",
        description: "Please fill in all character fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterName: characterData.name,
          partnerClass: characterData.class,
          traits: characterData.traits.split(',').map(t => t.trim()),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedImage(result.data);
        onImageGenerated?.(result.data);
        toast({
          title: "Success",
          description: "Character portrait generated successfully!",
        });
      } else {
        throw new Error(result.error || 'Failed to generate character portrait');
      }
    } catch (error) {
      console.error('Error generating character portrait:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate character portrait",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCharacterPack = async () => {
    if (!characterData.name || !characterData.class || !characterData.traits) {
      toast({
        title: "Error",
        description: "Please fill in all character fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'character-pack',
          data: {
            characterName: characterData.name,
            partnerClass: characterData.class,
            traits: characterData.traits.split(',').map(t => t.trim()),
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Character asset pack generated successfully!",
        });
        // Handle the pack result (multiple images)
        console.log('Character pack:', result.data);
      } else {
        throw new Error(result.error || 'Failed to generate character pack');
      }
    } catch (error) {
      console.error('Error generating character pack:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate character pack",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wand2 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">AI Image Generator</h2>
        <Badge variant="secondary">OpenAI DALL-E</Badge>
      </div>

      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="custom">
            <ImageIcon className="h-4 w-4 mr-2" />
            Custom
          </TabsTrigger>
          <TabsTrigger value="characters">
            <Users className="h-4 w-4 mr-2" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="levels">
            <Map className="h-4 w-4 mr-2" />
            Levels
          </TabsTrigger>
          <TabsTrigger value="ui">
            <Palette className="h-4 w-4 mr-2" />
            UI Elements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Image Generation</CardTitle>
              <CardDescription>
                Generate custom images with specific prompts and styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pixel-art">Pixel Art</SelectItem>
                      <SelectItem value="fantasy-portrait">Fantasy Portrait</SelectItem>
                      <SelectItem value="medieval-background">Medieval Background</SelectItem>
                      <SelectItem value="kingdom-rush-style">Kingdom Rush Style</SelectItem>
                      <SelectItem value="roguelike-dungeon">Roguelike Dungeon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="256x256">256x256</SelectItem>
                      <SelectItem value="512x512">512x512</SelectItem>
                      <SelectItem value="1024x1024">1024x1024</SelectItem>
                      <SelectItem value="1024x1792">1024x1792</SelectItem>
                      <SelectItem value="1792x1024">1792x1024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerateImage} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle>Character Generation</CardTitle>
              <CardDescription>
                Generate character portraits and asset packs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="character-name">Character Name</Label>
                  <Input
                    id="character-name"
                    placeholder="Elena Vasquez"
                    value={characterData.name}
                    onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="character-class">Partner Class</Label>
                  <Select value={characterData.class} onValueChange={(value) => setCharacterData({ ...characterData, class: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="courier">Courier</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="negotiator">Negotiator</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="investigator">Investigator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="character-traits">Traits (comma-separated)</Label>
                <Input
                  id="character-traits"
                  placeholder="hyperfocus, pattern recognition, enhanced senses"
                  value={characterData.traits}
                  onChange={(e) => setCharacterData({ ...characterData, traits: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleGenerateCharacterPortrait} 
                  disabled={isGenerating}
                  variant="outline"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-2 h-4 w-4" />
                  )}
                  Generate Portrait
                </Button>

                <Button 
                  onClick={handleGenerateCharacterPack} 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="mr-2 h-4 w-4" />
                  )}
                  Generate Asset Pack
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>Level Asset Generation</CardTitle>
              <CardDescription>
                Generate backgrounds and environmental assets for levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Level asset generation interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle>UI Element Generation</CardTitle>
              <CardDescription>
                Generate UI elements and interface components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">UI element generation interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              {generatedImage.prompt}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={generatedImage.url} 
                  alt="Generated image"
                  className="w-full rounded-lg border"
                />
                <Button
                  onClick={() => downloadImage(generatedImage.url, `generated-${Date.now()}.png`)}
                  className="absolute top-2 right-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Style: {generatedImage.style}</Badge>
                <Badge variant="secondary">Size: {generatedImage.size}</Badge>
                <Badge variant="secondary">
                  Generated: {generatedImage.createdAt.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}