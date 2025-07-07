
// Node types for the map
export enum NodeType {
  START = 'start',
  DELIVERY = 'delivery',
  COMBAT = 'combat',
  PUZZLE = 'puzzle',
  SOCIAL = 'social',
  REST = 'rest',
  SHOP = 'shop',
  STORY = 'story',
  BOSS = 'boss',
  END = 'end',
  BLOCKED = 'blocked',
  EMPTY = 'empty'
}

// Node status
export enum NodeStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  COMPLETED = 'completed',
  CURRENT = 'current'
}

// Map node interface
export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  status: NodeStatus;
  title?: string;
  description?: string;
  difficulty?: number;
  rewards?: {
    tips?: number;
    experience?: number;
    items?: string[];
    storyProgress?: number;
  };
  connections: string[]; // IDs of connected nodes
  requirements?: {
    level?: number;
    items?: string[];
    previousNodes?: string[];
  };
  encounterData?: any; // Specific data for the encounter type
}

// Chapter map interface
export interface ChapterMap {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  nodes: Map<string, MapNode>;
  startNodeId: string;
  endNodeId: string;
  currentNodeId?: string;
  theme: 'industrial' | 'residential' | 'corporate' | 'underground' | 'wasteland';
  weatherEffect?: 'rain' | 'fog' | 'storm' | 'clear' | 'toxic';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  backgroundImage?: string;
}

// Node rewards based on type and difficulty
const BASE_REWARDS = {
  [NodeType.DELIVERY]: { tips: 100, experience: 20 },
  [NodeType.COMBAT]: { tips: 150, experience: 40 },
  [NodeType.PUZZLE]: { tips: 120, experience: 30 },
  [NodeType.SOCIAL]: { tips: 80, experience: 25 },
  [NodeType.REST]: { tips: 0, experience: 10 },
  [NodeType.SHOP]: { tips: 0, experience: 0 },
  [NodeType.STORY]: { tips: 50, experience: 50 },
  [NodeType.BOSS]: { tips: 500, experience: 100 }
};

// Generate a random node based on position
function generateNode(x: number, y: number, type: NodeType, difficulty: number = 1): MapNode {
  const id = `node_${x}_${y}`;
  const baseReward = (BASE_REWARDS as any)[type] || { tips: 0, experience: 0 };
  
  return {
    id,
    x,
    y,
    type,
    status: NodeStatus.LOCKED,
    difficulty,
    rewards: {
      tips: Math.floor(baseReward.tips * (1 + difficulty * 0.2)),
      experience: Math.floor(baseReward.experience * (1 + difficulty * 0.1))
    },
    connections: [],
    title: generateNodeTitle(type),
    description: generateNodeDescription(type)
  };
}

// Generate node titles based on type
function generateNodeTitle(type: NodeType): string {
  const titles = {
    [NodeType.DELIVERY]: [
      'Express Delivery',
      'Priority Package',
      'Time-Sensitive Cargo',
      'Fragile Shipment',
      'Corporate Documents'
    ],
    [NodeType.COMBAT]: [
      'Rival Courier Ambush',
      'Corporate Security',
      'Drone Patrol',
      'Gang Territory',
      'System Glitch Attack'
    ],
    [NodeType.PUZZLE]: [
      'Route Optimization',
      'Security Bypass',
      'Package Sorting',
      'Traffic Analysis',
      'Data Decryption'
    ],
    [NodeType.SOCIAL]: [
      'Customer Negotiation',
      'Police Checkpoint',
      'Union Meeting',
      'Informant Contact',
      'Corporate Spy'
    ],
    [NodeType.REST]: [
      'Safe House',
      'Underground Clinic',
      'Resistance Hideout',
      'Courier Hub',
      'Abandoned Warehouse'
    ],
    [NodeType.SHOP]: [
      'Black Market',
      'Tech Vendor',
      'Equipment Cache',
      'Supply Drop',
      'Resistance Store'
    ],
    [NodeType.STORY]: [
      'Tanya\'s Message',
      'Corporate Leak',
      'Resistance Intel',
      'System Vulnerability',
      'Truth Revealed'
    ],
    [NodeType.BOSS]: [
      'District Manager',
      'Security Chief',
      'AI Overseer',
      'Corporate Executive',
      'WHIX Enforcer'
    ]
  };
  
  const typeTitles = (titles as any)[type] || ['Unknown Encounter'];
  return typeTitles[Math.floor(Math.random() * typeTitles.length)];
}

