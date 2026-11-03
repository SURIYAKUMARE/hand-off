import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { Avatar } from '../components/common/Avatar';
import {
  UserCircle,
  KeyRound,
  Shield,
  Building2,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  SPECIALIZATION_CONFIG,
  TECHNICIAN_STATUS_CONFIG,
  TechnicianStatus,
  TechnicianSpecialization,
} from '@helpdesk360/shared';

export const Profile: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Technician profile state
  const [techStatus, setTechStatus] = useState<TechnicianStatus>('AVAILABLE');
  const [techSpec, setTechSpec] = useState<TechnicianSpecialization>('GENERAL_IT');
  const [techLoading, setTechLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.technicianProfile) {
        setTechStatus(user.technicianProfile.status as TechnicianStatus);
        setTechSpec(user.technicianProfile.specialization as TechnicianSpecialization);
      }
    }
  }, [user]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    try {
      setProfileLoading(true);
      const res = await api.patch<{ success: boolean; user: any }>('/profile', { name });
      if (res.success) {
        toast.success('Profile details updated successfully.');
        await refetchUser();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.post<{ success: boolean }>('/profile/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        toast.success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateTechnicianSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTechLoading(true);
      await api.patch(`/admin/technicians/${user?.id}/profile`, {
        specialization: techSpec,
        status: techStatus,
      });
      toast.success('Technician status updated.');
      await refetchUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update technician settings.');
    } finally {
      setTechLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account Profile & Security"
        subtitle="Manage your personal details, credentials, and operational availability."
        breadcrumbs={[{ label: 'Account Profile' }]}
      />

      {/* Account Overview Header Card */}
      <div className="p-6 rounded-lg border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || 'User'} size="lg" />
          <div>
            <h2 className="text-base font-bold text-text-primary">{user?.name}</h2>
            <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEF4FF] text-brand border border-[#D0D5DD]">
                {user?.role}
              </span>
              {user?.department && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F2F4F7] text-text-secondary">
                  {user.department.name}
                </span>
              )}
              {user?.employeeId && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-text-muted border border-border">
                  {user.employeeId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="p-5 rounded-lg border border-border bg-surface flex flex-col justify-between">
          <form onSubmit={handleUpdateName} className="space-y-4">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-brand" /> Personal Details
            </h3>

            <TextInput
              label="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextInput
              label="Email address"
              disabled
              value={user?.email || ''}
              helperText="Email is bound to your enterprise SSO identity."
            />

            <div className="pt-2">
              <Button variant="primary" size="sm" type="submit" isLoading={profileLoading}>
                Save profile
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-5 rounded-lg border border-border bg-surface flex flex-col justify-between">
          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand" /> Change Password
            </h3>

            <PasswordInput
              label="Current password"
              required
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <PasswordInput
              label="New password"
              required
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <PasswordInput
              label="Confirm new password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="pt-1">
              <Button variant="primary" size="sm" type="submit" isLoading={passwordLoading}>
                Update password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Technician Specialization & Availability Settings */}
      {user?.role === 'TECHNICIAN' && (
        <div className="p-5 rounded-lg border border-border bg-surface">
          <form onSubmit={handleUpdateTechnicianSettings} className="space-y-4">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F79009]" /> Technician Dispatch Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Availability Status
                </label>
                <select
                  value={techStatus}
                  onChange={(e) => setTechStatus(e.target.value as TechnicianStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="AVAILABLE">Available (Receives automatic ticket assignments)</option>
                  <option value="BUSY">Busy (Reduced incoming automated routing)</option>
                  <option value="UNAVAILABLE">Unavailable (Off duty / On leave)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Primary Specialization
                </label>
                <select
                  value={techSpec}
                  onChange={(e) => setTechSpec(e.target.value as TechnicianSpecialization)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="GENERAL_IT">General IT Support</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="NETWORK">Network & VPN</option>
                  <option value="SOFTWARE">Software & Database</option>
                  <option value="ACCOUNT_ACCESS">Account Access & Identity</option>
                </select>
              </div>
            </div>

            <Button variant="primary" size="sm" type="submit" isLoading={techLoading}>
              Update dispatch status
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
