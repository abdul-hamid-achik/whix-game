import { GameLayout } from '@/components/game-ui/layouts/GameLayout';
import { KeyboardNavigationProvider } from '@/components/providers/KeyboardNavigationProvider';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeyboardNavigationProvider>
      <GameLayout>
        {children}
      </GameLayout>
    </KeyboardNavigationProvider>
  );
}