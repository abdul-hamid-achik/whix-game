import { GameLayout } from '@/components/game-ui/layouts/GameLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameLayout>
      {children}
    </GameLayout>
  );
}