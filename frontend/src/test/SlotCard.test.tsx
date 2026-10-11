import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SlotCard } from '../components/ui/SlotCard';
import { ParkingSlot } from '../types';

describe('SlotCard Component', () => {
  const sampleSlot: ParkingSlot = {
    id: 'slot-1',
    slotNumber: 'A-101',
    slotType: 'FOUR_WHEELER',
    status: 'AVAILABLE',
    updatedAt: new Date().toISOString(),
  };

  it('renders slot number and status badge', () => {
    render(<SlotCard slot={sampleSlot} />);
    expect(screen.getByText('A-101')).toBeInTheDocument();
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
  });

  it('has correct background color class for AVAILABLE status', () => {
    const { container } = render(<SlotCard slot={sampleSlot} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-emerald-50');
  });

  it('has correct background color class for OCCUPIED status', () => {
    const occupiedSlot: ParkingSlot = {
      ...sampleSlot,
      status: 'OCCUPIED',
      currentVehicleNumber: 'MH12AB1234',
    };
    const { container } = render(<SlotCard slot={occupiedSlot} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-rose-50');
    expect(screen.getByText('MH12AB1234')).toBeInTheDocument();
  });

  it('has correct background color class for RESERVED status', () => {
    const reservedSlot: ParkingSlot = {
      ...sampleSlot,
      status: 'RESERVED',
    };
    const { container } = render(<SlotCard slot={reservedSlot} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-amber-50');
  });

  it('has correct background color class for MAINTENANCE status', () => {
    const maintenanceSlot: ParkingSlot = {
      ...sampleSlot,
      status: 'MAINTENANCE',
    };
    const { container } = render(<SlotCard slot={maintenanceSlot} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-slate-100');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SlotCard slot={sampleSlot} onClick={onClick} />);
    fireEvent.click(screen.getByText('A-101'));
    expect(onClick).toHaveBeenCalledWith(sampleSlot);
  });
});
