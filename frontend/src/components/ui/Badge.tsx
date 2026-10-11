import React from 'react';
import { SlotStatus, SessionStatus, ReservationStatus, Role } from '../../types';

interface BadgeProps {
  status?: SlotStatus | SessionStatus | ReservationStatus | Role | string;
  variant?: 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'purple';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '' }) => {
  const getVariant = (): string => {
    if (variant) {
      switch (variant) {
        case 'green':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'red':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'yellow':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'blue':
          return 'bg-sky-50 text-sky-700 border-sky-200';
        case 'purple':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'gray':
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    switch (status) {
      case 'AVAILABLE':
      case 'COMPLETED':
      case 'CONFIRMED':
      case 'true':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'OCCUPIED':
      case 'CANCELLED':
      case 'false':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      case 'RESERVED':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'MAINTENANCE':
      case 'EXPIRED':
        return 'bg-slate-100 text-slate-700 border-slate-300';

      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'USER':
        return 'bg-sky-50 text-sky-700 border-sky-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVariant()} ${className}`}
    >
      {children || status}
    </span>
  );
};
