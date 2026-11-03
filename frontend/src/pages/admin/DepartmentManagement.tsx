import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { DepartmentSummary } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Building2, Plus, Edit2, Users, Ticket, Loader2 } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentSummary | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments');
      if (res.success) {
        setDepartments(res.departments);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load departments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentSummary) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Department name and code are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        await api.patch(`/departments/${editingDept.id}`, formData);
        toast.success(`Department ${formData.name} updated.`);
      } else {
        await api.post('/departments', formData);
        toast.success(`Department ${formData.name} created.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Departments & Cost Centers"
          subtitle="Configure organizational business units for ticket routing, asset ownership, and metric reporting."
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'Departments' },
          ]}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          iconLeft={<Plus className="w-3.5 h-3.5" />}
        >
          Add department
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading business units...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-lg bg-surface">
          <Building2 className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-text-primary">No departments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="p-5 rounded-lg border border-border bg-surface hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-border flex items-center justify-center font-bold text-xs text-brand">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{dept.name}</h3>
                      <span className="text-[11px] text-text-muted font-mono">{dept.code}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded text-text-muted hover:text-brand hover:bg-[#F2F4F7] transition-colors"
                    title="Edit department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-text-secondary mt-3 line-clamp-2">
                  {dept.description || 'No department description provided.'}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-text-muted" />
                  <span>
                    <strong className="text-text-primary">{dept.userCount ?? 0}</strong> users
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-text-muted" />
                  <span>
                    <strong className="text-text-primary">{dept.ticketCount ?? 0}</strong> tickets
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        description="Configure department identifier and team details."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Department name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Finance & Accounting"
          />

          <TextInput
            label="Department code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g. FIN"
            helperText="Short unique 2-6 character identifier"
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of department scope..."
              className="w-full text-xs p-3 rounded-lg border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingDept ? 'Save changes' : 'Create department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
