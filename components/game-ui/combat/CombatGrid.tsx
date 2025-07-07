'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { NeuraPanel } from '@/components/neura';
import { Shield, Zap, Swords } from 'lucide-react';

interface GridPosition {
  x: number;
  y: number;
}

interface Unit {
  id: string;
  name: string;
  type: 'partner' | 'enemy';
  position: GridPosition;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  armor: number;
  sprite?: string;
  status?: string[];
}

interface Tile {
  position: GridPosition;
  type: 'normal' | 'cover' | 'hazard' | 'objective';
  elevation: number;
  passable: boolean;
}

interface CombatGridProps {
  gridWidth?: number;
  gridHeight?: number;
  units: Unit[];
  tiles?: Tile[];
  activeUnitId?: string;
  selectedPosition?: GridPosition;
  highlightedPositions?: GridPosition[];
  onTileClick?: (position: GridPosition) => void;
  onUnitClick?: (unit: Unit) => void;
  showGrid?: boolean;
  isAnimating?: boolean;
}

export function CombatGrid({
  gridWidth = 8,
  gridHeight = 6,
  units,
  tiles = [],
  activeUnitId,
  selectedPosition,
  highlightedPositions = [],
  onTileClick,
  onUnitClick,
  showGrid = true,
  isAnimating = false
}: CombatGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPosition, setHoveredPosition] = useState<GridPosition | null>(null);
  const [tileSize, setTileSize] = useState(64);

  // Calculate tile size based on container
  useEffect(() => {
    const updateTileSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        const maxWidth = parent.clientWidth;
        const maxHeight = parent.clientHeight;
        
        const tileWidth = Math.floor(maxWidth / gridWidth);
        const tileHeight = Math.floor(maxHeight / gridHeight);
        
        setTileSize(Math.min(tileWidth, tileHeight, 80));
      }
    };

    updateTileSize();
    window.addEventListener('resize', updateTileSize);
    return () => window.removeEventListener('resize', updateTileSize);
  }, [gridWidth, gridHeight]);

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'; // purple-500/20
      ctx.lineWidth = 1;

      for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, gridHeight * tileSize);
        ctx.stroke();
      }

      for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(gridWidth * tileSize, y * tileSize);
        ctx.stroke();
      }
    }

    // Draw tiles
    tiles.forEach(tile => {
      const x = tile.position.x * tileSize;
      const y = tile.position.y * tileSize;

      switch (tile.type) {
        case 'cover':
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // blue-500/20
          break;
        case 'hazard':
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // red-500/20
          break;
        case 'objective':
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // amber-400/20
          break;
        default:
          ctx.fillStyle = 'transparent';
      }

      ctx.fillRect(x, y, tileSize, tileSize);

      // Draw elevation
      if (tile.elevation > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
    });

    // Draw highlighted positions
    highlightedPositions.forEach(pos => {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'; // green-500/30
      ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);
    });

    // Draw selected position
    if (selectedPosition) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)'; // amber-400/80
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selectedPosition.x * tileSize + 2,
        selectedPosition.y * tileSize + 2,
        tileSize - 4,
        tileSize - 4
      );
    }

    // Draw hovered position
    if (hoveredPosition) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        hoveredPosition.x * tileSize,
        hoveredPosition.y * tileSize,
        tileSize,
        tileSize
      );
      ctx.setLineDash([]);
    }
  }, [gridWidth, gridHeight, tileSize, tiles, showGrid, selectedPosition, hoveredPosition, highlightedPositions]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      const position = { x, y };
      
      // Check if clicking on a unit
      const clickedUnit = units.find(u => u.position.x === x && u.position.y === y);
      if (clickedUnit && onUnitClick) {
        onUnitClick(clickedUnit);
      } else if (onTileClick) {
        onTileClick(position);
      }
    }
  };

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      setHoveredPosition({ x, y });
    } else {
      setHoveredPosition(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={gridWidth * tileSize}
        height={gridHeight * tileSize}
        className="cursor-pointer"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasHover}
        onMouseLeave={() => setHoveredPosition(null)}
      />

      {/* Units */}
      <AnimatePresence>
        {units.map(unit => {
          const isActive = unit.id === activeUnitId;
          const x = unit.position.x * tileSize;
          const y = unit.position.y * tileSize;

          return (
            <motion.div
              key={unit.id}
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                x,
                y
              }}
              exit={{ scale: 0 }}
              transition={{
                type: isAnimating ? 'spring' : 'tween',
                duration: isAnimating ? 0.5 : 0
              }}
              className="absolute cursor-pointer"
              style={{
                width: tileSize - 8,
                height: tileSize - 8,
                margin: 4
              }}
              onClick={() => onUnitClick?.(unit)}
            >
              <div className={`
                relative w-full h-full rounded-lg border-2 flex items-center justify-center
                ${unit.type === 'partner' 
                  ? 'bg-blue-900/80 border-blue-500' 
                  : 'bg-red-900/80 border-red-500'
                }
                ${isActive ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent' : ''}
              `}>
                {/* Unit Icon */}
                {unit.type === 'partner' ? (
                  <Shield className="w-6 h-6 text-blue-300" />
                ) : (
                  <Swords className="w-6 h-6 text-red-300" />
                )}

                {/* Health Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b">
                  <div 
                    className={`h-full rounded-b transition-all ${
                      unit.type === 'partner' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                  />
                </div>

                {/* Status Icons */}
                {unit.status && unit.status.length > 0 && (
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    {unit.status.includes('stunned') && (
                      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {unit.status.includes('shielded') && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Hover Info */}
      {hoveredPosition && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <NeuraPanel variant="secondary" className="px-3 py-2">
            <p className="text-xs text-gray-400">
              Position: ({hoveredPosition.x}, {hoveredPosition.y})
            </p>
          </NeuraPanel>
        </div>
      )}
    </div>
  );
}