import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { UserSummary, DepartmentSummary, UserRole, AccountStatus } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Plus,
  Search,
  Filter,
  KeyRound,
  Edit2,
  UserX,
  UserCheck,
  FileUp,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);

  // Selected user for modal actions
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [targetStatus, setTargetStatus] = useState<AccountStatus>('INACTIVE');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    departmentId: '',
    role: 'EMPLOYEE' as UserRole,
    status: 'ACTIVE' as AccountStatus,
    password: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        api.get<{ success: boolean; users: UserSummary[] }>('/admin/users'),
        api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments'),
      ]);

      if (usersRes.success) setUsers(usersRes.users);
      if (deptsRes.success) setDepartments(deptsRes.departments);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(search.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchesDept = deptFilter === 'ALL' || u.departmentId === deptFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [users, search, roleFilter, statusFilter, deptFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      departmentId: departments[0]?.id || '',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      password: 'TemporaryPass123!',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Name, email, and temporary password are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.post<{ success: boolean; user: UserSummary }>('/admin/users', formData);
      if (res.success) {
        toast.success(`User ${res.user.name} added successfully.`);
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user account.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (user: UserSummary) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      employeeId: user.employeeId || '',
      departmentId: user.departmentId || '',
      role: user.role,
      status: user.status,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setFormSubmitting(true);
      const res = await api.patch<{ success: boolean; user: UserSummary }>(
        `/admin/users/${selectedUser.id}`,
        {
          name: formData.name,
          role: formData.role,
          departmentId: formData.departmentId || null,
          status: formData.status,
          employeeId: formData.employeeId || null,
        }
      );
      if (res.success) {
        toast.success('User updated successfully.');
        setIsEditModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenStatusConfirm = (user: UserSummary, newStatus: AccountStatus) => {
    setSelectedUser(user);
    setTargetStatus(newStatus);
    setIsConfirmStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;
    try {
      setFormSubmitting(true);
      await api.patch(`/admin/users/${selectedUser.id}/status`, { status: targetStatus });
      toast.success(`Account status changed to ${targetStatus}.`);
      setIsConfirmStatusModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenResetPassword = (user: UserSummary) => {
    setSelectedUser(user);
    setNewPassword('SecureTempPass' + Math.floor(100 + Math.random() * 900) + '!');
    setIsResetPasswordModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      setFormSubmitting(true);
      await api.post(`/admin/users/${selectedUser.id}/reset-password`, {
        newPassword,
      });
      toast.success(`Password reset for ${selectedUser.name}.`);
      setIsResetPasswordModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste or upload CSV content.');
      return;
    }
    try {
      setFormSubmitting(true);
      const res = await api.post<{ success: boolean; createdCount: number; errors?: string[] }>(
        '/admin/users/import-csv',
        { csvContent }
      );
      if (res.success) {
        toast.success(`Imported ${res.createdCount} users successfully!`);
        setIsCsvModalOpen(false);
        setCsvContent('');
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to import CSV.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ECFDF3] text-[#027A48]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" /> Active
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F2F4F7] text-[#475467]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#98A2B3]" /> Inactive
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF3F2] text-[#B42318]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]" /> Suspended
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEF4FF] text-brand border border-[#D0D5DD]">
            Admin
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
            Technician
          </span>
        );
      case 'EMPLOYEE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F9FAFB] text-[#344054] border border-[#EAECF0]">
            Employee
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="User Directory & Access"
          subtitle="Manage enterprise employees, technician specializations, and administrative accounts."
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'User Management' },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            iconLeft={<FileUp className="w-3.5 h-3.5" />}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            iconLeft={<Plus className="w-3.5 h-3.5" />}
          >
            Add user
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-lg border border-border bg-surface flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="TECHNICIAN">Technicians</option>
            <option value="EMPLOYEE">Employees</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-text-primary">No users found</p>
            <p className="text-xs text-text-muted mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-[#F9FAFB] text-text-secondary font-medium">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <div className="font-semibold text-text-primary">{u.name}</div>
                          <div className="text-[11px] text-text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {u.department?.name || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-[11px]">
                      {u.employeeId || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(u.status)}</td>
                    <td className="px-4 py-3 text-text-muted text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 rounded text-text-muted hover:text-brand hover:bg-[#F2F4F7] transition-colors"
                          title="Edit user details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenResetPassword(u)}
                          className="p-1 rounded text-text-muted hover:text-[#F79009] hover:bg-[#F2F4F7] transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {u.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusConfirm(u, 'INACTIVE')}
                            className="p-1 rounded text-text-muted hover:text-[#D92D20] hover:bg-[#F2F4F7] transition-colors"
                            title="Deactivate account"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusConfirm(u, 'ACTIVE')}
                            className="p-1 rounded text-text-muted hover:text-[#12B76A] hover:bg-[#F2F4F7] transition-colors"
                            title="Activate account"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Enterprise User"
        description="Provision a new employee, technician, or administrator account."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <TextInput
            label="Full name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rachel Adams"
          />

          <TextInput
            label="Email address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="rachel.adams@helpdesk.local"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Employee ID (Optional)"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="EMP-1049"
            />

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as AccountStatus })
                }
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <TextInput
            label="Temporary password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 8 chars with letter & number"
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formSubmitting}>
              Create account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Details"
        description={`Update account profile and system permissions for ${selectedUser?.name}.`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <TextInput
            label="Full name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextInput
            label="Email address"
            disabled
            value={formData.email}
            helperText="Email address cannot be modified once provisioned."
          />

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            />

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as AccountStatus })
                }
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Reset User Password"
        description={`Set a new temporary password for ${selectedUser?.name} (${selectedUser?.email}).`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <TextInput
            label="New temporary password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="The user will use this password on next login."
          />

          <div className="p-3 rounded bg-[#F7F8FA] border border-border text-[11px] text-text-muted">
            The password hash will be updated securely using bcrypt. Plaintext passwords are never stored.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={formSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Confirmation Modal */}
      <Modal
        isOpen={isConfirmStatusModalOpen}
        onClose={() => setIsConfirmStatusModalOpen(false)}
        title="Confirm Account Status Change"
        description={`Are you sure you want to mark ${selectedUser?.name}'s account as ${targetStatus}?`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice for user state change</p>
              <p className="mt-0.5">
                {targetStatus === 'INACTIVE'
                  ? 'Inactive accounts cannot authenticate. Historical ticket records, comments, and audit histories will be preserved safely.'
                  : targetStatus === 'SUSPENDED'
                  ? 'Suspended accounts will immediately lose access on all active sessions.'
                  : 'Active accounts will be granted login access immediately.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsConfirmStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmStatusChange}
              isLoading={formSubmitting}
            >
              Confirm {targetStatus}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Import Users via CSV"
        description="Bulk import enterprise users into HelpDesk 360 directory."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              CSV Format: name,email,role,department,employeeId
            </label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`name,email,role,department,employeeId\nJohn Doe,john.doe@company.com,EMPLOYEE,Sales,EMP-2001\nSarah Connor,sarah.c@company.com,TECHNICIAN,IT Support,EMP-2002`}
              className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCsvModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportCsv} isLoading={formSubmitting}>
              Import users
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
