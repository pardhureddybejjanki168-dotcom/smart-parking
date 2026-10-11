import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { slotApi } from '../../api/client';
import { ParkingSlot, SlotStatus, SlotType } from '../../types';
import { SlotCard } from '../../components/ui/SlotCard';
import { SlotDetailModal } from '../../components/ui/SlotDetailModal';
import { SearchInput } from '../../components/ui/SearchInput';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePolling } from '../../hooks/usePolling';
import { ParkingSquare, RefreshCw, Filter, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SlotMonitor: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchSlots = useCallback(async () => {
    try {
      const res = await slotApi.list();
      const list = (res as any)?.data || res;
      setSlots(Array.isArray(list) ? list : (list as any)?.content || []);
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Polling every 15 seconds
  usePolling(fetchSlots, 15000);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesStatus =
        statusFilter === 'ALL' || slot.status === statusFilter;
      const matchesType =
        typeFilter === 'ALL' || slot.slotType === typeFilter;
      const matchesSearch =
        !searchQuery ||
        slot.slotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (slot.currentVehicleNumber &&
          slot.currentVehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [slots, statusFilter, typeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: slots.length,
      available: slots.filter((s) => s.status === 'AVAILABLE').length,
      occupied: slots.filter((s) => s.status === 'OCCUPIED').length,
      reserved: slots.filter((s) => s.status === 'RESERVED').length,
      maintenance: slots.filter((s) => s.status === 'MAINTENANCE').length,
    };
  }, [slots]);

  const handleCardClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Real-Time Parking Map</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live sensor tracking. Automatically refreshed every 15 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => fetchSlots()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Now
          </Button>
        </div>
      </div>

      {/* Legend & Summary Ribbon */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5 mr-2">
            <Layers className="w-4 h-4 text-slate-400" /> Bays:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">Available ({counts.available})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-600 font-medium">Occupied ({counts.occupied})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-600 font-medium">Reserved ({counts.reserved})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block" />
            <span className="text-slate-600 font-medium">Maintenance ({counts.maintenance})</span>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
          {counts.available} of {counts.total} bays free
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-72">
          <SearchInput
            placeholder="Search by bay number or vehicle..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-700"
            >
              <option value="ALL">All Slot Types</option>
              <option value="FOUR_WHEELER">Four Wheeler</option>
              <option value="TWO_WHEELER">Two Wheeler</option>
              <option value="ELECTRIC">Electric Vehicle</option>
              <option value="ACCESSIBLE">Accessible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Slots */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredSlots.length === 0 ? (
        <EmptyState
          icon={ParkingSquare}
          title="No Parking Slots Found"
          description="Try clearing or adjusting your status and type filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setStatusFilter('ALL');
            setTypeFilter('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSlots.map((slot) => (
            <SlotCard key={slot.id || slot.slotNumber} slot={slot} onClick={handleCardClick} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <SlotDetailModal
        slot={selectedSlot}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
