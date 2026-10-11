import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slotApi, dashboardApi } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  Settings,
  ParkingSquare,
  Shield,
  Layers,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [dashRes, slotStatsRes] = await Promise.allSettled([
          dashboardApi.admin(),
          slotApi.getStats(),
        ]);

        const dashVal =
          dashRes.status === 'fulfilled'
            ? (dashRes.value as any)?.data || dashRes.value
            : null;
        const slotVal =
          slotStatsRes.status === 'fulfilled'
            ? (slotStatsRes.value as any)?.data || slotStatsRes.value
            : null;

        setStats({
          dash: dashVal,
          slots: slotVal,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Topology</h1>
        <p className="text-sm text-slate-500 mt-1">
          Architectural parameters, capacity thresholds, and system health status.
        </p>
      </div>

      {/* Facility Topology Card */}
      <Card
        title="Parking Facility Inventory & Capacity"
        subtitle="Current active inventory by bay classification"
        action={
          <Link to="/admin/slots">
            <Button variant="secondary" size="sm">
              <ParkingSquare className="w-4 h-4 mr-1.5" /> Manage Bays <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Capacity</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats?.dash?.totalSlots ?? stats?.slots?.total ?? 100} Bays
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold uppercase">Available</span>
            <p className="text-2xl font-black text-emerald-800 mt-1">
              {stats?.dash?.availableSlots ?? stats?.slots?.available ?? 70} Bays
            </p>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-xs text-rose-700 font-semibold uppercase">Occupied</span>
            <p className="text-2xl font-black text-rose-800 mt-1">
              {stats?.dash?.occupiedSlots ?? stats?.slots?.occupied ?? 25} Bays
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-700 font-semibold uppercase">Reserved</span>
            <p className="text-2xl font-black text-amber-800 mt-1">
              {stats?.dash?.reservedSlots ?? stats?.slots?.reserved ?? 5} Bays
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-sm flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 text-sky-600 mt-0.5" />
          <p className="text-xs text-sky-800 leading-relaxed">
            <strong>Configuration Notice:</strong> Parking bays, vehicle clearance requirements, and individual sensor assignments are managed in real-time through the{' '}
            <Link to="/admin/slots" className="font-bold underline text-navy-700">
              Slot Management
            </Link>{' '}
            console.
          </p>
        </div>
      </Card>

      {/* Runtime Environment Info */}
      <Card title="Runtime & Environment Specification">
        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Frontend Client Version</span>
            <span className="font-mono font-semibold text-slate-800">v1.0.0 (React 18 + Vite)</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Backend API Target</span>
            <span className="font-mono font-semibold text-slate-800">
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080 (Proxy)'}
            </span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Telemetry Refresh Rate</span>
            <span className="font-mono font-semibold text-slate-800">15s / 30s Polling</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Authentication Protocol</span>
            <span className="font-mono font-semibold text-slate-800">JWT Bearer via Header</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
