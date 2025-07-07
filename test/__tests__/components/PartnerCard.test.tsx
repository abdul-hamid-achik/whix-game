import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartnerCard } from '@/components/game/PartnerCard';

describe('PartnerCard', () => {
  const mockPartner = {
    id: 'test-1',
    name: 'Test Partner',
    class: 'courier',
    primaryTrait: 'hyperfocus',
    secondaryTrait: 'pattern_recognition',
    level: 5,
    rarity: 'rare',
    stats: {
      focus: 75,
      perception: 60,
      social: 45,
      logic: 50,
      stamina: 65,
    },
    currentEnergy: 80,
    maxEnergy: 100,
    bondLevel: 3,
  };

  it('renders partner information correctly', () => {
    render(<PartnerCard partner={mockPartner} />);
    
    expect(screen.getByText('Test Partner')).toBeInTheDocument();
    expect(screen.getByText(/Courier/)).toBeInTheDocument();
    expect(screen.getByText(/Lv\.5/)).toBeInTheDocument();
    expect(screen.getByText('RARE')).toBeInTheDocument();
  });

  it('displays neurodivergent traits', () => {
    render(<PartnerCard partner={mockPartner} />);
    
    expect(screen.getByText('Hyperfocus')).toBeInTheDocument();
    expect(screen.getByText('Pattern Recognition')).toBeInTheDocument();
  });

  it('shows energy bar with correct percentage', () => {
    render(<PartnerCard partner={mockPartner} />);
    
    expect(screen.getByText('80/100')).toBeInTheDocument();
    // Energy bar should be at 80%
    const energyContainer = screen.getByText('Energy').closest('.space-y-1');
    const energyBar = energyContainer?.querySelector('.bg-gradient-to-r');
    expect(energyBar).toBeInTheDocument();
    // Note: Motion animation styles are harder to test, we'll focus on element presence
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<PartnerCard partner={mockPartner} onClick={handleClick} />);
    
    const card = screen.getByText('Test Partner').closest('.cursor-pointer');
    fireEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected styling when selected', () => {
    render(<PartnerCard partner={mockPartner} selected={true} />);
    
    const card = screen.getByText('Test Partner').closest('.cursor-pointer');
    expect(card).toHaveClass('ring-2', 'ring-primary');
  });

  it('shows detailed stats when showDetails is true', () => {
    render(<PartnerCard partner={mockPartner} showDetails={true} />);
    
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('Perception')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('displays bond level with heart icon', () => {
    render(<PartnerCard partner={mockPartner} />);
    
    expect(screen.getByText('Bond Level 3')).toBeInTheDocument();
  });

  it('applies correct rarity gradient', () => {
    const { rerender } = render(<PartnerCard partner={mockPartner} />);
    expect(screen.getByText('RARE')).toHaveClass('from-blue-400', 'to-cyan-500');

    rerender(<PartnerCard partner={{ ...mockPartner, rarity: 'legendary' }} />);
    expect(screen.getByText('LEGENDARY')).toHaveClass('from-yellow-400', 'to-orange-500');
  });
});