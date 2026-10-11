import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  dashboardApi,
  sessionApi,
  reservationApi,
  notificationApi,
  reportApi,
} from '../../api/client';
import {
  UserDashboard,
  ParkingRecord,
  Reservation,
  Notification,
} from '../../types';
import { usePolling } from '../../hooks/usePolling';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ParkingSquare,
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  Bell,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';

export const UserDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<UserDashboard | null>(null);
  const [activeSessions, setActiveSessions] = useState<ParkingRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, sessionsRes, resRes, notifRes, reportRes] = await Promise.allSettled([
        dashboardApi.user(),
        sessionApi.active(),
        reservationApi.list({ page: 0, size: 3, tab: 'upcoming' }),
        notificationApi.list({ page: 0, size: 3 }),
        reportApi.analytics('7days'),
      ]);

      if (statsRes.status === 'fulfilled') {
        const val = (statsRes.value as any)?.data || statsRes.value;
        setStats(val);
      }
      if (sessionsRes.status === 'fulfilled') {
        const val = (sessionsRes.value as any)?.data || sessionsRes.value;
        setActiveSessions(Array.isArray(val) ? val : val?.content || []);
      }
      if (resRes.status === 'fulfilled') {
        const val = (resRes.value as any)?.data || resRes.value;
        const list = Array.isArray(val) ? val : val?.content || [];
        setReservations(list.slice(0, 3));
      }
      if (notifRes.status === 'fulfilled') {
        const val = (notifRes.value as any)?.data || notifRes.value;
        const list = Array.isArray(val) ? val : val?.content || [];
        setNotifications(list.slice(0, 3));
      }
      if (reportRes.status === 'fulfilled') {
        const val = (reportRes.value as any)?.data || reportRes.value;
        if (val?.dailyEntries && Array.isArray(val.dailyEntries)) {
          setChartData(val.dailyEntries);
        } else {
          // Fallback recent 7 days default
          setChartData([
            { date: 'Mon', entries: 3, exits: 2 },
            { date: 'Tue', entries: 5, exits: 4 },
            { date: 'Wed', entries: 6, exits: 5 },
            { date: 'Thu', entries: 4, exits: 4 },
            { date: 'Fri', entries: 8, exits: 7 },
            { date: 'Sat', entries: 9, exits: 8 },
            { date: 'Sun', entries: 7, exits: 6 },
          ]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 30 seconds
  usePolling(loadData, 30000);

  if (loading && !stats) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live parking status, reservations, and telemetry</p>
        </div>
        <div className="flex gap-2">
          <Link to="/reserve">
            <Button variant="primary">
              <Calendar className="w-4 h-4 mr-1.5" /> Book a Slot
            </Button>
          </Link>
          <Link to="/slots">
            <Button variant="secondary">
              <ParkingSquare className="w-4 h-4 mr-1.5" /> View Parking Map
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={ParkingSquare}
          label="Total Slots"
          value={stats?.totalSlots ?? 0}
          color="navy"
        />
        <StatCard
          icon={CheckCircle2}
          label="Available"
          value={stats?.availableSlots ?? 0}
          color="emerald"
        />
        <StatCard
          icon={Car}
          label="Occupied"
          value={stats?.occupiedSlots ?? 0}
          color="rose"
        />
        <StatCard
          icon={Calendar}
          label="Reserved"
          value={stats?.reservedSlots ?? 0}
          color="amber"
        />
        <StatCard
          icon={Clock}
          label="My Active Sessions"
          value={stats?.userActiveSessions ?? activeSessions.length}
          color="blue"
        />
        <StatCard
          icon={Car}
          label="My Vehicles"
          value={stats?.userVehicles ?? 0}
          color="purple"
        />
      </div>

      {/* Active Sessions Alert Banner if any */}
      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white p-5 rounded-2xl shadow-sm border border-navy-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-semibold text-base">You have {activeSessions.length} active parking session(s)</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Slot #{activeSessions[0].slotNumber} • Vehicle {activeSessions[0].vehicleNumber} • Started{' '}
                  {formatDistanceToNow(new Date(activeSessions[0].entryTime), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Link to="/sessions">
              <Button variant="secondary" size="sm" className="bg-white text-navy-800 hover:bg-slate-100">
                Manage Session <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Chart & Upcoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart (2 columns) */}
        <div className="lg:col-span-2">
          <Card
            title="Parking Activity Trend"
            subtitle="Entries and exits recorded over the past 7 days"
            action={
              <Link to="/reports" className="text-xs font-semibold text-navy-700 hover:underline flex items-center">
                Detailed Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            }
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#0284c7"
                    fillOpacity={1}
                    fill="url(#colorEntries)"
                    name="Entries"
                  />
                  <Area
                    type="monotone"
                    dataKey="exits"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorExits)"
                    name="Exits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Upcoming Reservations (1 column) */}
        <div>
          <Card
            title="Upcoming Bookings"
            subtitle="Next reserved spots"
            action={
              <Link to="/reservations" className="text-xs font-semibold text-navy-700 hover:underline">
                View All
              </Link>
            }
          >
            {reservations.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Bookings"
                description="Reserve a parking slot ahead of your journey."
                actionLabel="Book Slot"
                onAction={() => (window.location.href = '/reserve')}
              />
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          Slot {res.slotNumber || res.slotId}
                        </span>
                        <Badge status={res.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(res.startTime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Link to="/reservations">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Notifications Row */}
      <Card
        title="Recent Alerts & Updates"
        subtitle="Latest system notices"
        action={
          <Link to="/notifications" className="text-xs font-semibold text-navy-700 hover:underline">
            All Notifications
          </Link>
        }
      >
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No notifications at this time.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div key={notif.id} className="py-3 flex items-start gap-3">
                <div
                  className={`p-2 rounded-full mt-0.5 shrink-0 ${
                    notif.read ? 'bg-slate-100 text-slate-400' : 'bg-sky-100 text-sky-600'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.read ? 'text-slate-700 font-normal' : 'text-slate-900 font-semibold'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
