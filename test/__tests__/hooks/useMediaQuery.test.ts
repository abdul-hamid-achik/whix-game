import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop,
  useIsPortrait,
  useIsLandscape,
  useIsTouchDevice,
  useDeviceInfo 
} from '@/lib/hooks/useMediaQuery';

// Mock window.matchMedia
const createMatchMediaMock = (matches: boolean) => {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  
  return {
    matches,
    media: '',
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') listeners.push(listener);
    }),
    removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }),
    dispatchEvent: vi.fn(),
    // Trigger all listeners
    triggerChange: (newMatches: boolean) => {
      listeners.forEach(listener => {
        listener({ matches: newMatches } as MediaQueryListEvent);
      });
    }
  };
};

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    matchMediaMock = createMatchMediaMock(false);
    window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial match value', () => {
    matchMediaMock = createMatchMediaMock(true);
    window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('should update when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);

    act(() => {
      matchMediaMock.triggerChange(true);
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(matchMediaMock.addEventListener).toHaveBeenCalled();
    
    unmount();
    
    expect(matchMediaMock.removeEventListener).toHaveBeenCalled();
  });
});

describe('Breakpoint hooks', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      // Mobile: < 640px
      if (query === '(min-width: 640px)') {
        return createMatchMediaMock(false);
      }
      // Tablet: >= 640px && < 1024px
      if (query === '(min-width: 1024px)') {
        return createMatchMediaMock(false);
      }
      return createMatchMediaMock(true);
    });
  });

  describe('useIsMobile', () => {
    it('should return true for mobile devices', () => {
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('should return false for non-mobile devices', () => {
      window.matchMedia = vi.fn().mockImplementation(() => createMatchMediaMock(true));
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });
  });

  describe('useIsTablet', () => {
    it('should return true for tablet devices', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => {
        if (query === '(min-width: 640px)') return createMatchMediaMock(true);
        if (query === '(min-width: 1024px)') return createMatchMediaMock(false);
        return createMatchMediaMock(false);
      });

      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });
  });

  describe('useIsDesktop', () => {
    it('should return true for desktop devices', () => {
      window.matchMedia = vi.fn().mockImplementation(() => createMatchMediaMock(true));
      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(true);
    });
  });
});

describe('Orientation hooks', () => {
  it('should detect portrait orientation', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      return createMatchMediaMock(query === '(orientation: portrait)');
    });

    const { result } = renderHook(() => useIsPortrait());
    expect(result.current).toBe(true);
  });

  it('should detect landscape orientation', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      return createMatchMediaMock(query === '(orientation: landscape)');
    });

    const { result } = renderHook(() => useIsLandscape());
    expect(result.current).toBe(true);
  });
});

describe('useIsTouchDevice', () => {
  it('should detect touch devices', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: () => {}
    });

    const { result } = renderHook(() => useIsTouchDevice());
    expect(result.current).toBe(true);
  });

  it('should detect non-touch devices', () => {
    // Remove touch support
    // @ts-ignore
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0
    });

    const { result } = renderHook(() => useIsTouchDevice());
    expect(result.current).toBe(false);
  });
});

describe('useDeviceInfo', () => {
  it('should return complete device information', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      // Mobile device in portrait
      if (query === '(min-width: 640px)') return createMatchMediaMock(false);
      if (query === '(min-width: 1024px)') return createMatchMediaMock(false);
      if (query === '(orientation: portrait)') return createMatchMediaMock(true);
      if (query === '(orientation: landscape)') return createMatchMediaMock(false);
      return createMatchMediaMock(false);
    });

    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: () => {}
    });

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current).toEqual({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isPortrait: true,
      isLandscape: false,
      isTouch: true,
    });
  });
});

// SSR compatibility tests
describe('SSR compatibility', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // @ts-ignore
    delete global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should handle server-side rendering without errors', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should handle touch detection on server', () => {
    const { result } = renderHook(() => useIsTouchDevice());
    expect(result.current).toBe(false);
  });
});