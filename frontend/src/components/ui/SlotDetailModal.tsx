import React from 'react';
import { ParkingSlot } from '../../types';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldAlert, Clock, Car } from 'lucide-react';
import { format } from 'date-fns';

interface SlotDetailModalProps {
  slot: ParkingSlot | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (slotId: string, status: any) => void;
}

export const SlotDetailModal: React.FC<SlotDetailModalProps> = ({
  slot,
  isOpen,
  onClose,
  isAdmin = false,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  if (!slot) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Slot ${slot.slotNumber} Details`} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">{slot.slotNumber}</span>
            <Badge status={slot.status} />
          </div>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            {slot.slotType.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Car className="w-3.5 h-3.5" /> Current Vehicle
            </span>
            <p className="font-semibold text-slate-800 mt-1">
              {slot.currentVehicleNumber || 'None'}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Last Updated
            </span>
            <p className="font-medium text-slate-700 mt-1 text-sm">
              {slot.updatedAt ? format(new Date(slot.updatedAt), 'PP p') : 'Recent'}
            </p>
          </div>
        </div>

        {slot.status === 'OCCUPIED' && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Currently Occupied</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Slot is currently in use by vehicle {slot.currentVehicleNumber || 'assigned vehicle'}.
              </p>
            </div>
          </div>
        )}

        {slot.status === 'RESERVED' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <Clock className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Reserved Slot</p>
              <p className="text-xs text-amber-700 mt-0.5">
                This spot has an active reservation booking.
              </p>
            </div>
          </div>
        )}

        {slot.status === 'AVAILABLE' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <MapPin className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold">Available for Parking</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                You can reserve this slot in advance or drive in if permitted.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          {!isAdmin && slot.status === 'AVAILABLE' && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                navigate(`/reserve?slotId=${slot.id}`);
              }}
            >
              Reserve Slot
            </Button>
          )}

          {isAdmin && onStatusChange && (
            <div className="flex gap-2">
              {slot.status !== 'MAINTENANCE' && slot.status !== 'OCCUPIED' && (
                <Button
                  variant="secondary"
                  onClick={() => onStatusChange(slot.id, 'MAINTENANCE')}
                >
                  Set Maintenance
                </Button>
              )}
              {slot.status === 'MAINTENANCE' && (
                <Button
                  variant="primary"
                  onClick={() => onStatusChange(slot.id, 'AVAILABLE')}
                >
                  Set Available
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
