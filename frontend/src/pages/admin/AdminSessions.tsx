import React, { useState, useEffect, useCallback } from 'react';
import { adminSessionApi } from '../../api/client';
import { ParkingRecord } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { Activity, Clock, Car, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminSessionsPage: React.FC = () => {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [sessions, setSessions] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(10);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'active') {
        const res = await adminSessionApi.active({ page, size });
        const data = (res as any)?.data || res;
        if (Array.isArray(data)) {
          setSessions(data);
          setTotalPages(1);
        } else if (data?.content) {
          setSessions(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setSessions([]);
        }
      } else {
        const res = await adminSessionApi.history({
          page,
          size,
          search: search || undefined,
        });
        const data = (res as any)?.data || res;
        if (Array.isArray(data)) {
          setSessions(data);
          setTotalPages(1);
        } else if (data?.content) {
          setSessions(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setSessions([]);
        }
      }
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [tab, page, size, search, setTotalPages]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parking Sessions Oversight</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor all active on-site vehicles and inspect historical arrival/departure sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setTab('active');
              setPage(0);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'active'
                ? 'border-purple-600 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Active Sessions ({tab === 'active' ? sessions.length : '...'})
          </button>
          <button
            onClick={() => {
              setTab('history');
              setPage(0);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'history'
                ? 'border-purple-600 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            All History Records
          </button>
        </nav>
      </div>

      {/* Search Bar for History */}
      {tab === 'history' && (
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search vehicle plate number..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Activity}
            title={tab === 'active' ? 'No Active Sessions' : 'No History Found'}
            description={
              tab === 'active'
                ? 'No vehicles are currently occupying bays.'
                : 'No historical parking session logs matched.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Bay</th>
                  <th className="py-3 px-4">Driver User ID</th>
                  <th className="py-3 px-4">Entry Time</th>
                  {tab === 'active' ? (
                    <th className="py-3 px-4">Elapsed Duration</th>
                  ) : (
                    <th className="py-3 px-4">Exit Time</th>
                  )}
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      #{s.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.vehicleNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-700">Slot {s.slotNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                      {s.userId?.slice(0, 8) || 'SYSTEM'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {format(new Date(s.entryTime), 'PP p')}
                    </td>
                    {tab === 'active' ? (
                      <td className="py-3.5 px-4 font-semibold text-purple-700 text-xs">
                        {formatDistanceToNow(new Date(s.entryTime))}
                      </td>
                    ) : (
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {s.exitTime ? format(new Date(s.exitTime), 'PP p') : '—'}
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <Badge status={s.status} />
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
    </div>
  );
};
