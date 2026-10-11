import React, { useState, useEffect, useCallback } from 'react';
import { vehicleApi, sessionApi } from '../../api/client';
import { Vehicle, ParkingRecord } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { usePagination } from '../../hooks/usePagination';
import { Car, Eye, History, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const VehicleRecordsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // History modal for a vehicle
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<ParkingRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(10);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.list({
        page,
        size,
        search: search || undefined,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
      });

      const data = (res as any)?.data || res;
      let list: Vehicle[] = [];
      if (Array.isArray(data)) {
        list = data;
        setTotalPages(1);
      } else if (data?.content) {
        list = data.content;
        setTotalPages(data.totalPages || 1);
      }

      if (activeFilter !== 'ALL') {
        const isActive = activeFilter === 'ACTIVE';
        list = list.filter((v) => v.active === isActive);
      }
      setVehicles(list);
    } catch {
      toast.error('Failed to load vehicle records');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, typeFilter, activeFilter, setTotalPages]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleViewHistory = async (v: Vehicle) => {
    setSelectedVehicle(v);
    setHistoryLoading(true);
    try {
      const res = await sessionApi.history({ search: v.registrationNumber, size: 10 });
      const data = (res as any)?.data || res;
      setVehicleHistory(Array.isArray(data) ? data : data?.content || []);
    } catch {
      toast.error('Failed to load vehicle history');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Master Database</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete fleet registry across all tenant and driver accounts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search license plate number..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
            >
              <option value="ALL">All Types</option>
              <option value="FOUR_WHEELER">Four Wheeler</option>
              <option value="TWO_WHEELER">Two Wheeler</option>
              <option value="ELECTRIC">Electric</option>
              <option value="ACCESSIBLE">Accessible</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No Vehicle Records"
            description="No vehicles match the selected criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Make & Model</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {v.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {v.make} {v.model} ({v.color})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {v.vehicleType.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {v.ownerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{v.ownerPhone}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={v.active ? 'AVAILABLE' : 'MAINTENANCE'}>
                        {v.active ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewHistory(v)}
                      >
                        <History className="w-3.5 h-3.5 mr-1" /> Parking Logs
                      </Button>
                    </td>
                  </tr>
                ))}
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

      {/* History Modal */}
      <Modal
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        title={`Parking Logs: ${selectedVehicle?.registrationNumber}`}
        maxWidth="lg"
      >
        {historyLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : vehicleHistory.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-500">
            No session activity found for this vehicle.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {vehicleHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Slot #{rec.slotNumber}</span>
                    <Badge status={rec.status} />
                  </div>
                  <p className="text-slate-500 mt-1">
                    Entry: {format(new Date(rec.entryTime), 'PP p')}
                  </p>
                </div>
                <div className="text-right text-slate-500">
                  {rec.exitTime ? (
                    <p>Exit: {format(new Date(rec.exitTime), 'p')}</p>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Still Parked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
