import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi, sessionApi, reportApi } from '../../api/client';
import { AdminDashboard, ParkingRecord } from '../../types';
import { usePolling } from '../../hooks/usePolling';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import {
  Users,
  Car,
  ParkingSquare,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Activity,
  CheckCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [recentSessions, setRecentSessions] = useState<ParkingRecord[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [slotTypeData, setSlotTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, sessRes, repRes] = await Promise.allSettled([
        dashboardApi.admin(),
        sessionApi.history({ page: 0, size: 5 }),
        reportApi.analytics('7days'),
      ]);

      if (statsRes.status === 'fulfilled') {
        const val = (statsRes.value as any)?.data || statsRes.value;
        setStats(val);
      }
      if (sessRes.status === 'fulfilled') {
        const val = (sessRes.value as any)?.data || sessRes.value;
        setRecentSessions(Array.isArray(val) ? val : val?.content || []);
      }
      if (repRes.status === 'fulfilled') {
        const val = (repRes.value as any)?.data || repRes.value;
        if (val?.dailyEntries) {
          setOccupancyData(val.dailyEntries);
        }
        if (val?.utilizationByType) {
          setSlotTypeData(val.utilizationByType);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling every 30s
  usePolling(loadData, 30000);

  if (loading && !stats) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const defaultOccupancy = [
    { date: '08:00', entries: 12, exits: 3 },
    { date: '10:00', entries: 28, exits: 8 },
    { date: '12:00', entries: 45, exits: 25 },
    { date: '14:00', entries: 35, exits: 30 },
    { date: '16:00', entries: 20, exits: 42 },
    { date: '18:00', entries: 15, exits: 38 },
  ];

  const defaultSlotDist = [
    { type: '4-Wheeler', count: 50 },
    { type: '2-Wheeler', count: 30 },
    { type: 'EV', count: 15 },
    { type: 'Accessible', count: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin System Command</h1>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            REALTIME TELEMETRY
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Complete facility overview, live capacity monitoring, and system metrics.
        </p>
      </div>

      {/* 8 StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          color="navy"
        />
        <StatCard
          icon={Car}
          label="Total Vehicles"
          value={stats?.totalVehicles ?? 0}
          color="blue"
        />
        <StatCard
          icon={ParkingSquare}
          label="Total Slots"
          value={stats?.totalSlots ?? 0}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Available Bays"
          value={stats?.availableSlots ?? 0}
          color="emerald"
        />
        <StatCard
          icon={AlertOctagon}
          label="Occupied Bays"
          value={stats?.occupiedSlots ?? 0}
          color="rose"
        />
        <StatCard
          icon={Calendar}
          label="Reserved Bays"
          value={stats?.reservedSlots ?? 0}
          color="amber"
        />
        <StatCard
          icon={Activity}
          label="Active Sessions"
          value={stats?.activeSessions ?? 0}
          color="navy"
        />
        <StatCard
          icon={CheckCheck}
          label="Completed Today"
          value={stats?.completedToday ?? 0}
          color="emerald"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Traffic Volume & Flow" subtitle="Real-time check-in and checkout events">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyData.length > 0 ? occupancyData : defaultOccupancy}>
                  <defs>
                    <linearGradient id="adminEntry" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminExit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#7c3aed"
                    fill="url(#adminEntry)"
                    name="Entries"
                  />
                  <Area
                    type="monotone"
                    dataKey="exits"
                    stroke="#10b981"
                    fill="url(#adminExit)"
                    name="Exits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Bay Type Capacity" subtitle="Distribution of bays across facility">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slotTypeData.length > 0 ? slotTypeData : defaultSlotDist}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <Card title="Recent Parking Activity" subtitle="Latest session events logged">
        {recentSessions.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No recent sessions recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSessions.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{rec.vehicleNumber}</span>
                      <span className="text-xs text-slate-400">in</span>
                      <span className="font-bold text-navy-700">Slot #{rec.slotNumber}</span>
                      <Badge status={rec.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Entry: {format(new Date(rec.entryTime), 'PP p')}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {rec.exitTime ? (
                    <span>Exit: {format(new Date(rec.exitTime), 'p')}</span>
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
    </div>
  );
};
