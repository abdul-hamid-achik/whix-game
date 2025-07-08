'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalText, CRTEffect } from '../effects/VisualEffects';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useLoadingMessages, useUIContent } from '@/lib/hooks/useUIContent';

interface LoadingScreenProps {
  isLoading: boolean;
  variant?: 'boot' | 'mission' | 'sync' | 'corporate';
  onComplete?: () => void;
  className?: string;
}

export function ImmersiveLoadingScreen({ 
  isLoading, 
  variant = 'boot',
  onComplete,
  className 
}: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0);
  const [currentMessage, setCurrentMessage] = React.useState(0);
  
  // Load messages from CMS
  const messages = useLoadingMessages(variant);
  const { loading: loadingContent } = useUIContent();

  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return next;
      });
    }, 200);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [isLoading, messages.length, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 bg-gray-950 flex items-center justify-center",
            className
          )}
        >
          <CRTEffect className="w-full h-full">
            <div className="h-full flex flex-col items-center justify-center p-8">
              {variant === 'boot' && <BootSequence progress={progress} />}
              {variant === 'mission' && <MissionLoadingSequence progress={progress} message={messages[currentMessage]} />}
              {variant === 'sync' && <DataSyncSequence progress={progress} />}
              {variant === 'corporate' && <CorporateLoadingSequence progress={progress} />}
            </div>
          </CRTEffect>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Boot Sequence Component
function BootSequence({ progress }: { progress: number }) {
  const bootSteps = [
    { threshold: 0, text: "WHIX SYSTEMS v2.7.1" },
    { threshold: 10, text: "Initializing neural interface..." },
    { threshold: 20, text: "Loading courier protocols..." },
    { threshold: 30, text: "Establishing secure connection..." },
    { threshold: 40, text: "Verifying employee credentials..." },
    { threshold: 50, text: "Synchronizing delivery manifests..." },
    { threshold: 60, text: "Calibrating route optimization..." },
    { threshold: 70, text: "Loading city grid data..." },
    { threshold: 80, text: "Connecting to dispatch network..." },
    { threshold: 90, text: "System ready. Welcome, Courier." },
  ];

  const visibleSteps = bootSteps.filter(step => progress >= step.threshold);

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="text-center mb-8">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-cyan-400 text-6xl font-bold font-mono mb-2"
        >
          WHIX
        </motion.div>
        <p className="text-gray-500 font-mono text-sm">WORKFORCE HYPEROPTIMIZATION INTERFACE X</p>
      </div>

      <div className="space-y-2 font-mono text-sm">
        {visibleSteps.map((step, index) => (
          <motion.div
            key={step.threshold}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-green-400"
          >
            <TerminalText text={`[OK] ${step.text}`} speed={30} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-gray-500 font-mono text-xs mb-2">
          <span>SYSTEM INITIALIZATION</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded overflow-hidden">
          <motion.div
            className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}

// Mission Loading Sequence
function MissionLoadingSequence({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mx-auto w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full"
      />
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-cyan-400">LOADING MISSION</h2>
        <p className="text-gray-400 font-mono text-sm animate-pulse">{message}</p>
      </div>

      <div className="w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Data Sync Sequence
function DataSyncSequence({ progress }: { progress: number }) {
  const [dataStreams] = React.useState(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: ['Partner Data', 'Mission Intel', 'City Grid', 'Traffic Patterns', 'Weather Data'][i],
      speed: 0.5 + Math.random() * 1.5
    }))
  );

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">SYNCHRONIZING</h2>
        <p className="text-gray-500">Updating local data cache...</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataStreams.map((stream) => (
          <motion.div
            key={stream.id}
            className="bg-gray-900 border border-cyan-500/30 rounded p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stream.id * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400 text-sm font-mono">{stream.name}</span>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: stream.speed, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </div>
            <div className="w-full bg-gray-800 rounded overflow-hidden">
              <motion.div
                className="h-1 bg-cyan-500"
                animate={{ width: ['0%', '100%', '0%'] }}
                transition={{ duration: stream.speed * 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-gray-400 font-mono text-sm">
        <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
        {Math.floor(progress)}% Complete
      </div>
    </div>
  );
}

// Corporate Loading Sequence
function CorporateLoadingSequence({ progress }: { progress: number }) {
  const corporateSpeak = [
    "Optimizing delivery algorithms...",
    "Maximizing courier efficiency...",
    "Analyzing performance metrics...",
    "Calculating route optimizations...",
    "Processing tip distributions...",
  ];

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="text-center">
        <div className="mb-4">
          <motion.div
            className="inline-block"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-6xl font-bold text-amber-500 font-mono">₩</div>
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">WHIX CORPORATE</h2>
        <p className="text-gray-500 text-sm">"Your success is our profit"</p>
      </div>

      <div className="space-y-3">
        {corporateSpeak.map((text, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: progress > index * 20 ? 1 : 0.3, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-3"
          >
            <div className={cn(
              "w-4 h-4 rounded-full",
              progress > index * 20 ? "bg-green-500" : "bg-gray-600"
            )} />
            <span className="text-gray-400 font-mono text-sm">{text}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-gray-900 border border-amber-500/30 rounded p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Employee Efficiency Score</span>
          <span className="text-amber-400 font-mono">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded overflow-hidden">
          <motion.div
            className="h-2 bg-gradient-to-r from-amber-600 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to get loading messages
function getLoadingMessages(variant: string): string[] {
  switch (variant) {
    case 'mission':
      return [
        "Analyzing delivery routes...",
        "Checking traffic patterns...",
        "Calculating optimal paths...",
        "Loading district data...",
        "Preparing mission briefing...",
      ];
    case 'sync':
      return [
        "Connecting to WHIX servers...",
        "Downloading latest updates...",
        "Synchronizing partner data...",
        "Updating mission logs...",
        "Refreshing city grid...",
      ];
    case 'corporate':
      return [
        "Verifying employment status...",
        "Checking performance metrics...",
        "Calculating tip deductions...",
        "Processing corporate fees...",
        "Updating efficiency ratings...",
      ];
    default:
      return ["Loading..."];
  }
}