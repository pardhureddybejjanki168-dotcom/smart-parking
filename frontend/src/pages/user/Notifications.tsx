import React, { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../../api/client';
import { Notification } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { Bell, CheckCheck, Clock, Info } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(15);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list({ page, size });
      const data = (res as any)?.data || res;
      if (Array.isArray(data)) {
        setNotifications(data);
        setTotalPages(1);
      } else if (data?.content) {
        setNotifications(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotifications([]);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, size, setTotalPages]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (notif: Notification) => {
    if (notif.read) return;
    try {
      await notificationApi.markRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay informed about your bay reservations, session entries, and system announcements.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleMarkAllRead}
          loading={markingAll}
          disabled={notifications.every((n) => n.read)}
        >
          <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description="You are all caught up! No alerts or updates at this time."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition cursor-pointer ${
                  n.read ? 'bg-white hover:bg-slate-50' : 'bg-sky-50/40 hover:bg-sky-50/70'
                }`}
              >
                <div
                  className={`p-2.5 rounded-full shrink-0 ${
                    n.read
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-navy-700 text-white shadow-sm'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm ${
                        n.read ? 'text-slate-800 font-normal' : 'text-slate-900 font-bold'
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">
                      {n.createdAt
                        ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                        : 'recently'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-navy-700 shrink-0 self-center" />
                )}
              </div>
            ))}
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
    </div>
  );
};
