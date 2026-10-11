import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleApi, sessionApi } from '../../api/client';
import { Vehicle, ParkingRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ArrowLeft, Car, Edit2, Power, History, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [vehRes, histRes] = await Promise.allSettled([
        vehicleApi.get(id),
        sessionApi.history({ size: 5 }),
      ]);

      if (vehRes.status === 'fulfilled') {
        const val = (vehRes.value as any)?.data || vehRes.value;
        setVehicle(val);
      }
      if (histRes.status === 'fulfilled') {
        const val = (histRes.value as any)?.data || histRes.value;
        const list: ParkingRecord[] = Array.isArray(val) ? val : val?.content || [];
        setHistory(list.filter((r) => r.vehicleId === id).slice(0, 5));
      }
    } catch {
      toast.error('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStatus = async () => {
    if (!vehicle || !id) return;
    setActionLoading(true);
    try {
      const newStatus = !vehicle.active;
      await vehicleApi.update(id, { active: newStatus });
      toast.success(newStatus ? 'Vehicle activated' : 'Vehicle deactivated');
      setVehicle({ ...vehicle, active: newStatus });
      setConfirmOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Vehicle not found.</p>
        <Link to="/vehicles">
          <Button variant="secondary">Return to Vehicles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/vehicles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vehicle: {vehicle.registrationNumber}
          </h1>
          <Badge status={vehicle.active ? 'AVAILABLE' : 'MAINTENANCE'}>
            {vehicle.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/vehicles/new?edit=${vehicle.id}`}>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/vehicles/${vehicle.id}/edit`);
              }}
            >
              <Edit2 className="w-4 h-4 mr-1.5" /> Edit
            </Button>
          </Link>
          <Button
            variant={vehicle.active ? 'danger' : 'primary'}
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Power className="w-4 h-4 mr-1.5" />
            {vehicle.active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card title="Vehicle Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Make & Model</span>
            <p className="text-base font-bold text-slate-800 mt-1">
              {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Color</span>
            <p className="text-base font-medium text-slate-800 mt-1">{vehicle.color}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Type</span>
            <p className="text-base font-medium text-slate-800 mt-1">
              {vehicle.vehicleType.replace('_', ' ')}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Registered On</span>
            <p className="text-base font-medium text-slate-800 mt-1">
              {vehicle.createdAt ? format(new Date(vehicle.createdAt), 'MMM d, yyyy') : 'Recent'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Owner Name</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">{vehicle.ownerName}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Contact Phone</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">{vehicle.ownerPhone}</p>
          </div>
        </div>
      </Card>

      {/* Recent Parking History */}
      <Card
        title="Recent Parking Sessions"
        subtitle="Last 5 recorded sessions for this vehicle"
        action={
          <Link to="/history" className="text-xs font-semibold text-navy-700 hover:underline flex items-center">
            <History className="w-3.5 h-3.5 mr-1" /> View Full History
          </Link>
        }
      >
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No parking sessions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((record) => (
              <div key={record.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Slot {record.slotNumber}</span>
                    <Badge status={record.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Entry: {format(new Date(record.entryTime), 'PP p')}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {record.exitTime ? (
                    <span>Exit: {format(new Date(record.exitTime), 'p')}</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> In Session
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={vehicle.active ? 'Deactivate Vehicle' : 'Activate Vehicle'}
        message={`Are you sure you want to ${vehicle.active ? 'deactivate' : 'activate'} ${vehicle.registrationNumber}?`}
        confirmText={vehicle.active ? 'Deactivate' : 'Activate'}
        variant={vehicle.active ? 'danger' : 'primary'}
        loading={actionLoading}
        onConfirm={toggleStatus}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