// Generate node descriptions
function generateNodeDescription(type: NodeType): string {
  const descriptions = {
    [NodeType.DELIVERY]: 'Complete a delivery mission in this area',
    [NodeType.COMBAT]: 'Fight your way through hostile forces',
    [NodeType.PUZZLE]: 'Solve a challenging logistics puzzle',
    [NodeType.SOCIAL]: 'Navigate a tense social encounter',
    [NodeType.REST]: 'Rest and recover your team',
    [NodeType.SHOP]: 'Purchase equipment and supplies',
    [NodeType.STORY]: 'Uncover more of the truth about WHIX',
    [NodeType.BOSS]: 'Face a powerful enemy in this climactic battle'
  };
  
  return (descriptions as any)[type] || 'Explore this location';
}

// Generate a chapter map
export function generateChapterMap(
  chapterNumber: number,
  width: number = 15,
  height: number = 20,
  difficulty: number = 1
): ChapterMap {
  const nodes = new Map<string, MapNode>();
  const _gridSize = width * height;
  
  console.log(`🗺️ Generating chapter ${chapterNumber} map: ${width}x${height}`);
  
  // Create start node at bottom
  const startNode = generateNode(Math.floor(width / 2), height - 1, NodeType.START, 0);
  startNode.status = NodeStatus.CURRENT;
  startNode.title = 'District Entry';
  startNode.description = 'Begin your journey through Polanco';
  nodes.set(startNode.id, startNode);
  
  // Create end node at top (getting closer to Tanya)
  const endNode = generateNode(Math.floor(width / 2), 0, NodeType.END, difficulty + 2);
  endNode.title = 'District Exit - Closer to Tanya';
  endNode.description = 'Continue your search for the truth';
  nodes.set(endNode.id, endNode);
  
  // Generate main paths (multiple routes)
  const numPaths = 3 + Math.floor(difficulty / 2);
  const pathNodes: MapNode[][] = [];
  
  for (let pathIndex = 0; pathIndex < numPaths; pathIndex++) {
    const path: MapNode[] = [];
    let currentX = startNode.x + (pathIndex - Math.floor(numPaths / 2)) * 2;
    let currentY = startNode.y - 1;
    
    // Create path from start to end with branching
    while (currentY > endNode.y) {
      // Clamp X to grid bounds
      currentX = Math.max(1, Math.min(width - 2, currentX));
      
      // Determine node type based on position and randomness
      let nodeType: NodeType;
      const rand = Math.random();
      
      if (currentY === Math.floor(height / 2)) {
        // Mid-boss or story node
        nodeType = rand > 0.5 ? NodeType.BOSS : NodeType.STORY;
      } else if (rand < 0.3) {
        nodeType = NodeType.DELIVERY;
      } else if (rand < 0.5) {
        nodeType = NodeType.COMBAT;
      } else if (rand < 0.65) {
        nodeType = NodeType.PUZZLE;
      } else if (rand < 0.8) {
        nodeType = NodeType.SOCIAL;
      } else if (rand < 0.9) {
        nodeType = NodeType.SHOP;
      } else {
        nodeType = NodeType.REST;
      }
      
      const node = generateNode(currentX, currentY, nodeType, difficulty);
      nodes.set(node.id, node);
      path.push(node);
      
      // Move up and potentially sideways
      currentY--;
      if (Math.random() > 0.5) {
        currentX += Math.random() > 0.5 ? 1 : -1;
      }
      
      // Add branching
      if (Math.random() > 0.7 && currentY > endNode.y + 2) {
        const branchX = currentX + (Math.random() > 0.5 ? 2 : -2);
        if (branchX >= 1 && branchX < width - 1) {
          const branchNode = generateNode(branchX, currentY, NodeType.DELIVERY, difficulty);
          nodes.set(branchNode.id, branchNode);
          path.push(branchNode);
        }
      }
    }
    
    pathNodes.push(path);
  }
  
  // Connect nodes
  // Connect start node to first nodes of each path
  pathNodes.forEach(path => {
    if (path.length > 0) {
      startNode.connections.push(path[0].id);
      path[0].connections.push(startNode.id);
    }
  });
  
  // Connect nodes within paths
  pathNodes.forEach(path => {
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      // Connect vertically
      if (Math.abs(current.y - next.y) <= 1) {
        current.connections.push(next.id);
        next.connections.push(current.id);
      }
    }
  });
  
  // Add cross-connections between paths
  for (let y = 1; y < height - 1; y++) {
    const nodesAtY = Array.from(nodes.values()).filter(n => n.y === y);
    for (let i = 0; i < nodesAtY.length - 1; i++) {
      if (Math.abs(nodesAtY[i].x - nodesAtY[i + 1].x) <= 2 && Math.random() > 0.6) {
        nodesAtY[i].connections.push(nodesAtY[i + 1].id);
        nodesAtY[i + 1].connections.push(nodesAtY[i].id);
      }
    }
  }
  
  // Connect paths to end node
  const topNodes = Array.from(nodes.values()).filter(n => n.y === 1);
  topNodes.forEach(node => {
    node.connections.push(endNode.id);
    endNode.connections.push(node.id);
  });
  
  // Remove duplicate connections
  nodes.forEach(node => {
    node.connections = [...new Set(node.connections)];
  });
  
  // Add some blocked/empty nodes for visual variety
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const id = `node_${x}_${y}`;
      if (!nodes.has(id) && Math.random() > 0.8) {
        const emptyNode = generateNode(x, y, NodeType.EMPTY, 0);
        emptyNode.status = NodeStatus.LOCKED;
        nodes.set(id, emptyNode);
      }
    }
  }
  
  console.log(`🗺️ Generated map with ${nodes.size} nodes`);
  console.log('🗺️ Node types:', Array.from(nodes.values()).map(n => `${n.id}:${n.type}`));
  
  return {
    id: `chapter_${chapterNumber}`,
    chapterNumber,
    title: `Chapter ${chapterNumber}: ${getChapterTitle(chapterNumber)}`,
    description: getChapterDescription(chapterNumber),
    gridWidth: width,
    gridHeight: height,
    nodes,
    startNodeId: startNode.id,
    endNodeId: endNode.id,
    currentNodeId: startNode.id,
    theme: getChapterTheme(chapterNumber),
    weatherEffect: getChapterWeather(chapterNumber),
    timeOfDay: getChapterTime(chapterNumber)
  };
}

