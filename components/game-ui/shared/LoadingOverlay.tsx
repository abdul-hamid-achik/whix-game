'use client';

import { motion as _motion } from 'framer-motion';
import { useUIStore } from '@/lib/stores/uiStore';
import { ImmersiveLoadingScreen } from '@/components/game/loading/ImmersiveLoadingScreen';

export function LoadingOverlay() {
  const { loadingMessage: _loadingMessage, contextData } = useUIStore();

  // Determine loading variant based on context
  const loadingVariant = contextData?.loadingVariant || 'boot';

  return (
    <ImmersiveLoadingScreen
      isLoading={true}
      variant={loadingVariant}
    />
  );
}