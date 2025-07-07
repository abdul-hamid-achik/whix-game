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

// Node colors based on type
const NODE_COLORS = {
  [NodeType.START]: 'bg-green-600 hover:bg-green-700',
  [NodeType.DELIVERY]: 'bg-blue-600 hover:bg-blue-700',
  [NodeType.COMBAT]: 'bg-red-600 hover:bg-red-700',
  [NodeType.PUZZLE]: 'bg-purple-600 hover:bg-purple-700',
  [NodeType.SOCIAL]: 'bg-yellow-600 hover:bg-yellow-700',
  [NodeType.REST]: 'bg-emerald-600 hover:bg-emerald-700',
  [NodeType.SHOP]: 'bg-orange-600 hover:bg-orange-700',
  [NodeType.STORY]: 'bg-indigo-600 hover:bg-indigo-700',
  [NodeType.BOSS]: 'bg-red-800 hover:bg-red-900',
  [NodeType.END]: 'bg-cyan-600 hover:bg-cyan-700',
  [NodeType.BLOCKED]: 'bg-gray-700',
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
      onNodeClick(node.id);
    }
  };

  // Draw connections between nodes
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    const drawnConnections = new Set<string>();

    map.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const connectionKey = [node.id, targetId].sort().join('-');
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);

        const targetNode = map.nodes.get(targetId);
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
            stroke={isActive ? '#60a5fa' : '#374151'}
            strokeWidth={isActive ? 3 : 2}
            strokeDasharray={isActive ? '0' : '5,5'}
            opacity={isActive ? 1 : 0.5}
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
            'relative w-[60px] h-[60px] rounded-full flex items-center justify-center',
            'border-2 transition-all duration-200',
            NODE_COLORS[node.type],
            isClickable && 'cursor-pointer shadow-lg hover:shadow-xl',
            !isClickable && node.type !== NodeType.BLOCKED && 'opacity-50 cursor-not-allowed',
            isCompleted && 'ring-2 ring-green-400',
            isCurrent && 'ring-4 ring-yellow-400 animate-pulse'
          )}
          whileHover={isClickable ? { scale: 1.1 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
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
        {node.type !== NodeType.EMPTY && node.type !== NodeType.BLOCKED && (
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
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Background with theme */}
      <div 
        className={cn(
          'absolute inset-0',
          map.theme === 'industrial' && 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
          map.theme === 'residential' && 'bg-gradient-to-br from-blue-900 via-gray-800 to-blue-900',
          map.theme === 'corporate' && 'bg-gradient-to-br from-purple-900 via-gray-800 to-purple-900',
          map.theme === 'underground' && 'bg-gradient-to-br from-green-900 via-gray-800 to-green-900',
          map.theme === 'wasteland' && 'bg-gradient-to-br from-red-900 via-gray-800 to-red-900'
        )}
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
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: `${nodeSpacing}px ${nodeSpacing}px`
            }}
          />
          
          {/* Connections */}
          {renderConnections()}
          
          {/* Nodes */}
          {Array.from(map.nodes.values()).map(renderNode)}
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