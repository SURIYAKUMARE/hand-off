import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  TechnicianWorkloadItem,
  TechnicianSpecialization,
  TechnicianStatus,
  SPECIALIZATION_CONFIG,
  TECHNICIAN_STATUS_CONFIG,
} from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { TextInput } from '../../components/common/TextInput';
import { useToast } from '../../context/ToastContext';
import {
  UserCheck,
  Shield,
  Layers,
  ArrowRightLeft,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';

export const TechnicianManagement: React.FC = () => {
  const [technicians, setTechnicians] = useState<TechnicianWorkloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [specFilter, setSpecFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<TechnicianWorkloadItem | null>(null);

  // Form states
  const [editSpecialization, setEditSpecialization] =
    useState<TechnicianSpecialization>('GENERAL_IT');
  const [editStatus, setEditStatus] = useState<TechnicianStatus>('AVAILABLE');
  const [targetTechId, setTargetTechId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; technicians: TechnicianWorkloadItem[] }>(
        '/admin/technicians'
      );
      if (res.success) {
        setTechnicians(res.technicians);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load technician capacity.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTechnicians = technicians.filter((t) => {
    const matchesSpec = specFilter === 'ALL' || t.specialization === specFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSpec && matchesStatus;
  });

  const handleOpenEdit = (tech: TechnicianWorkloadItem) => {
    setSelectedTech(tech);
    setEditSpecialization(tech.specialization);
    setEditStatus(tech.status);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;

    try {
      setSubmitting(true);
      const res = await api.patch<{ success: boolean }>(
        `/admin/technicians/${selectedTech.technicianId}/profile`,
        {
          specialization: editSpecialization,
          status: editStatus,
        }
      );
      if (res.success) {
        toast.success(`Updated profile for ${selectedTech.name}.`);
        setIsEditModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update technician.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReassign = (tech: TechnicianWorkloadItem) => {
    setSelectedTech(tech);
    const otherTech = technicians.find((t) => t.technicianId !== tech.technicianId);
    setTargetTechId(otherTech ? otherTech.technicianId : '');
    setIsReassignModalOpen(true);
  };

  const handleExecuteReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech || !targetTechId) return;

    try {
      setSubmitting(true);
      const res = await api.post<{ success: boolean; count: number }>('/admin/technicians/reassign', {
        fromTechnicianId: selectedTech.technicianId,
        toTechnicianId: targetTechId,
      });
      if (res.success) {
        toast.success(`Successfully reassigned ${res.count} active tickets.`);
        setIsReassignModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reassign tickets.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tech: TechnicianWorkloadItem, newStatus: TechnicianStatus) => {
    try {
      await api.patch(`/admin/technicians/${tech.technicianId}/profile`, {
        specialization: tech.specialization,
        status: newStatus,
      });
      toast.success(`${tech.name} status updated to ${newStatus}.`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle availability.');
    }
  };

  const getStatusBadge = (status: TechnicianStatus) => {
    const config = TECHNICIAN_STATUS_CONFIG[status];
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
        {config.label}
      </span>
    );
  };

  const getSpecializationBadge = (spec: TechnicianSpecialization) => {
    const config = SPECIALIZATION_CONFIG[spec];
    return (
      <span
        className="px-2 py-0.5 rounded text-[11px] font-medium border"
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.borderColor,
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Workload & Routing"
        subtitle="Manage technician specializations, real-time availability, ticket volume, and workload balance."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Technicians' },
        ]}
      />

      {/* Filter and Overview Bar */}
      <div className="p-3 rounded-lg border border-border bg-surface flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="ALL">All Specializations</option>
            <option value="HARDWARE">Hardware</option>
            <option value="NETWORK">Network</option>
            <option value="SOFTWARE">Software</option>
            <option value="ACCOUNT_ACCESS">Account Access</option>
            <option value="GENERAL_IT">General IT</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-white text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="ALL">All Availabilities</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        <div className="text-xs text-text-muted">
          Showing <span className="font-semibold text-text-primary">{filteredTechnicians.length}</span>{' '}
          technicians
        </div>
      </div>

      {/* Technician Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading technician roster...</p>
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-lg bg-surface">
          <UserCheck className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-text-primary">No technicians match current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredTechnicians.map((tech) => (
            <div
              key={tech.technicianId}
              className="p-5 rounded-lg border border-border bg-surface hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={tech.name} size="md" />
                    <div>
                      <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        {tech.name}
                      </div>
                      <div className="text-xs text-text-muted">{tech.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(tech.status)}
                    {getSpecializationBadge(tech.specialization)}
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
                  <div className="p-2 rounded bg-[#F7F8FA] text-center">
                    <div className="text-xs text-text-muted">Assigned</div>
                    <div className="text-base font-bold text-text-primary mt-0.5">{tech.assigned}</div>
                  </div>
                  <div className="p-2 rounded bg-[#FFFAEB] text-center">
                    <div className="text-xs text-[#B54708]">In Progress</div>
                    <div className="text-base font-bold text-[#B54708] mt-0.5">{tech.inProgress}</div>
                  </div>
                  <div className="p-2 rounded bg-[#ECFDF3] text-center">
                    <div className="text-xs text-[#027A48]">Resolved</div>
                    <div className="text-base font-bold text-[#027A48] mt-0.5">{tech.resolved}</div>
                  </div>
                  <div className="p-2 rounded bg-[#FEF3F2] text-center">
                    <div className="text-xs text-[#B42318]">Overdue</div>
                    <div className="text-base font-bold text-[#D92D20] mt-0.5">{tech.overdue}</div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-text-muted">Availability:</span>
                  <select
                    value={tech.status}
                    onChange={(e) =>
                      handleToggleStatus(tech, e.target.value as TechnicianStatus)
                    }
                    className="text-[11px] font-medium px-2 py-0.5 rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenReassign(tech)}
                    iconLeft={<ArrowRightLeft className="w-3 h-3" />}
                  >
                    Reassign
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(tech)}
                    iconLeft={<Settings className="w-3 h-3" />}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Specialization & Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Configure Technician Specialization"
        description={`Set primary troubleshooting domain and operational readiness for ${selectedTech?.name}.`}
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Primary Specialization
            </label>
            <select
              value={editSpecialization}
              onChange={(e) =>
                setEditSpecialization(e.target.value as TechnicianSpecialization)
              }
              className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="GENERAL_IT">General IT Support</option>
              <option value="HARDWARE">Hardware (Laptops, Monitors, Peripherals)</option>
              <option value="NETWORK">Network (VPN, Wi-Fi, Switches, Routers)</option>
              <option value="SOFTWARE">Software (SaaS, OS, Applications, DB)</option>
              <option value="ACCOUNT_ACCESS">Account Access (SSO, Active Directory, MFA)</option>
            </select>
            <p className="text-[11px] text-text-muted mt-1">
              Automatic routing engine will direct incoming tickets based on this specialization.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Operational Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as TechnicianStatus)}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="AVAILABLE">Available (Receives automatic ticket assignments)</option>
              <option value="BUSY">Busy (High workload, reduced automatic routing)</option>
              <option value="UNAVAILABLE">Unavailable (On leave / Off duty, no assignments)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save configuration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Reassign Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Reassign Active Tickets"
        description={`Transfer active assignments from ${selectedTech?.name} to another qualified technician.`}
      >
        <form onSubmit={handleExecuteReassign} className="space-y-4">
          <div className="p-3 rounded-lg bg-[#EFF8FF] border border-[#B2DDFF] text-xs text-[#175CD3]">
            This will transfer all active (OPEN & IN_PROGRESS) tickets currently held by{' '}
            <span className="font-semibold">{selectedTech?.name}</span> to the designated replacement
            technician.
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Transfer to Technician
            </label>
            <select
              value={targetTechId}
              onChange={(e) => setTargetTechId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {technicians
                .filter((t) => t.technicianId !== selectedTech?.technicianId)
                .map((t) => (
                  <option key={t.technicianId} value={t.technicianId}>
                    {t.name} ({SPECIALIZATION_CONFIG[t.specialization].label}) — {t.assigned} assigned
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Execute transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
