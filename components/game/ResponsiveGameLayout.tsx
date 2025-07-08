'use client';

import React, { ReactNode } from 'react';
import { useDeviceInfo } from '@/lib/hooks/useMediaQuery';
import { GameState, useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ResponsiveGameLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
}

export function ResponsiveGameLayout({ 
  children, 
  sidebar, 
  header 
}: ResponsiveGameLayoutProps) {
  const { isMobile, isTablet } = useDeviceInfo();
  const { currentState } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Don't show sidebar during gameplay states
  const shouldShowSidebar = ![
    GameState.TACTICAL_COMBAT,
    GameState.EVENT_RESOLUTION,
    GameState.MISSION_BRIEFING,
  ].includes(currentState);

  // Mobile layout (single column, collapsible menu)
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden">
        {/* Mobile Header */}
        {header && (
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/95 backdrop-blur">
            {shouldShowSidebar && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  {sidebar}
                </SheetContent>
              </Sheet>
            )}
            <div className="flex-1">{header}</div>
          </div>
        )}
        
        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  // Tablet layout (collapsible sidebar)
  if (isTablet) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        {/* Tablet Sidebar */}
        {shouldShowSidebar && sidebar && (
          <div className={cn(
            "w-64 border-r border-border/50 bg-background/95 backdrop-blur transition-all duration-300",
            "hidden sm:block"
          )}>
            {sidebar}
          </div>
        )}

        {/* Tablet Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {header && (
            <div className="border-b border-border/50 bg-background/95 backdrop-blur">
              {header}
            </div>
          )}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (full interface)
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      {shouldShowSidebar && sidebar && (
        <div className="w-80 border-r border-border/50 bg-background/95 backdrop-blur">
          {sidebar}
        </div>
      )}

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {header && (
          <div className="border-b border-border/50 bg-background/95 backdrop-blur">
            {header}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized game container
export function ResponsiveGameContainer({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  const { isMobile, isTablet } = useDeviceInfo();

  return (
    <div className={cn(
      "w-full h-full",
      // Mobile: Full width, less padding
      isMobile && "px-2 py-2",
      // Tablet: Medium padding
      isTablet && "px-4 py-4",
      // Desktop: Full padding
      !isMobile && !isTablet && "px-6 py-6",
      className
    )}>
      {children}
    </div>
  );
}

// Touch-optimized button wrapper
export function TouchButton({ 
  children, 
  className, 
  ...props 
}: React.ComponentProps<typeof Button>) {
  const { isTouch } = useDeviceInfo();

  return (
    <Button
      className={cn(
        // Larger touch targets on touch devices
        isTouch && "min-h-[44px] min-w-[44px]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Responsive grid component
export function ResponsiveGrid({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "grid gap-4",
      // Mobile: 1 column
      "grid-cols-1",
      // Tablet: 2 columns
      "sm:grid-cols-2",
      // Desktop: 3-4 columns
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

// Responsive card size wrapper
export function ResponsiveCard({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  const { isMobile } = useDeviceInfo();

  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      // Mobile: Smaller padding and text
      isMobile ? "p-3 text-sm" : "p-6",
      className
    )}>
      {children}
    </div>
  );
}