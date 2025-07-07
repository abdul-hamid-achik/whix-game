'use client';

import { useEffect } from 'react';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { keyboardNavigationSystem } from '@/lib/systems/keyboard-navigation-system';

export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const { announce } = useKeyboardNavigation({
    enabled: true,
    gameStateSync: true,
  });

  useEffect(() => {
    // Initialize keyboard navigation system
    keyboardNavigationSystem.setEnabled(true);
    
    // Announce to screen readers that the page is ready
    announce('WHIX game loaded. Press Shift + Forward Slash for keyboard shortcuts.');
    
    return () => {
      keyboardNavigationSystem.setEnabled(false);
    };
  }, [announce]);

  return <>{children}</>;
}