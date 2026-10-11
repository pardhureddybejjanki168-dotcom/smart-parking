import React, { useState, useEffect, useCallback } from 'react';
import { sessionApi, reportApi } from '../../api/client';
import { ParkingRecord } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { History, Download, Filter, Clock } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import toast from 'react-hot-toast';

export const ParkingHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(10);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sessionApi.history({
        page,
        size,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const data = (res as any)?.data || res;
      if (Array.isArray(data)) {
        setRecords(data);
        setTotalPages(1);
      } else if (data?.content) {
        setRecords(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setRecords([]);
      }
    } catch {
      toast.error('Failed to load parking history');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, statusFilter, startDate, endDate, setTotalPages]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await reportApi.exportCsv({ type: 'sessions' });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parking-sessions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV report exported');
    } catch {
      toast.error('Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  };

  const calculateDuration = (entry: string, exit?: string) => {
    if (!exit) return 'In Session';
    const mins = differenceInMinutes(new Date(exit), new Date(entry));
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hours}h ${rem}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parking Session History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical logs of all parking durations, check-ins, and departures.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExportCsv} loading={exporting}>
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:w-72">
          <SearchInput
            placeholder="Search vehicle plate number..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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
              <option value="COMPLETED">Completed</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Parking Records Found"
            description="No sessions match the specified filters or date criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4">Exit Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      #{r.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {r.vehicleNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-navy-700">
                      Slot {r.slotNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {format(new Date(r.entryTime), 'PP p')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {r.exitTime ? format(new Date(r.exitTime), 'PP p') : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium text-xs">
                      {calculateDuration(r.entryTime, r.exitTime)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={r.status} />
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
