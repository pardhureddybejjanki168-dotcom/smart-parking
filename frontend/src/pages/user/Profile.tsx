import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Phone, Calendar, Shield, Save } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error('Full name and phone cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ fullName, phone });
      const updated = (res as any)?.data || res;
      if (updated && updated.id) {
        updateUser(updated);
      } else if (user) {
        updateUser({ ...user, fullName, phone });
      }
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and contact phone number.
        </p>
      </div>

      <Card>
        {/* User Badge Top Banner */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="w-16 h-16 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-2xl shadow">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={user?.role || 'USER'} />
              <span className="text-xs text-slate-400">
                Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">
              Note: Email address modifications are restricted. Contact admin to change email.
            </p>
          </div>

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
