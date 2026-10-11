import React, { useState, useEffect, useCallback } from 'react';
import { sessionApi, vehicleApi, slotApi } from '../../api/client';
import { ParkingRecord, Vehicle, ParkingSlot } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { usePolling } from '../../hooks/usePolling';
import { Clock, Play, Square, Car, MapPin, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const ActiveSessionPage: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToEnd, setSessionToEnd] = useState<ParkingRecord | null>(null);
  const [endingSession, setEndingSession] = useState(false);

  // New session entry modal
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [startingSession, setStartingSession] = useState(false);

  const fetchActive = useCallback(async () => {
    try {
      const res = await sessionApi.active();
      const data = (res as any)?.data || res;
      setActiveSessions(Array.isArray(data) ? data : data?.content || []);
    } catch {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  usePolling(fetchActive, 10000);

  const handleOpenEntryModal = async () => {
    try {
      const [vRes, sRes] = await Promise.all([
        vehicleApi.list(),
        slotApi.listAvailable(),
      ]);
      const vData = (vRes as any)?.data || vRes;
      const sData = (sRes as any)?.data || sRes;
      const vList = Array.isArray(vData) ? vData : vData?.content || [];
      const sList = Array.isArray(sData) ? sData : sData?.content || [];

      setVehicles(vList);
      setAvailableSlots(sList);
      if (vList.length > 0) setSelectedVehicleId(vList[0].id);
      if (sList.length > 0) setSelectedSlotId(sList[0].id);

      setEntryModalOpen(true);
    } catch {
      toast.error('Failed to load parking options');
    }
  };

  const handleStartSession = async () => {
    if (!selectedVehicleId || !selectedSlotId) {
      toast.error('Please select both vehicle and parking bay');
      return;
    }
    setStartingSession(true);
    try {
      await sessionApi.entry({
        vehicleId: selectedVehicleId,
        slotId: selectedSlotId,
      });
      toast.success('Session started! Vehicle checked into slot.');
      setEntryModalOpen(false);
      fetchActive();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    } finally {
      setStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionToEnd) return;
    setEndingSession(true);
    try {
      await sessionApi.exit(sessionToEnd.id);
      toast.success('Parking session ended successfully');
      setSessionToEnd(null);
      fetchActive();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to end session');
    } finally {
      setEndingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Parking Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of your vehicles currently parked on premises.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenEntryModal}>
          <Play className="w-4 h-4 mr-1.5" /> Start New Session
        </Button>
      </div>

      {activeSessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Clock}
            title="No Active Parking Sessions"
            description="You do not have any vehicles currently checked into parking slots."
            actionLabel="Park Vehicle Now"
            onAction={handleOpenEntryModal}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeSessions.map((session) => (
            <Card key={session.id} className="relative overflow-hidden border-2 border-navy-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span className="font-bold text-lg text-slate-900">
                    Slot #{session.slotNumber}
                  </span>
                </div>
                <Badge status="ACTIVE">In Session</Badge>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-slate-400" /> Vehicle
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {session.vehicleNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Check-in Time
                  </span>
                  <span className="font-medium text-slate-800">
                    {format(new Date(session.entryTime), 'PP p')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Elapsed Time
                  </span>
                  <span className="font-bold text-navy-700">
                    {formatDistanceToNow(new Date(session.entryTime))}
                  </span>
                </div>
              </div>

              <Button
                variant="danger"
                className="w-full"
                onClick={() => setSessionToEnd(session)}
              >
                <Square className="w-4 h-4 mr-1.5" /> End Session & Checkout
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Checkin / Start Modal */}
      <Modal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        title="Check-In Vehicle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Vehicle
            </label>
            {vehicles.length === 0 ? (
              <p className="text-sm text-rose-600">Please register a vehicle first.</p>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Available Bay
            </label>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-rose-600">No bays currently available.</p>
            ) : (
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    Bay #{s.slotNumber} ({s.slotType.replace('_', ' ')})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartSession}
              loading={startingSession}
              disabled={vehicles.length === 0 || availableSlots.length === 0}
            >
              Confirm Check-In
            </Button>
          </div>
        </div>
      </Modal>

      {/* End Session Confirm */}
      <ConfirmDialog
        isOpen={!!sessionToEnd}
        title="End Parking Session"
        message={`Are you sure you want to check out vehicle ${sessionToEnd?.vehicleNumber} from slot #${sessionToEnd?.slotNumber}?`}
        confirmText="End Session"
        variant="danger"
        loading={endingSession}
        onConfirm={handleEndSession}
        onCancel={() => setSessionToEnd(null)}
      />
    </div>
  );
};
