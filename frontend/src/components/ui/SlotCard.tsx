import React from 'react';
import { ParkingSlot } from '../../types';
import { Car, Bike, Accessibility, Zap, HelpCircle } from 'lucide-react';
import { Badge } from './Badge';

interface SlotCardProps {
  slot: ParkingSlot;
  onClick?: (slot: ParkingSlot) => void;
  className?: string;
}

export const getSlotTypeIcon = (type: string) => {
  switch (type) {
    case 'TWO_WHEELER':
      return <Bike className="w-4 h-4" />;
    case 'FOUR_WHEELER':
      return <Car className="w-4 h-4" />;
    case 'ACCESSIBLE':
      return <Accessibility className="w-4 h-4" />;
    case 'ELECTRIC':
      return <Zap className="w-4 h-4" />;
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
};

export const SlotCard: React.FC<SlotCardProps> = ({ slot, onClick, className = '' }) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 border-emerald-300 hover:border-emerald-500 text-emerald-900';
      case 'OCCUPIED':
        return 'bg-rose-50 border-rose-300 hover:border-rose-500 text-rose-900';
      case 'RESERVED':
        return 'bg-amber-50 border-amber-300 hover:border-amber-500 text-amber-900';
      case 'MAINTENANCE':
      default:
        return 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-800';
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(slot)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(slot);
        }
      }}
      className={`relative rounded-xl border-2 p-4 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between select-none ${getStatusColors(
        slot.status
      )} ${className}`}
      data-testid={`slot-card-${slot.id || slot.slotNumber}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-base tracking-wide">
          {getSlotTypeIcon(slot.slotType)}
          <span>{slot.slotNumber}</span>
        </div>
        <Badge status={slot.status} />
      </div>

      <div className="mt-3">
        {slot.status === 'OCCUPIED' && (
          <div className="text-xs font-semibold bg-white/70 py-1 px-2 rounded border border-rose-200">
            <span className="text-rose-700 block truncate">
              {slot.currentVehicleNumber || 'Vehicle Occupied'}
            </span>
          </div>
        )}

        {slot.status === 'RESERVED' && (
          <div className="text-xs font-semibold bg-white/70 py-1 px-2 rounded border border-amber-200">
            <span className="text-amber-700 block truncate">
              {slot.currentVehicleNumber || 'Reserved Slot'}
            </span>
          </div>
        )}

        {slot.status === 'AVAILABLE' && (
          <div className="text-xs font-medium text-emerald-700 py-1 px-2">
            Open for parking
          </div>
        )}

        {slot.status === 'MAINTENANCE' && (
          <div className="text-xs font-medium text-slate-600 py-1 px-2">
            Under Maintenance
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-slate-500 font-medium flex justify-between items-center border-t border-slate-200/50 pt-1.5">
        <span>{slot.slotType.replace('_', ' ')}</span>
        <span>Tap for info</span>
      </div>
    </div>
  );
};
