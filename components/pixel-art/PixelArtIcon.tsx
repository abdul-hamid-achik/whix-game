'use client';

import { cn } from '@/lib/utils';

interface PixelArtIconProps {
  name: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

// Pixel art icon definitions using CSS grid
const pixelIcons: Record<string, string[]> = {
  home: [
    '..###..',
    '.#####.',
    '#######',
    '##.#.##',
    '##.#.##',
    '##.#.##',
    '#######',
  ],
  package: [
    '#######',
    '##...##',
    '#.....#',
    '#.....#',
    '#.....#',
    '##...##',
    '#######',
  ],
  users: [
    '.##.##.',
    '####.##',
    '.##.###',
    '.#####.',
    '##.##.#',
    '##.##.#',
    '#..#..#',
  ],
  star: [
    '...#...',
    '..###..',
    '.#####.',
    '#######',
    '.#####.',
    '..###..',
    '.#...#.',
  ],
  sword: [
    '....#..',
    '...###.',
    '..#####',
    '.###...',
    '####...',
    '#.##...',
    '..#....',
  ],
  book: [
    '#######',
    '##...##',
    '##...##',
    '##...##',
    '##...##',
    '##...##',
    '#######',
  ],
  coin: [
    '..###..',
    '.#####.',
    '##.$.##',
    '##$$$##',
    '##.$.##',
    '.#####.',
    '..###..',
  ],
  logo: [
    '#.#.#.#',
    '#.#.#.#',
    '#.#.#.#',
    '#######',
    '.#...#.',
    '.#...#.',
    '.#...#.',
  ],
  heart: [
    '.##.##.',
    '#######',
    '#######',
    '.#####.',
    '..###..',
    '...#...',
    '.......',
  ],
  shield: [
    '.#####.',
    '#######',
    '##.#.##',
    '##.#.##',
    '.#####.',
    '..###..',
    '...#...',
  ],
  lightning: [
    '...##..',
    '..##...',
    '.####..',
    '..##...',
    '.####..',
    '..##...',
    '.##....',
  ],
  potion: [
    '..###..',
    '..#.#..',
    '.#####.',
    '#######',
    '#######',
    '#######',
    '.#####.',
  ],
  key: [
    '.####..',
    '#....#.',
    '#....#.',
    '.####..',
    '..##...',
    '..##.#.',
    '..##.#.',
  ],
  skull: [
    '.#####.',
    '#######',
    '##.#.##',
    '#######',
    '.#.#.#.',
    '.#####.',
    '..###..',
  ],
};

export function PixelArtIcon({ 
  name, 
  size = 24, 
  className,
  animated = false 
}: PixelArtIconProps) {
  const icon = pixelIcons[name] || pixelIcons.logo;
  const pixelSize = Math.floor(size / 7);

  return (
    <div 
      className={cn(
        'inline-grid grid-cols-7 gap-0',
        animated && 'animate-pulse',
        className
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {icon.map((row, rowIndex) => 
        row.split('').map((pixel, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              'transition-all duration-200',
              pixel === '#' ? 'bg-current' : 'bg-transparent',
              pixel === '$' && 'bg-yellow-500',
              pixel === '.' && 'bg-transparent'
            )}
            style={{
              width: pixelSize,
              height: pixelSize,
            }}
          />
        ))
      )}
    </div>
  );
}

// Animated pixel art component for special effects
export function AnimatedPixelArt({ 
  frames, 
  size = 48, 
  className,
  fps = 8 
}: {
  frames: string[][];
  size?: number;
  className?: string;
  fps?: number;
}) {
  const [currentFrame, setCurrentFrame] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [frames.length, fps]);

  const icon = frames[currentFrame];
  const pixelSize = Math.floor(size / icon.length);

  return (
    <div 
      className={cn('inline-grid gap-0', className)}
      style={{
        width: size,
        height: size,
        gridTemplateColumns: `repeat(${icon[0].length}, 1fr)`,
      }}
    >
      {icon.map((row, rowIndex) => 
        row.split('').map((pixel, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              'transition-all duration-100',
              pixel === '#' ? 'bg-current' : 'bg-transparent',
              pixel === '$' && 'bg-yellow-500',
              pixel === '*' && 'bg-red-500',
              pixel === '~' && 'bg-blue-500',
              pixel === '.' && 'bg-transparent'
            )}
            style={{
              width: pixelSize,
              height: pixelSize,
            }}
          />
        ))
      )}
    </div>
  );
}

// Export some pre-made animations
export const pixelAnimations = {
  loading: [
    [
      '..###..',
      '.#...#.',
      '#.....#',
      '#.....#',
      '#.....#',
      '.#...#.',
      '..###..',
    ],
    [
      '..###..',
      '.##..#.',
      '##....#',
      '#.....#',
      '#.....#',
      '.#...#.',
      '..###..',
    ],
    [
      '..###..',
      '.###.#.',
      '####..#',
      '###...#',
      '#.....#',
      '.#...#.',
      '..###..',
    ],
    [
      '..###..',
      '.#####.',
      '#######',
      '######',
      '####..#',
      '.###.#.',
      '..###..',
    ],
  ],
  sparkle: [
    [
      '...#...',
      '..###..',
      '.#####.',
      '#######',
      '.#####.',
      '..###..',
      '...#...',
    ],
    [
      '...*...',
      '..*#*..',
      '.*###*.',
      '*#####*',
      '.*###*.',
      '..*#*..',
      '...*...',
    ],
  ],
};

import React from 'react';