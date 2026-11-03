import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AssetItem, DepartmentSummary, UserSummary, ASSET_STATUS_CONFIG } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Laptop, Plus, Search, Edit2, Loader2, HardDrive, Smartphone, Monitor, Server, Wifi } from 'lucide-react';

export const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    type: 'LAPTOP',
    model: '',
    serialNumber: '',
    status: 'IN_USE',
    assignedUserId: '',
    departmentId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [assetsRes, deptsRes, usersRes] = await Promise.all([
        api.get<{ success: boolean; assets: AssetItem[] }>('/assets'),
        api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments'),
        api.get<{ success: boolean; users: UserSummary[] }>('/admin/users'),
      ]);

      if (assetsRes.success) setAssets(assetsRes.assets);
      if (deptsRes.success) setDepartments(deptsRes.departments);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load IT assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (a.assignedUser && a.assignedUser.name.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setFormData({
      assetTag: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      type: 'LAPTOP',
      model: '',
      serialNumber: '',
      status: 'IN_USE',
      assignedUserId: '',
      departmentId: departments[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: AssetItem) => {
    setEditingAsset(asset);
    setFormData({
      assetTag: asset.assetTag,
      name: asset.name,
      type: asset.type,
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      status: asset.status,
      assignedUserId: asset.assignedUserId || '',
      departmentId: asset.departmentId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetTag.trim() || !formData.name.trim()) {
      toast.error('Asset tag and name are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingAsset) {
        await api.patch(`/assets/${editingAsset.id}`, formData);
        toast.success(`Asset ${formData.assetTag} updated.`);
      } else {
        await api.post('/assets', formData);
        toast.success(`Asset ${formData.assetTag} created.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = ASSET_STATUS_CONFIG[status as keyof typeof ASSET_STATUS_CONFIG] || {
      label: status,
      color: '#475467',
      bgColor: '#F2F4F7',
    };
    return (
      <span
        className="px-2 py-0.5 rounded text-[11px] font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LAPTOP':
        return <Laptop className="w-4 h-4 text-brand" />;
      case 'MONITOR':
        return <Monitor className="w-4 h-4 text-[#2E90FA]" />;
      case 'SERVER':
        return <Server className="w-4 h-4 text-[#12B76A]" />;
      case 'NETWORK_EQUIPMENT':
        return <Wifi className="w-4 h-4 text-[#F79009]" />;
      case 'MOBILE':
        return <Smartphone className="w-4 h-4 text-[#7A5AF8]" />;
      default:
        return <HardDrive className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="IT Asset & Hardware Inventory"
          subtitle="Maintain track of enterprise laptops, workstations, peripherals, and network hardware."
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'IT Assets' },
          ]}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          iconLeft={<Plus className="w-3.5 h-3.5" />}
        >
          Add asset
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-lg border border-border bg-surface flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tag, name, serial number, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="ALL">All Hardware Types</option>
          <option value="LAPTOP">Laptops</option>
          <option value="DESKTOP">Desktops</option>
          <option value="MONITOR">Monitors</option>
          <option value="SERVER">Servers</option>
          <option value="NETWORK_EQUIPMENT">Network Gear</option>
          <option value="MOBILE">Mobile Devices</option>
          <option value="ACCESSORY">Accessories</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="ALL">All Statuses</option>
          <option value="IN_USE">In Use</option>
          <option value="IN_STORAGE">In Storage</option>
          <option value="UNDER_REPAIR">Under Repair</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading hardware assets...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center">
            <Laptop className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium text-text-primary">No assets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-[#F9FAFB] text-text-secondary font-medium">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Tag</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Serial / Model</th>
                  <th className="px-4 py-3">Assigned User</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(asset.type)}
                        <span className="font-semibold text-text-primary">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-brand">{asset.assetTag}</td>
                    <td className="px-4 py-3 text-text-secondary capitalize">
                      {asset.type.replace('_', ' ').toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-text-muted font-mono text-[11px]">
                      {asset.serialNumber || asset.model || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {asset.assignedUser ? (
                        asset.assignedUser.name
                      ) : (
                        <span className="text-text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {asset.department?.name || '—'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(asset.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(asset)}
                        className="p-1 rounded text-text-muted hover:text-brand hover:bg-[#F2F4F7] transition-colors"
                        title="Edit asset details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? 'Edit Asset' : 'Add IT Asset'}
        description="Record hardware details and assign to employee."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Asset Tag"
              required
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value.toUpperCase() })}
              placeholder="AST-1001"
            />
            <TextInput
              label="Asset Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="MacBook Pro 16"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Hardware Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="LAPTOP">Laptop</option>
                <option value="DESKTOP">Desktop Workstation</option>
                <option value="MONITOR">Monitor / Display</option>
                <option value="SERVER">Server</option>
                <option value="NETWORK_EQUIPMENT">Network Gear</option>
                <option value="MOBILE">Mobile Phone / Tablet</option>
                <option value="ACCESSORY">Peripheral / Accessory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="IN_USE">In Use</option>
                <option value="IN_STORAGE">In Storage</option>
                <option value="UNDER_REPAIR">Under Repair</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Apple M3 Pro 36GB"
            />
            <TextInput
              label="Serial Number"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="C02G45..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Assigned Employee</label>
              <select
                value={formData.assignedUserId}
                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">Unassigned (In Inventory)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingAsset ? 'Save changes' : 'Create asset'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
