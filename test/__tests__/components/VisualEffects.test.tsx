import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { VisualEffects, CRTEffect, TerminalText, MatrixRain } from '@/components/game/effects/VisualEffects';
import { useUIStore } from '@/lib/stores/uiStore';

// Mock the UI store
vi.mock('@/lib/stores/uiStore', () => ({
  useUIStore: vi.fn()
}));

describe('VisualEffects', () => {
  beforeEach(() => {
    // Default mock settings
    vi.mocked(useUIStore).mockReturnValue({
      settings: {
        reducedMotion: false,
        theme: 'neura',
        effectsIntensity: 'low'
      }
    } as any);
  });

  it('should render visual effects when enabled', () => {
    const { container } = render(
      <VisualEffects
        scanlines={true}
        glitch={true}
        noise={true}
        vignette={true}
        flicker={false}
        intensity="low"
      />
    );

    // Check for scanlines
    const scanlineElement = container.querySelector('[style*="repeating-linear-gradient"]');
    expect(scanlineElement).toBeTruthy();

    // Check for vignette
    const vignetteElement = container.querySelector('[style*="radial-gradient"]');
    expect(vignetteElement).toBeTruthy();
  });

  it('should not render when reducedMotion is enabled', () => {
    vi.mocked(useUIStore).mockReturnValue({
      settings: {
        reducedMotion: true,
        theme: 'neura',
        effectsIntensity: 'low'
      }
    } as any);

    const { container } = render(
      <VisualEffects
        scanlines={true}
        glitch={true}
        noise={true}
        vignette={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should adjust opacity based on intensity', () => {
    const { container, rerender } = render(
      <VisualEffects
        scanlines={true}
        intensity="low"
      />
    );

    let scanlineElement = container.querySelector('[style*="repeating-linear-gradient"]');
    expect(scanlineElement?.getAttribute('style')).toContain('0.03');

    // Change intensity
    rerender(
      <VisualEffects
        scanlines={true}
        intensity="high"
      />
    );

    scanlineElement = container.querySelector('[style*="repeating-linear-gradient"]');
    expect(scanlineElement?.getAttribute('style')).toContain('0.1');
  });
});

describe('CRTEffect', () => {
  it('should wrap children with CRT monitor effects', () => {
    render(
      <CRTEffect>
        <div data-testid="content">Test Content</div>
      </CRTEffect>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    const container = screen.getByTestId('content').parentElement?.parentElement;
    expect(container).toHaveClass('relative', 'overflow-hidden');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CRTEffect className="custom-class">
        <div>Content</div>
      </CRTEffect>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('TerminalText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should type text progressively', async () => {
    const onComplete = vi.fn();
    
    await act(async () => {
      const { container } = render(
        <TerminalText 
          text="Hello World" 
          speed={50}
          onComplete={onComplete}
        />
      );

      // Initially should show cursor only
      expect(container.textContent).toMatch(/^_$/);

      // Advance time to show more characters
      act(() => {
        vi.advanceTimersByTime(250); // 5 characters at 50ms each
      });
      expect(container.textContent).toMatch(/Hello/);

      // Complete the text
      act(() => {
        vi.advanceTimersByTime(600); // Complete remaining characters
      });
      expect(container.textContent).toMatch(/Hello World/);

      // Check completion callback
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should show blinking cursor', () => {
    render(<TerminalText text="Test" />);
    
    // Cursor should be visible initially
    expect(screen.getByText(/_/)).toBeInTheDocument();
  });
});

describe('MatrixRain', () => {
  it('should render canvas element', () => {
    const { container } = render(<MatrixRain />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('pointer-events-none', 'fixed', 'inset-0');
  });

  it('should apply custom className', () => {
    const { container } = render(<MatrixRain className="custom-matrix" />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('custom-matrix');
  });

  it('should initialize canvas context', () => {
    const mockGetContext = vi.fn().mockReturnValue({
      fillStyle: '',
      fillRect: vi.fn(),
      font: '',
      fillText: vi.fn()
    });

    HTMLCanvasElement.prototype.getContext = mockGetContext;

    render(<MatrixRain />);
    
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });
});

// Integration test
describe('Visual Effects Integration', () => {
  it('should work together without conflicts', async () => {
    const { container } = render(
      <div>
        <VisualEffects
          scanlines={true}
          glitch={true}
          noise={true}
          vignette={true}
          intensity="medium"
        />
        <CRTEffect>
          <TerminalText text="WHIX SYSTEMS ONLINE" />
        </CRTEffect>
        <MatrixRain />
      </div>
    );

    // Check all effects are rendered
    expect(container.querySelector('[style*="repeating-linear-gradient"]')).toBeTruthy();
    expect(container.querySelector('canvas')).toBeTruthy();
    
    // Wait for terminal text to start rendering
    await waitFor(() => {
      expect(container.textContent).toMatch(/W|_/);
    }, { timeout: 1000 });
  });
});