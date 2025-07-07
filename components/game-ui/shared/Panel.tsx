'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils';

interface PanelProps {
  id: string;
  children?: ReactNode;
  visible: boolean;
  position: 'left' | 'right' | 'center' | 'overlay' | 'fullscreen';
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  zIndex?: number;
  title?: string;
  closable?: boolean;
}

export function Panel({ 
  id, 
  children, 
  visible, 
  position, 
  size, 
  zIndex = 40,
  title,
  closable = true 
}: PanelProps) {
  const { hidePanel } = useUIStore();

  if (!visible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full';
      case 'right':
        return 'right-0 top-0 h-full';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'overlay':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'fullscreen':
        return 'inset-0';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getSizeClasses = () => {
    if (position === 'fullscreen') return 'w-full h-full';
    
    switch (size) {
      case 'small':
        return 'w-80 max-h-96';
      case 'medium':
        return 'w-96 max-h-[70vh]';
      case 'large':
        return 'w-[800px] max-w-[90vw] max-h-[90vh]';
      case 'fullscreen':
        return 'w-full h-full';
      default:
        return 'w-96 max-h-[70vh]';
    }
  };

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    };

    switch (position) {
      case 'left':
        return {
          hidden: { opacity: 0, x: -300 },
          visible: { opacity: 1, x: 0 }
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: 300 },
          visible: { opacity: 1, x: 0 }
        };
      case 'overlay':
      case 'center':
        return {
          hidden: { opacity: 0, scale: 0.9, y: 20 },
          visible: { opacity: 1, scale: 1, y: 0 }
        };
      case 'fullscreen':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      default:
        return baseVariants;
    }
  };

  return (
    <>
      {/* Backdrop for overlay panels */}
      {(position === 'overlay' || position === 'center') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ zIndex: zIndex - 1 }}
          onClick={() => closable && hidePanel(id)}
        />
      )}

      {/* Panel content */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={getAnimationVariants()}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          'fixed bg-gray-900/95 backdrop-blur-md border border-cyan-500/30 shadow-2xl',
          position === 'fullscreen' ? 'rounded-none' : 'rounded-lg',
          getPositionClasses(),
          getSizeClasses()
        )}
        style={{ zIndex }}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
            {title && (
              <h2 className="text-lg font-mono font-semibold text-cyan-400">
                {title}
              </h2>
            )}
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hidePanel(id)}
                className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'overflow-auto',
          (title || closable) ? 'h-[calc(100%-60px)]' : 'h-full'
        )}>
          {children || (
            <div className="p-6 text-center text-gray-400">
              <p>Panel content for "{id}"</p>
              <p className="text-sm mt-2">This panel is a placeholder.</p>
            </div>
          )}
        </div>

        {/* Cyberpunk glow effects */}
        <div className="absolute inset-0 rounded-lg pointer-events-none">
          <div className="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
          <div 
            className="absolute inset-0 opacity-10 rounded-lg"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.3) 2px, rgba(0, 255, 255, 0.3) 4px)',
            }}
          />
        </div>
      </motion.div>
    </>
  );
}