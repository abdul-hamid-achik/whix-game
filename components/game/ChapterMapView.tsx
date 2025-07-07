'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Swords, Puzzle, Users, Home, ShoppingBag, 
  BookOpen, Skull, Flag, Lock, MapPin, Cloud, 
  CloudRain, CloudSnow, Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  ChapterMap, 
  MapNode, 
  NodeType, 
  NodeStatus,
  getMapProgress
} from '@/lib/game/chapterMap';

// Node type icons
const NODE_ICONS = {
  [NodeType.START]: Flag,
  [NodeType.DELIVERY]: Package,
  [NodeType.COMBAT]: Swords,
  [NodeType.PUZZLE]: Puzzle,
  [NodeType.SOCIAL]: Users,
  [NodeType.REST]: Home,
  [NodeType.SHOP]: ShoppingBag,
  [NodeType.STORY]: BookOpen,
  [NodeType.BOSS]: Skull,
  [NodeType.END]: MapPin,
  [NodeType.BLOCKED]: Lock,
  [NodeType.EMPTY]: null
};

// Pixel art style node colors with 8-bit aesthetic
const NODE_COLORS = {
  [NodeType.START]: 'bg-green-500 hover:bg-green-400 border-green-300',
  [NodeType.DELIVERY]: 'bg-blue-500 hover:bg-blue-400 border-blue-300',
  [NodeType.COMBAT]: 'bg-red-500 hover:bg-red-400 border-red-300',
  [NodeType.PUZZLE]: 'bg-purple-500 hover:bg-purple-400 border-purple-300',
  [NodeType.SOCIAL]: 'bg-yellow-500 hover:bg-yellow-400 border-yellow-300',
  [NodeType.REST]: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300',
  [NodeType.SHOP]: 'bg-orange-500 hover:bg-orange-400 border-orange-300',
  [NodeType.STORY]: 'bg-indigo-500 hover:bg-indigo-400 border-indigo-300',
  [NodeType.BOSS]: 'bg-red-700 hover:bg-red-600 border-red-500',
  [NodeType.END]: 'bg-cyan-500 hover:bg-cyan-400 border-cyan-300',
  [NodeType.BLOCKED]: 'bg-gray-600 border-gray-500',
  [NodeType.EMPTY]: 'bg-transparent'
};

// Weather icons
const WEATHER_ICONS = {
  rain: CloudRain,
  fog: Cloud,
  storm: Zap,
  toxic: CloudSnow,
  clear: null
};

interface ChapterMapViewProps {
  map: ChapterMap;
  onNodeClick: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, rewards: any) => void;
}

