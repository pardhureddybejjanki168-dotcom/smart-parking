import React, { useState, useEffect, useCallback } from 'react';
import { adminUserApi } from '../../api/client';
import { User, Role } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { Users, Eye, Power, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const { page, setPage, size, totalPages, setTotalPages } = usePagination(10);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.list({
        page,
        size,
        search: search || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        active: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
      });

      const data = (res as any)?.data || res;
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
      } else if (data?.content) {
        setUsers(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setUsers([]);
      }
    } catch {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, roleFilter, statusFilter, setTotalPages]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async () => {
    if (!userToToggle) return;
    setToggleLoading(true);
    try {
      if (userToToggle.active) {
        await adminUserApi.deactivate(userToToggle.id);
        toast.success(`User ${userToToggle.fullName} deactivated`);
      } else {
        await adminUserApi.activate(userToToggle.id);
        toast.success(`User ${userToToggle.fullName} activated`);
      }
      setUserToToggle(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory & Roles</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage system driver accounts, administrative credentials, and active statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search by name or email..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

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
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No user records matched your search query or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {u.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.fullName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{u.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={u.role}>{u.role}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={u.active ? 'AVAILABLE' : 'MAINTENANCE'}>
                        {u.active ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingUser(u)}
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToToggle(u)}
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          <Power
                            className={`w-4 h-4 ${
                              u.active ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          />
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

      {/* User Detail Modal */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="User Profile Details"
      >
        {viewingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-lg">
                {viewingUser.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{viewingUser.fullName}</h3>
                <p className="text-xs text-slate-500">{viewingUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Phone</span>
                <p className="font-medium text-slate-800 mt-1">{viewingUser.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Role</span>
                <p className="mt-1">
                  <Badge status={viewingUser.role}>{viewingUser.role}</Badge>
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Account Status</span>
                <p className="mt-1">
                  <Badge status={viewingUser.active ? 'AVAILABLE' : 'MAINTENANCE'}>
                    {viewingUser.active ? 'Active' : 'Deactivated'}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Member Since</span>
                <p className="font-medium text-slate-800 mt-1">
                  {viewingUser.createdAt ? format(new Date(viewingUser.createdAt), 'PP') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToToggle}
        title={userToToggle?.active ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${
          userToToggle?.active ? 'deactivate' : 'activate'
        } ${userToToggle?.fullName}?`}
        confirmText={userToToggle?.active ? 'Deactivate' : 'Activate'}
        variant={userToToggle?.active ? 'danger' : 'primary'}
        loading={toggleLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setUserToToggle(null)}
      />
    </div>
  );
};
