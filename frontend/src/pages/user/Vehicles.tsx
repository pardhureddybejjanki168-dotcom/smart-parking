import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehicleApi } from '../../api/client';
import { Vehicle } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { Car, Plus, Bike, Accessibility, Zap, Trash2, Edit2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    page,
    setPage,
    size,
    totalPages,
    setTotalPages,
  } = usePagination(10);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.list({
        page,
        size,
        search: search || undefined,
        type: selectedType === 'ALL' ? undefined : selectedType,
      });

      const data = (res as any)?.data || res;
      if (Array.isArray(data)) {
        setVehicles(data);
        setTotalPages(1);
      } else if (data?.content) {
        setVehicles(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setVehicles([]);
      }
    } catch (err: any) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, selectedType, setTotalPages]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    try {
      await vehicleApi.remove(vehicleToDelete.id);
      toast.success('Vehicle removed successfully');
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'TWO_WHEELER':
        return <Bike className="w-5 h-5 text-sky-600" />;
      case 'FOUR_WHEELER':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'ELECTRIC':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'ACCESSIBLE':
        return <Accessibility className="w-5 h-5 text-purple-600" />;
      default:
        return <Car className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Registered Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage personal cars, bikes, and registered fleet for parking access.
          </p>
        </div>
        <Link to="/vehicles/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" /> Register Vehicle
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search registration or model..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(0);
            }}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-navy-700"
          >
            <option value="ALL">All Types</option>
            <option value="FOUR_WHEELER">Four Wheeler</option>
            <option value="TWO_WHEELER">Two Wheeler</option>
            <option value="ELECTRIC">Electric</option>
            <option value="ACCESSIBLE">Accessible</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No Registered Vehicles"
            description="You haven't added any vehicles yet. Add your vehicle to begin reserving slots."
            actionLabel="Register Vehicle"
            onAction={() => navigate('/vehicles/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Owner Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                          {getVehicleIcon(v.vehicleType)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {v.make} {v.model}
                          </p>
                          <p className="text-xs text-slate-500">{v.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {v.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {v.vehicleType.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="text-slate-800">{v.ownerName}</p>
                      <p className="text-xs text-slate-400">{v.ownerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={v.active ? 'AVAILABLE' : 'MAINTENANCE'}>
                        {v.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/vehicles/${v.id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/vehicles/${v.id}?edit=true`)}
                          title="Edit Vehicle"
                        >
                          <Edit2 className="w-4 h-4 text-navy-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVehicleToDelete(v)}
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
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

      {/* Delete confirmation modal */}
      <ConfirmDialog
        isOpen={!!vehicleToDelete}
        title="Remove Vehicle"
        message={`Are you sure you want to remove vehicle ${vehicleToDelete?.registrationNumber}? Any active reservations for this vehicle will be impacted.`}
        confirmText="Remove"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
};