export function ChapterMapView({ map, onNodeClick }: ChapterMapViewProps) {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  
  // Debug logging
  console.log('🎮 ChapterMapView received map:', map);
  console.log('🎮 Map nodes:', map.nodes);
  console.log('🎮 Nodes count:', map.nodes instanceof Map ? map.nodes.size : Object.keys(map.nodes || {}).length);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node size and spacing
  const nodeSize = 60;
  const nodeSpacing = 80;
  const mapWidth = map.gridWidth * nodeSpacing;
  const mapHeight = map.gridHeight * nodeSpacing;

  // Handle map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - viewOffset.x,
      y: e.clientY - viewOffset.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prevZoom => Math.max(0.5, Math.min(2, prevZoom + delta)));
  };

  // Handle node selection
  const handleNodeClick = (node: MapNode) => {
    if (node.type === NodeType.EMPTY || node.type === NodeType.BLOCKED) return;
    
    if (node.status === NodeStatus.AVAILABLE || node.status === NodeStatus.CURRENT) {
      setSelectedNode(node);
      
      // Play click sound effect (placeholder)
      console.log(`🎮 Node clicked: ${node.title} (${node.type})`);
      
      // Call the parent's onNodeClick with the node ID
      onNodeClick(node.id);
    } else if (node.status === NodeStatus.LOCKED) {
      // Give feedback for locked nodes
      console.log('🔒 This node is locked!');
    }
  };

  // Draw connections between nodes
  const renderConnections = () => {
    const connections: React.JSX.Element[] = [];
    const drawnConnections = new Set<string>();

    // Safely iterate over nodes
    const nodeValues = (map.nodes instanceof Map ? Array.from(map.nodes.values()) : Object.values(map.nodes)) as MapNode[];
    
    nodeValues.forEach((node) => {
      node.connections.forEach(targetId => {
        const connectionKey = [node.id, targetId].sort().join('-');
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);

        // Safe node lookup
        const targetNode = map.nodes instanceof Map ? map.nodes.get(targetId) : map.nodes[targetId];
        if (!targetNode) return;

        const x1 = node.x * nodeSpacing + nodeSize / 2;
        const y1 = node.y * nodeSpacing + nodeSize / 2;
        const x2 = targetNode.x * nodeSpacing + nodeSize / 2;
        const y2 = targetNode.y * nodeSpacing + nodeSize / 2;

        const isActive = 
          (node.status === NodeStatus.COMPLETED || node.status === NodeStatus.CURRENT) &&
          (targetNode.status !== NodeStatus.LOCKED);

        connections.push(
          <line
            key={connectionKey}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isActive ? '#10b981' : '#6b7280'}
            strokeWidth={isActive ? 4 : 3}
            strokeDasharray={isActive ? '0' : '8,4'}
            opacity={isActive ? 1 : 0.6}
            style={{ 
              filter: isActive ? 'drop-shadow(0px 0px 4px #10b981)' : 'none',
              strokeLinecap: 'round'
            }}
          />
        );
      });
    });

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={mapWidth}
        height={mapHeight}
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {connections}
      </svg>
    );
  };

  // Render individual node
  const renderNode = (node: MapNode) => {
    const Icon = NODE_ICONS[node.type];
    const isClickable = node.status === NodeStatus.AVAILABLE || node.status === NodeStatus.CURRENT;
    const isCompleted = node.status === NodeStatus.COMPLETED;
    const isCurrent = node.status === NodeStatus.CURRENT;

    if (node.type === NodeType.EMPTY) {
      return null;
    }

    return (
      <motion.div
        key={node.id}
        className="absolute"
        style={{
          left: node.x * nodeSpacing,
          top: node.y * nodeSpacing,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: zoom,
          opacity: 1 
        }}
        transition={{ 
          delay: Math.random() * 0.5,
          duration: 0.3
        }}
      >
        <motion.button
          className={cn(
            'relative w-[60px] h-[60px] flex items-center justify-center',
            'border-4 transition-all duration-150',
            'pixel-corners', // Custom CSS class for pixel corners
            NODE_COLORS[node.type],
            isClickable && 'cursor-pointer hover:scale-105 active:scale-95',
            !isClickable && node.type !== NodeType.BLOCKED && 'opacity-50 cursor-not-allowed grayscale',
            isCompleted && 'ring-4 ring-green-400 ring-offset-2 ring-offset-gray-900',
            isCurrent && 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900',
            'image-rendering-pixelated' // Pixelated rendering
          )}
          style={{
            clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))',
            imageRendering: 'pixelated'
          }}
          whileHover={isClickable ? { 
            scale: 1.1,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          } : {}}
          whileTap={isClickable ? { scale: 0.9 } : {}}
          onClick={() => handleNodeClick(node)}
          disabled={!isClickable}
        >
          {Icon && <Icon className="w-6 h-6 text-white" />}
          
          {/* Difficulty indicator */}
          {node.difficulty && node.difficulty > 1 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {node.difficulty}
            </div>
          )}
          
          {/* Lock indicator for locked nodes */}
          {node.status === NodeStatus.LOCKED && node.type !== NodeType.BLOCKED && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}
        </motion.button>
        
        {/* Node label */}
        {node.type !== NodeType.BLOCKED && (
          <div className="text-center mt-1">
            <p className="text-xs text-gray-300 max-w-[80px] truncate">
              {node.title}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  const progress = getMapProgress(map);
  const WeatherIcon = WEATHER_ICONS[map.weatherEffect || 'clear'];

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      {/* Pixel-art themed background */}
      <div 
        className={cn(
          'absolute inset-0',
          map.theme === 'industrial' && 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900',
          map.theme === 'residential' && 'bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900',
          map.theme === 'corporate' && 'bg-gradient-to-br from-purple-900 via-slate-800 to-purple-900',
          map.theme === 'underground' && 'bg-gradient-to-br from-green-900 via-slate-800 to-green-900',
          map.theme === 'wasteland' && 'bg-gradient-to-br from-red-900 via-slate-800 to-red-900'
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 20px 20px',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Map container */}
      <div
        ref={mapRef}
        className="relative w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
            width: mapWidth,
            height: mapHeight
          }}
        >
          {/* Pixel grid background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px),
                radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 2px, transparent 2px)
              `,
              backgroundSize: `${nodeSpacing}px ${nodeSpacing}px, ${nodeSpacing}px ${nodeSpacing}px, ${nodeSpacing * 2}px ${nodeSpacing * 2}px`,
              imageRendering: 'pixelated'
            }}
          />
          
          {/* Connections */}
          {renderConnections()}
          
          {/* Nodes */}
          {(() => {
            const nodeValues = (map.nodes instanceof Map ? Array.from(map.nodes.values()) : Object.values(map.nodes)) as MapNode[];
            console.log('🎮 Rendering nodes:', nodeValues.length, nodeValues);
            return nodeValues.map((node) => renderNode(node));
          })()}
        </div>
      </div>
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Chapter info */}
          <Card className="pointer-events-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {map.title}
                {WeatherIcon && <WeatherIcon className="w-4 h-4 text-gray-400" />}
              </CardTitle>
              <CardDescription>{map.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Controls */}
          <Card className="pointer-events-auto">
            <CardContent className="p-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(z => Math.min(2, z + 0.2))}
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
                >
                  -
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setZoom(1);
                    setViewOffset({ x: 0, y: 0 });
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Selected node details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {NODE_ICONS[selectedNode.type] && 
                    React.createElement(NODE_ICONS[selectedNode.type]!, { className: "w-5 h-5" })
                  }
                  {selectedNode.title}
                </CardTitle>
                <CardDescription>{selectedNode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Difficulty */}
                  {selectedNode.difficulty && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Difficulty:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full',
                              i < selectedNode.difficulty! ? 'bg-red-500' : 'bg-gray-600'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rewards */}
                  {selectedNode.rewards && (
                    <div className="space-y-1">
                      <span className="text-sm text-gray-400">Rewards:</span>
                      <div className="flex gap-2 flex-wrap">
                        {selectedNode.rewards.tips && (
                          <Badge variant="secondary">
                            💰 {selectedNode.rewards.tips} tips
                          </Badge>
                        )}
                        {selectedNode.rewards.experience && (
                          <Badge variant="secondary">
                            ⭐ {selectedNode.rewards.experience} XP
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action button */}
                  {selectedNode.status === NodeStatus.AVAILABLE && (
                    <Button 
                      className="w-full"
                      onClick={() => onNodeClick(selectedNode.id)}
                    >
                      Enter Location
                    </Button>
                  )}
                  
                  {selectedNode.status === NodeStatus.CURRENT && (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Location
                    </Button>
                  )}
                  
                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedNode(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}