// Get chapter-specific titles
function getChapterTitle(chapter: number): string {
  const titles = [
    'Welcome to Polanco',
    'The Resistance Grows',
    'Corporate Escalation',
    'Underground Networks',
    'The Truth Emerges',
    'Breaking the System',
    'Finding Tanya',
    'The Final Delivery'
  ];
  return titles[chapter - 1] || `District ${chapter}`;
}

// Get chapter descriptions
function getChapterDescription(chapter: number): string {
  const descriptions = [
    'Begin your journey as a WHIX courier in the dystopian streets of Polanco',
    'The resistance needs your help to undermine WHIX control',
    'Corporate security tightens as your actions draw attention',
    'Navigate the dangerous underground to find allies',
    'Uncover the dark truth behind WHIX\'s algorithmic control',
    'Rally your team for a coordinated strike against the system',
    'Follow the clues that lead to your missing friend Tanya',
    'Face the ultimate challenge to free Polanco from corporate tyranny'
  ];
  return descriptions[chapter - 1] || 'Continue your journey through the district';
}

// Get chapter themes
function getChapterTheme(chapter: number): ChapterMap['theme'] {
  const themes: ChapterMap['theme'][] = [
    'residential',
    'industrial',
    'corporate',
    'underground',
    'corporate',
    'wasteland',
    'industrial',
    'corporate'
  ];
  return themes[chapter - 1] || 'industrial';
}

