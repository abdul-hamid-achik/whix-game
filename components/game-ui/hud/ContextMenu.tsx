'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  MessageCircle, 
  Package, 
  Wrench, 
  Info,
  MapPin,
  Users
} from 'lucide-react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  disabled?: boolean;
  dangerous?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Adjust position to keep menu on screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const newX = x + rect.width > window.innerWidth ? x - rect.width : x;
      const newY = y + rect.height > window.innerHeight ? y - rect.height : y;
      setPosition({ x: newX, y: newY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[100] bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-2xl py-2 min-w-48"
        style={{ left: position.x, top: position.y }}
      >
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-4 py-2 flex items-center gap-3 text-sm transition-colors
              ${item.disabled 
                ? 'text-gray-500 cursor-not-allowed' 
                : item.dangerous
                  ? 'text-red-400 hover:bg-red-500/20'
                  : 'text-gray-300 hover:bg-purple-500/20 hover:text-white'
              }
            `}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for using context menus
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const openContextMenu = (event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu
  };
}

// Example context menu configurations
export const partnerContextMenu = (partnerId: string): ContextMenuItem[] => [
  {
    id: 'inspect',
    label: 'Inspect Partner',
    icon: Eye,
    action: () => console.log('Inspect partner:', partnerId)
  },
  {
    id: 'talk',
    label: 'Talk',
    icon: MessageCircle,
    action: () => console.log('Talk to partner:', partnerId)
  },
  {
    id: 'equip',
    label: 'Manage Equipment',
    icon: Package,
    action: () => console.log('Manage equipment for:', partnerId)
  },
  {
    id: 'repair',
    label: 'Neural Calibration',
    icon: Wrench,
    action: () => console.log('Calibrate partner:', partnerId)
  }
];

export const mapNodeContextMenu = (nodeId: string): ContextMenuItem[] => [
  {
    id: 'info',
    label: 'Node Details',
    icon: Info,
    action: () => console.log('Show node info:', nodeId)
  },
  {
    id: 'scout',
    label: 'Scout Area',
    icon: Eye,
    action: () => console.log('Scout node:', nodeId)
  },
  {
    id: 'navigate',
    label: 'Set Waypoint',
    icon: MapPin,
    action: () => console.log('Navigate to node:', nodeId)
  }
];

export const enemyContextMenu = (enemyId: string): ContextMenuItem[] => [
  {
    id: 'analyze',
    label: 'Analyze Target',
    icon: Eye,
    action: () => console.log('Analyze enemy:', enemyId)
  },
  {
    id: 'focus',
    label: 'Focus Fire',
    icon: Users,
    action: () => console.log('Focus on enemy:', enemyId)
  }
];