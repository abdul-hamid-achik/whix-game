import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Fix for the ontouchstart delete error in Vitest
// This is a known issue with jsdom and touch events
if (typeof window !== 'undefined') {
  // Make ontouchstart configurable so it can be deleted
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart');
  if (descriptor && !descriptor.configurable) {
    Object.defineProperty(window, 'ontouchstart', {
      value: descriptor.value,
      writable: true,
      configurable: true
    });
  }
}

// Mock HTMLCanvasElement globally to fix canvas-related test errors
const mockContext = {
  fillStyle: '',
  fillRect: vi.fn(),
  font: '',
  fillText: vi.fn(),
  clearRect: vi.fn(),
  globalAlpha: 1,
  canvas: {
    width: 800,
    height: 600
  }
};

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));