// Get chapter weather
function getChapterWeather(chapter: number): ChapterMap['weatherEffect'] {
  const weather: ChapterMap['weatherEffect'][] = [
    'rain',
    'fog',
    'clear',
    'toxic',
    'storm',
    'fog',
    'rain',
    'storm'
  ];
  return weather[chapter - 1] || 'clear';
}

// Get chapter time
function getChapterTime(chapter: number): ChapterMap['timeOfDay'] {
  const times: ChapterMap['timeOfDay'][] = [
    'morning',
    'afternoon',
    'evening',
    'night',
    'night',
    'morning',
    'evening',
    'night'
  ];
  return times[chapter - 1] || 'afternoon';
}

// Update node status
export function updateNodeStatus(map: ChapterMap, nodeId: string, status: NodeStatus): ChapterMap {
  const node = getNode(map.nodes, nodeId);
  if (node) {
    node.status = status;
    
    // Update connected nodes to available if this node is completed
    if (status === NodeStatus.COMPLETED) {
      node.connections.forEach(connId => {
        const connNode = getNode(map.nodes, connId);
        if (connNode && connNode.status === NodeStatus.LOCKED) {
          connNode.status = NodeStatus.AVAILABLE;
        }
      });
    }
  }
  return map;
}

// Move to a new node
export function moveToNode(map: ChapterMap, nodeId: string): ChapterMap {
  const node = getNode(map.nodes, nodeId);
  const currentNode = map.currentNodeId ? getNode(map.nodes, map.currentNodeId) : null;
  
  if (node && node.status === NodeStatus.AVAILABLE) {
    // Update current node
    if (currentNode) {
      currentNode.status = NodeStatus.COMPLETED;
    }
    
    // Set new current node
    node.status = NodeStatus.CURRENT;
    map.currentNodeId = nodeId;
    
    // Update connected nodes
    node.connections.forEach(connId => {
      const connNode = getNode(map.nodes, connId);
      if (connNode && connNode.status === NodeStatus.LOCKED) {
        connNode.status = NodeStatus.AVAILABLE;
      }
    });
  }
  
  return map;
}

// Check if player can reach the end
export function canReachEnd(map: ChapterMap): boolean {
  const endNode = getNode(map.nodes, map.endNodeId);
  return endNode ? endNode.status === NodeStatus.AVAILABLE : false;
}

// Helper function to get node from map (handles both Map and object)
function getNode(nodes: Map<string, MapNode> | Record<string, MapNode>, nodeId: string): MapNode | undefined {
  return nodes instanceof Map ? nodes.get(nodeId) : nodes[nodeId];
}

// Helper function to get all node values (handles both Map and object)
function getNodeValues(nodes: Map<string, MapNode> | Record<string, MapNode>): MapNode[] {
  return nodes instanceof Map ? Array.from(nodes.values()) : Object.values(nodes);
}

// Get current progress percentage
export function getMapProgress(map: ChapterMap): number {
  const nodeValues = getNodeValues(map.nodes);
    
  const totalNodes = nodeValues.filter(n => 
    n.type !== NodeType.EMPTY && n.type !== NodeType.BLOCKED
  ).length;
  
  const completedNodes = nodeValues.filter(n => 
    n.status === NodeStatus.COMPLETED
  ).length;
  
  return Math.round((completedNodes / totalNodes) * 100);
}