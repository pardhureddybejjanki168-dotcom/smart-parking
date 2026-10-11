import React, { useState, useEffect, useCallback } from 'react';
import { adminReservationApi, reservationApi } from '../../api/client';
import { Reservation } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { Calendar, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(10);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminReservationApi.list({
        page,
        size,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });

      const data = (res as any)?.data || res;
      if (Array.isArray(data)) {
        setReservations(data);
        setTotalPages(1);
      } else if (data?.content) {
        setReservations(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setReservations([]);
      }
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, setTotalPages]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleAdminCancel = async () => {
    if (!reservationToCancel) return;
    setCancelling(true);
    try {
      await reservationApi.cancel(reservationToCancel.id);
      toast.success('Reservation cancelled by admin');
      setReservationToCancel(null);
      fetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Facility Reservations Master</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global view of all advance slot bookings across all registered drivers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Reservations Found"
            description="No advance bookings match the current filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Bay</th>
                  <th className="py-3 px-4">Vehicle ID</th>
                  <th className="py-3 px-4">Driver User ID</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((r) => {
                  const canCancel = r.status === 'CONFIRMED' || r.status === 'PENDING';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        #{r.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-navy-700">
                        Slot {r.slotNumber || r.slotId}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {r.vehicleRegistrationNumber || r.vehicleId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                        {r.userId?.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {format(new Date(r.startTime), 'PP p')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {format(new Date(r.endTime), 'PP p')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={r.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canCancel && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setReservationToCancel(r)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Force Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!reservationToCancel}
        title="Admin Override: Cancel Reservation"
        message={`Force cancel reservation #${reservationToCancel?.id.slice(0, 8)} for Slot ${reservationToCancel?.slotNumber || reservationToCancel?.slotId}?`}
        confirmText="Cancel Reservation"
        variant="danger"
        loading={cancelling}
        onConfirm={handleAdminCancel}
        onCancel={() => setReservationToCancel(null)}
      />
    </div>
  );
};
