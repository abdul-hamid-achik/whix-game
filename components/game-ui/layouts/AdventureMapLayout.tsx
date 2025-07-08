'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore, GameState } from '@/lib/stores/uiStore';
import { useGameStore } from '@/lib/stores/gameStore';
import { usePartnerStore } from '@/lib/stores/partnerStore';
import { NeuraPanel, NeuraButton } from '@/components/neura';
import { getIcon } from '@/lib/config/delivery-mode-config';
import { ArrowLeft, Map, Target, Clock, Users, AlertTriangle, Play, MapPin } from 'lucide-react';
import { generateChapterMap, ChapterMap, MapNode, NodeType, NodeStatus, moveToNode } from '@/lib/game/chapterMap';

interface AdventureMapLayoutProps {
  children: ReactNode;
}

export function AdventureMapLayout({ children: _children }: AdventureMapLayoutProps) {
  const { setState, settings } = useUIStore();
  const { currentChapter, level } = useGameStore();
  const { partners } = usePartnerStore();
  const appMode = settings.appMode || 'game';
  
  const [chapterMap, setChapterMap] = useState<ChapterMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activePartners = Object.values(partners).slice(0, 3); // Take first 3 partners

  // Generate chapter map on mount
  useEffect(() => {
    const map = generateChapterMap(currentChapter, 12, 15, Math.floor(level / 3) + 1);
    setChapterMap(map);
  }, [currentChapter, level]);

  const handleNodeClick = (node: MapNode) => {
    if (node.status === NodeStatus.AVAILABLE || node.status === NodeStatus.CURRENT) {
      setSelectedNode(node);
      // Automatically enter the node if it's available or current
      if (node.status === NodeStatus.AVAILABLE || node.status === NodeStatus.CURRENT) {
        handleNodeEnter(node);
      }
    }
  };

  const handleNodeEnter = (node: MapNode) => {
    if (!chapterMap || node.status === NodeStatus.LOCKED) return;
    
    console.log('Entering node:', node);
    
    // Update map and move to tactical encounter
    // Create a deep copy to ensure React detects the state change
    const nodesCopy: Map<string, MapNode> = new (globalThis.Map)();
    chapterMap.nodes.forEach((value, key) => {
      nodesCopy.set(key, value);
    });
    
    const mapCopy: ChapterMap = {
      ...chapterMap,
      nodes: nodesCopy
    };
    const updatedMap = moveToNode(mapCopy, node.id);
    setChapterMap(updatedMap);
    
    // Transition to encounter based on node type
    switch (node.type) {
        case NodeType.COMBAT:
          console.log('Transitioning to TACTICAL_COMBAT with data:', {
            encounterType: 'combat',
            nodeData: node,
            mapData: updatedMap
          });
          setState(GameState.TACTICAL_COMBAT, {
            encounterType: 'combat',
            nodeData: node,
            mapData: updatedMap
          });
          break;
      case NodeType.STORY:
        setState(GameState.EVENT_RESOLUTION, {
          encounterType: 'story',
          nodeData: node,
          mapData: updatedMap
        });
        break;
      case NodeType.BOSS:
        setState(GameState.TACTICAL_COMBAT, {
          encounterType: 'boss',
          nodeData: node,
          mapData: updatedMap
        });
        break;
      default:
        setState(GameState.EVENT_RESOLUTION, {
          encounterType: node.type,
          nodeData: node,
          mapData: updatedMap
        });
    }
  };

  const getNodeColor = (node: MapNode) => {
    switch (node.status) {
      case NodeStatus.CURRENT: return 'bg-cyan-500 border-cyan-400';
      case NodeStatus.COMPLETED: return 'bg-green-600 border-green-500';
      case NodeStatus.AVAILABLE: return 'bg-purple-600 border-purple-500';
      case NodeStatus.LOCKED: return 'bg-gray-700 border-gray-600';
    }
  };

  const getNodeIcon = (type: NodeType) => {
    if (appMode === 'delivery') {
      // Delivery mode icons
      switch (type) {
        case NodeType.START: return '🏠'; // Home/Hub
        case NodeType.END: return '🏁'; // Final destination
        case NodeType.DELIVERY: return '📦'; // Package pickup/dropoff
        case NodeType.COMBAT: return getIcon('COMBAT', appMode); // Traffic/obstacle
        case NodeType.PUZZLE: return getIcon('PUZZLE', appMode); // Navigation challenge
        case NodeType.SOCIAL: return getIcon('SOCIAL', appMode); // Customer interaction
        case NodeType.REST: return getIcon('REST', appMode); // Break time
        case NodeType.SHOP: return getIcon('SHOP', appMode); // Pickup location
        case NodeType.STORY: return getIcon('STORY', appMode); // Special order
        case NodeType.BOSS: return getIcon('BOSS', appMode); // VIP delivery
        case NodeType.BLOCKED: return '🚫'; // Road closed
        default: return '❓';
      }
    } else {
      // Game mode icons (original)
      switch (type) {
        case NodeType.START: return '🏠';
        case NodeType.END: return '🚩';
        case NodeType.DELIVERY: return '📦';
        case NodeType.COMBAT: return '⚔️';
        case NodeType.PUZZLE: return '🧩';
        case NodeType.SOCIAL: return '💬';
        case NodeType.REST: return '🛡️';
        case NodeType.SHOP: return '🛒';
        case NodeType.STORY: return '📖';
        case NodeType.BOSS: return '👹';
        case NodeType.BLOCKED: return '🚫';
        default: return '❓';
      }
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'industrial': return 'from-gray-800 to-orange-900';
      case 'residential': return 'from-blue-900 to-purple-900';
      case 'corporate': return 'from-gray-900 to-cyan-900';
      case 'underground': return 'from-black to-red-900';
      case 'wasteland': return 'from-yellow-900 to-red-900';
      default: return 'from-gray-900 to-blue-900';
    }
  };

  if (!chapterMap) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Generating adventure map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NeuraButton
              variant="ghost"
              size="sm"
              onClick={() => setState(GameState.MISSION_BRIEFING)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Briefing
            </NeuraButton>
            {/* DEBUG: Force combat */}
            <NeuraButton
              variant="primary"
              size="sm"
              onClick={() => {
                console.log('DEBUG: Forcing combat state');
                setState(GameState.TACTICAL_COMBAT, {
                  encounterType: 'combat',
                  nodeData: {
                    id: 'debug_node',
                    type: 'combat',
                    title: 'Debug Combat',
                    description: 'Debug combat encounter'
                  }
                });
              }}
            >
              DEBUG: Force Combat
            </NeuraButton>
            <div>
              <h1 className="text-xl font-bold text-purple-400 font-mono">
                {appMode === 'delivery' ? 'DELIVERY ROUTE' : 'ADVENTURE MAP'}
              </h1>
              <p className="text-gray-400 text-sm">
                {chapterMap.title}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-cyan-400 font-mono flex items-center gap-2">
              <Map className="w-4 h-4" />
              Chapter {chapterMap.chapterNumber}
            </p>
            <p className="text-gray-400 text-sm capitalize">
              {chapterMap.theme} • {chapterMap.timeOfDay}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${getThemeColor(chapterMap.theme)} opacity-30`}></div>
          
          {/* Weather Effect */}
          {chapterMap.weatherEffect && chapterMap.weatherEffect !== 'clear' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute inset-0 opacity-20 ${
                chapterMap.weatherEffect === 'rain' ? 'bg-blue-500/10' :
                chapterMap.weatherEffect === 'fog' ? 'bg-gray-500/20' :
                chapterMap.weatherEffect === 'storm' ? 'bg-purple-500/15' :
                chapterMap.weatherEffect === 'toxic' ? 'bg-green-500/10' : ''
              }`}></div>
            </div>
          )}
          
          {/* Map Grid */}
          <div className="relative h-full p-8 overflow-auto">
            <div 
              className="relative mx-auto"
              style={{
                width: `${chapterMap.gridWidth * 80}px`,
                height: `${chapterMap.gridHeight * 80}px`
              }}
            >
              {/* Connections */}
              {Array.from(chapterMap.nodes.values()).map(node => (
                node.connections.map(connId => {
                  const connNode = chapterMap.nodes.get(connId);
                  if (!connNode || connNode.y >= node.y) return null; // Only draw upward connections
                  
                  const x1 = node.x * 80 + 40;
                  const y1 = (chapterMap.gridHeight - 1 - node.y) * 80 + 40;
                  const x2 = connNode.x * 80 + 40;
                  const y2 = (chapterMap.gridHeight - 1 - connNode.y) * 80 + 40;
                  
                  return (
                    <svg
                      key={`${node.id}-${connId}`}
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={node.status === NodeStatus.COMPLETED ? '#10b981' : '#6b7280'}
                        strokeWidth="2"
                        strokeDasharray={node.status === NodeStatus.COMPLETED ? '0' : '5,5'}
                        opacity={0.6}
                      />
                    </svg>
                  );
                })
              ))}
              
              {/* Nodes */}
              {Array.from(chapterMap.nodes.values()).map(node => (
                <motion.div
                  key={node.id}
                  className={`absolute w-16 h-16 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    getNodeColor(node)
                  } ${
                    node.status === NodeStatus.LOCKED ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'
                  } ${
                    hoveredNode === node.id ? 'ring-4 ring-yellow-400/50' : ''
                  }`}
                  style={{
                    left: `${node.x * 80}px`,
                    top: `${(chapterMap.gridHeight - 1 - node.y) * 80}px`
                  }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={{ scale: node.status !== NodeStatus.LOCKED ? 1.1 : 1 }}
                  whileTap={{ scale: node.status !== NodeStatus.LOCKED ? 0.95 : 1 }}
                >
                  <span className="text-2xl">{getNodeIcon(node.type)}</span>
                  
                  {/* Node tooltip */}
                  {hoveredNode === node.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3 min-w-48 z-10"
                    >
                      <h4 className="text-white font-medium mb-1">{node.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{node.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Difficulty: {node.difficulty}</span>
                        {node.rewards?.tips && (
                          <span>• {node.rewards.tips} Tips</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-l border-purple-500/30 p-4 space-y-4">
          {/* Squad Status */}
          <NeuraPanel variant="secondary">
            <div className="p-4">
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                ACTIVE SQUAD
              </h3>
              
              <div className="space-y-2">
                {activePartners.map(partner => (
                  <div key={partner.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {partner.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{partner.name}</p>
                      <p className="text-gray-400 text-xs">Level {partner.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-xs">Ready</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeuraPanel>

          {/* Selected Node Details */}
          {selectedNode && (
            <NeuraPanel variant="primary">
              <div className="p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  NODE DETAILS
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium">{selectedNode.title}</h4>
                    <p className="text-gray-300 text-sm">{selectedNode.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Type</p>
                      <p className="text-white capitalize">{selectedNode.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Difficulty</p>
                      <p className="text-orange-400">{selectedNode.difficulty}/5</p>
                    </div>
                  </div>
                  
                  {selectedNode.rewards && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">REWARDS</p>
                      <div className="space-y-1 text-sm">
                        {selectedNode.rewards.tips && (
                          <p className="text-yellow-400">💰 {selectedNode.rewards.tips} Tips</p>
                        )}
                        {selectedNode.rewards.experience && (
                          <p className="text-blue-400">⭐ {selectedNode.rewards.experience} XP</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.status === NodeStatus.AVAILABLE && (
                    <NeuraButton
                      variant="primary"
                      className="w-full mt-4"
                      onClick={() => handleNodeEnter(selectedNode)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Enter
                    </NeuraButton>
                  )}
                  
                  {selectedNode.status === NodeStatus.LOCKED && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm mt-4">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Complete previous nodes to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            </NeuraPanel>
          )}
          
          {/* Map Info */}
          <NeuraPanel variant="secondary">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-400 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                MAP STATUS
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weather</span>
                  <span className="text-white capitalize">{chapterMap.weatherEffect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white capitalize">{chapterMap.timeOfDay}</span>
                </div>
              </div>
            </div>
          </NeuraPanel>
        </div>
      </div>

      {/* Footer Status */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/30 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>MISSION STATUS: IN PROGRESS</span>
          <span className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            ESTIMATED: 25 MINUTES REMAINING
          </span>
        </div>
      </div>
    </div>
  );
}