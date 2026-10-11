import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reservationApi } from '../../api/client';
import { Reservation } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { Calendar, CalendarPlus, XCircle, Clock, MapPin } from 'lucide-react';
import { format, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

export const ReservationsPage: React.FC = () => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToCancel, setSelectedToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(10);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reservationApi.list({
        page,
        size,
        tab,
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
  }, [page, size, tab, setTotalPages]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelReservation = async () => {
    if (!selectedToCancel) return;
    setCancelling(true);
    try {
      await reservationApi.cancel(selectedToCancel.id);
      toast.success('Reservation cancelled');
      setSelectedToCancel(null);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Reservations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review upcoming and historical parking slot reservations.
          </p>
        </div>
        <Link to="/reserve">
          <Button variant="primary">
            <CalendarPlus className="w-4 h-4 mr-1.5" /> Book a Slot
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setTab('upcoming');
              setPage(0);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'upcoming'
                ? 'border-navy-700 text-navy-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Upcoming Bookings
          </button>
          <button
            onClick={() => {
              setTab('past');
              setPage(0);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'past'
                ? 'border-navy-700 text-navy-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Past & Completed
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={tab === 'upcoming' ? 'No Upcoming Reservations' : 'No Past Reservations'}
            description={
              tab === 'upcoming'
                ? 'You do not have any pending or confirmed upcoming bookings.'
                : 'Your completed or cancelled bookings will show here.'
            }
            actionLabel={tab === 'upcoming' ? 'Book a Slot' : undefined}
            onAction={() => (window.location.href = '/reserve')}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {reservations.map((res) => {
              const canCancel =
                res.status === 'CONFIRMED' && isFuture(new Date(res.startTime));

              return (
                <div key={res.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">
                        Bay #{res.slotNumber || res.slotId}
                      </span>
                      <Badge status={res.status} />
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {format(new Date(res.startTime), 'PP p')} → {format(new Date(res.endTime), 'p')}
                    </p>

                    <p className="text-xs text-slate-500">
                      Vehicle: <span className="font-semibold text-slate-700">{res.vehicleRegistrationNumber || res.vehicleId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setSelectedToCancel(res)}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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
        isOpen={!!selectedToCancel}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this booking? The slot will become available for other drivers."
        confirmText="Cancel Reservation"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancelReservation}
        onCancel={() => setSelectedToCancel(null)}
      />
    </div>
  );
};
