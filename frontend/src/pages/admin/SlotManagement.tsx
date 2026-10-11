import React, { useState, useEffect, useCallback } from 'react';
import { slotApi, adminSlotApi } from '../../api/client';
import { ParkingSlot, SlotStatus, SlotType } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ParkingSquare, Plus, Edit2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const SlotManagementPage: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<ParkingSlot | null>(null);

  // Form states
  const [slotNumber, setSlotNumber] = useState('');
  const [slotType, setSlotType] = useState<SlotType>('FOUR_WHEELER');
  const [saving, setSaving] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await slotApi.list();
      const list = (res as any)?.data || res;
      setSlots(Array.isArray(list) ? list : (list as any)?.content || []);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotNumber) {
      toast.error('Slot number is required');
      return;
    }
    setSaving(true);
    try {
      await adminSlotApi.create({
        slotNumber,
        slotType,
        status: 'AVAILABLE',
      });
      toast.success(`Slot ${slotNumber} created`);
      setCreateModalOpen(false);
      setSlotNumber('');
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSlot) return;
    setSaving(true);
    try {
      await adminSlotApi.update(editSlot.id, {
        slotNumber: editSlot.slotNumber,
        slotType: editSlot.slotType,
      });
      toast.success(`Slot ${editSlot.slotNumber} updated`);
      setEditSlot(null);
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update slot');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (slot: ParkingSlot, newStatus: SlotStatus) => {
    if (slot.status === 'OCCUPIED' && newStatus === 'AVAILABLE') {
      toast.error('Cannot change status to AVAILABLE while slot is OCCUPIED by a vehicle.');
      return;
    }
    try {
      await adminSlotApi.updateStatus(slot.id, newStatus);
      toast.success(`Slot ${slot.slotNumber} updated to ${newStatus}`);
      fetchSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change slot status');
    }
  };

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch =
      !search ||
      slot.slotNumber.toLowerCase().includes(search.toLowerCase()) ||
      (slot.currentVehicleNumber &&
        slot.currentVehicleNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || slot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parking Slot Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision, modify, and monitor bay statuses across all levels.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Slot
        </Button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search bay number..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="RESERVED">RESERVED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredSlots.length === 0 ? (
          <EmptyState
            icon={ParkingSquare}
            title="No Slots Found"
            description="No parking slots meet the selected query or filter."
            actionLabel="Add Slot"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Slot Number</th>
                  <th className="py-3 px-4">Bay Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active Vehicle</th>
                  <th className="py-3 px-4">Change Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 text-base">
                      {slot.slotNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {slot.slotType.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={slot.status}>{slot.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {slot.currentVehicleNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={slot.status}
                        onChange={(e) => handleStatusChange(slot, e.target.value as SlotStatus)}
                        className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OCCUPIED" disabled>
                          OCCUPIED
                        </option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditSlot(slot)}
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Parking Bay"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <Input
            label="Bay / Slot Number"
            placeholder="e.g. A-101, B-205"
            value={slotNumber}
            onChange={(e) => setSlotNumber(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slot Type
            </label>
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value as SlotType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="FOUR_WHEELER">Four Wheeler</option>
              <option value="TWO_WHEELER">Two Wheeler</option>
              <option value="ELECTRIC">Electric Vehicle (EV)</option>
              <option value="ACCESSIBLE">Accessible</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Create Bay
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editSlot}
        onClose={() => setEditSlot(null)}
        title="Edit Parking Bay"
      >
        {editSlot && (
          <form onSubmit={handleUpdateSlot} className="space-y-4">
            <Input
              label="Bay / Slot Number"
              value={editSlot.slotNumber}
              onChange={(e) => setEditSlot({ ...editSlot, slotNumber: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slot Type
              </label>
              <select
                value={editSlot.slotType}
                onChange={(e) =>
                  setEditSlot({ ...editSlot, slotType: e.target.value as SlotType })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="FOUR_WHEELER">Four Wheeler</option>
                <option value="TWO_WHEELER">Two Wheeler</option>
                <option value="ELECTRIC">Electric Vehicle (EV)</option>
                <option value="ACCESSIBLE">Accessible</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setEditSlot(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
