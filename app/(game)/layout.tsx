import { GameNavigation, MobileGameNavigation } from '@/components/game/GameNavigation';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <GameNavigation />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 mb-16 md:mb-0 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileGameNavigation />
    </div>
  );
}