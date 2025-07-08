'use client';

import { motion } from 'framer-motion';
import { 
  Navigation, 
  Building, 
  AlertTriangle, 
  Shield, 
  Users, 
  Package,
  Zap,
  Eye,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryPosition, DeliveryUnit, GridCell, GridCellType } from '@/lib/game/delivery-grid';
import { cn } from '@/lib/utils';

interface DeliveryGridViewProps {
  gridSize: number;
  cells: Map<string, GridCell>;
  units: DeliveryUnit[];
  selectedUnit?: DeliveryUnit | null;
  validMoves: DeliveryPosition[];
  onCellClick: (position: DeliveryPosition) => void;
  onUnitSelect: (unitId: string) => void;
  className?: string;
}

// Cell type to icon mapping
const CELL_ICONS: Record<GridCellType, any> = {
  'street': Navigation,
  'building': Building,
  'traffic': AlertTriangle,
  'construction': AlertTriangle,
  'security': Shield,
  'protest': Users,
  'pickup': Package,
  'shortcut': Zap,
  'surveillance': Eye,
  'underground': MapPin,
};

// Cell type to color mapping
const CELL_COLORS: Record<GridCellType, string> = {
  'street': 'bg-slate-600/20 hover:bg-slate-500/30',
  'building': 'bg-blue-600/30 hover:bg-blue-500/40',
  'traffic': 'bg-orange-500/30 hover:bg-orange-400/40',
  'construction': 'bg-red-500/30 hover:bg-red-400/40',
  'security': 'bg-yellow-500/30 hover:bg-yellow-400/40',
  'protest': 'bg-purple-500/30 hover:bg-purple-400/40',
  'pickup': 'bg-green-500/30 hover:bg-green-400/40',
  'shortcut': 'bg-cyan-500/30 hover:bg-cyan-400/40',
  'surveillance': 'bg-pink-500/30 hover:bg-pink-400/40',
  'underground': 'bg-gray-700/30 hover:bg-gray-600/40',
};

export function DeliveryGridView({
  gridSize,
  cells,
  units,
  selectedUnit,
  validMoves,
  onCellClick,
  onUnitSelect,
  className,
}: DeliveryGridViewProps) {
  
  const getCellAt = (x: number, y: number): GridCell | null => {
    return cells.get(`${x},${y}`) || null;
  };
  
  const getUnitAt = (x: number, y: number): DeliveryUnit | null => {
    return units.find(unit => unit.position.x === x && unit.position.y === y) || null;
  };
  
  const isValidMove = (x: number, y: number): boolean => {
    return validMoves.some(move => move.x === x && move.y === y);
  };
  
  const renderCell = (x: number, y: number) => {
    const cell = getCellAt(x, y);
    const unit = getUnitAt(x, y);
    const isValid = isValidMove(x, y);
    const isSelected = selectedUnit && selectedUnit.position.x === x && selectedUnit.position.y === y;
    
    const cellType = cell?.type || 'street';
    const Icon = CELL_ICONS[cellType];
    const baseColor = CELL_COLORS[cellType];
    
    return (
      <motion.div
        key={`${x}-${y}`}
        className={cn(
          'relative aspect-square border border-border/50 cursor-pointer transition-all duration-200',
          baseColor,
          isValid && 'ring-2 ring-green-500 ring-opacity-50',
          isSelected && 'ring-2 ring-blue-500',
          cell?.blocksMovement && 'opacity-50'
        )}
        onClick={() => onCellClick({ x, y })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Cell background icon */}
        {cell && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Icon className="w-4 h-4" />
          </div>
        )}
        
        {/* Movement cost indicator */}
        {cell && cell.movementCost > 1 && (
          <div className="absolute top-0.5 right-0.5 text-xs bg-black/50 text-white rounded px-1">
            {cell.movementCost}
          </div>
        )}
        
        {/* Encounter chance indicator */}
        {cell && cell.encounterChance > 0.3 && (
          <div className="absolute top-0.5 left-0.5 text-xs">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
          </div>
        )}
        
        {/* Valid move indicator */}
        {isValid && (
          <motion.div
            className="absolute inset-0 bg-green-500/20 border-2 border-green-500/50 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Unit visualization */}
        {unit && (
          <motion.div
            className={cn(
              'absolute inset-1 rounded-full flex items-center justify-center text-white font-bold text-xs',
              unit.id === selectedUnit?.id ? 'bg-blue-600' : 'bg-green-600',
              'cursor-pointer'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onUnitSelect(unit.id);
            }}
            whileHover={{ scale: 1.1 }}
            layoutId={`unit-${unit.id}`}
          >
            {unit.partnerId.substring(0, 2).toUpperCase()}
          </motion.div>
        )}
        
        {/* Package destination indicator */}
        {units.some(u => u.package.destination.x === x && u.package.destination.y === y) && (
          <div className="absolute bottom-0.5 right-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          </div>
        )}
      </motion.div>
    );
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Grid */}
      <div 
        className="grid border border-border/50 bg-background/50 rounded-lg p-2"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1',
        }}
      >
        {Array.from({ length: gridSize }, (_, y) =>
          Array.from({ length: gridSize }, (_, x) => renderCell(x, y))
        )}
      </div>
      
      {/* Unit info panel */}
      {selectedUnit && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Active Delivery</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {selectedUnit.package.timeRemaining}min
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Partner</div>
                  <div className="font-medium">{selectedUnit.partnerId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Package Type</div>
                  <div className="font-medium capitalize">{selectedUnit.package.type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current Position</div>
                  <div className="font-medium">
                    ({selectedUnit.position.x}, {selectedUnit.position.y})
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Destination</div>
                  <div className="font-medium">
                    ({selectedUnit.package.destination.x}, {selectedUnit.package.destination.y})
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Action Points: </span>
                  <span className="font-medium">{selectedUnit.actionPoints}/3</span>
                </div>
                {selectedUnit.hasActed && (
                  <div className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-1 rounded">
                    Turn Complete
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Grid Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {Object.entries(CELL_ICONS).map(([type, Icon]) => (
              <div key={type} className="flex items-center gap-1">
                <div className={cn('w-4 h-4 rounded flex items-center justify-center', CELL_COLORS[type as GridCellType])}>
                  <Icon className="w-2 h-2" />
                </div>
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}