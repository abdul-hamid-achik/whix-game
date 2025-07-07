'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  Package, 
  Users, 
  BookOpen, 
  ShoppingBag,
  Sparkles,
  Settings,
  LogOut,
  Map,
  Shield,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/stores/gameStore';
import { PixelArtIcon } from '@/components/pixel-art/PixelArtIcon';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  pixelIcon: string;
  color: string;
  badge?: string;
  pulse?: boolean;
}

const regularNavItems: NavItem[] = [
  {
    href: '/hub',
    label: 'Courier Hub',
    icon: Home,
    pixelIcon: 'home',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    href: '/missions',
    label: 'Missions',
    icon: Package,
    pixelIcon: 'package',
    color: 'from-green-400 to-emerald-500',
  },
  {
    href: '/partners',
    label: 'Partners',
    icon: Users,
    pixelIcon: 'users',
    color: 'from-purple-400 to-pink-500',
  },
  {
    href: '/recruit',
    label: 'Recruit',
    icon: Sparkles,
    pixelIcon: 'star',
    color: 'from-yellow-400 to-orange-500',
    pulse: true,
  },
  {
    href: '/story',
    label: 'Story',
    icon: BookOpen,
    pixelIcon: 'book',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    href: '/story/map',
    label: 'Map',
    icon: Map,
    pixelIcon: 'map',
    color: 'from-emerald-400 to-teal-500',
    badge: 'NEW',
  },
  {
    href: '/shop',
    label: 'Shop',
    icon: ShoppingBag,
    pixelIcon: 'coin',
    color: 'from-yellow-400 to-amber-500',
    badge: 'NEW',
  },
];

const adminNavItems: NavItem[] = [
  {
    href: '/admin/content',
    label: 'Content',
    icon: Settings,
    pixelIcon: 'book',
    color: 'from-gray-400 to-gray-600',
  },
  {
    href: '/admin/character-generator',
    label: 'Characters',
    icon: Users,
    pixelIcon: 'users',
    color: 'from-purple-400 to-pink-500',
  },
  {
    href: '/admin/map-generator',
    label: 'Maps',
    icon: Map,
    pixelIcon: 'map',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Shield,
    pixelIcon: 'shield',
    color: 'from-red-400 to-rose-500',
  },
];

export function GameNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { currentTips, level, playerName } = useGameStore();
  
  // Check if user is admin or guest
  const isAdmin = session?.user?.role === 'admin';
  const _isGuest = !!session?.user?.guestId;
  
  // Combine nav items based on role
  const navItems = [...regularNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <Link href="/hub" className="block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <PixelArtIcon name="logo" size={32} className="text-primary" />
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  WHIX
                </h2>
                <p className="text-xs text-muted-foreground">Gig Economy Dystopia</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Player Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{playerName}</span>
            <span className="text-xs text-muted-foreground">Lv.{level}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PixelArtIcon name="coin" size={16} className="text-yellow-500" />
            <span className="font-mono">{currentTips.toLocaleString()}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3 relative',
                        isActive && 'bg-secondary/80'
                      )}
                    >
                      {/* Pixel Icon with color gradient */}
                      <div className={cn(
                        'w-8 h-8 rounded flex items-center justify-center',
                        `bg-gradient-to-br ${item.color}`
                      )}>
                        <PixelArtIcon 
                          name={item.pixelIcon} 
                          size={20} 
                          className="text-white"
                        />
                      </div>
                      
                      <span className="flex-1 text-left">{item.label}</span>
                      
                      {item.badge && (
                        <span className="absolute right-2 top-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                          {item.badge}
                        </span>
                      )}
                      
                      {item.pulse && (
                        <motion.div
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive">
            <LogOut className="w-4 h-4" />
            Exit Game
          </Button>
        </div>
      </div>
    </nav>
  );
}

// Mobile Navigation
export function MobileGameNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Check if user is admin or guest
  const isAdmin = session?.user?.role === 'admin';
  const _isGuest = !!session?.user?.guestId;
  
  // Combine nav items based on role
  const navItems = [...regularNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 md:hidden">
      <div className="flex justify-around items-center p-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg',
                  isActive && 'bg-secondary/50'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded flex items-center justify-center',
                  isActive ? `bg-gradient-to-br ${item.color}` : 'bg-secondary'
                )}>
                  <PixelArtIcon 
                    name={item.pixelIcon} 
                    size={20} 
                    className={isActive ? 'text-white' : 'text-muted-foreground'}
                  />
                </div>
                <span className={cn(
                  'text-xs',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}