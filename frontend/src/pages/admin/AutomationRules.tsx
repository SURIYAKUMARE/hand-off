import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AutomationRuleItem } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Sliders, Plus, PlayCircle, Loader2, ArrowRight } from 'lucide-react';

export const AutomationRules: React.FC = () => {
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    trigger: 'TICKET_CREATED',
    conditions: '{"category": "NETWORK"}',
    actions: '{"assignSpecialization": "NETWORK"}',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; rules: AutomationRuleItem[] }>('/admin/automations');
      if (res.success) {
        setRules(res.rules);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load automation rules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (rule: AutomationRuleItem) => {
    try {
      const res = await api.patch<{ success: boolean; rule: AutomationRuleItem }>(
        `/admin/automations/${rule.id}/toggle`
      );
      if (res.success) {
        setRules((prev) =>
          prev.map((r) => (r.id === rule.id ? { ...r, isActive: res.rule.isActive } : r))
        );
        toast.success(`Rule "${rule.name}" is now ${res.rule.isActive ? 'active' : 'inactive'}.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle rule.');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Rule name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post<{ success: boolean; rule: AutomationRuleItem }>(
        '/admin/automations',
        formData
      );
      if (res.success) {
        toast.success(`Rule "${res.rule.name}" created successfully.`);
        setIsModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create automation rule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Automation & Routing Engine"
          subtitle="Configure business logic triggers, condition sets, and automated technician routing."
          breadcrumbs={[
            { label: 'Admin', to: '/admin/dashboard' },
            { label: 'Automations' },
          ]}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          iconLeft={<Plus className="w-3.5 h-3.5" />}
        >
          Add rule
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading automation triggers...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-lg bg-surface">
          <Sliders className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-text-primary">No rules configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border bg-surface transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rule.isActive ? 'border-border' : 'border-border/60 opacity-70 bg-[#FAFAFA]'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-xs text-text-primary">{rule.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F2F4F7] text-text-secondary border border-border">
                    {rule.trigger}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary flex-wrap">
                  <span className="text-[11px] text-text-muted">If:</span>
                  <code className="bg-[#F7F8FA] px-1.5 py-0.5 rounded border border-border text-[11px] font-mono">
                    {rule.conditions}
                  </code>
                  <ArrowRight className="w-3 h-3 text-text-muted" />
                  <span className="text-[11px] text-text-muted">Then:</span>
                  <code className="bg-[#EFF8FF] text-[#175CD3] px-1.5 py-0.5 rounded border border-[#B2DDFF] text-[11px] font-mono">
                    {rule.actions}
                  </code>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rule.isActive ?? rule.isEnabled ?? true}
                    onChange={() => handleToggle(rule)}
                    className="rounded border-border text-brand focus:ring-brand"
                  />
                  <span className={(rule.isActive ?? rule.isEnabled ?? true) ? 'text-text-primary font-medium' : 'text-text-muted'}>
                    {(rule.isActive ?? rule.isEnabled ?? true) ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Automation Rule"
        description="Trigger actions automatically when events occur in the system."
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <TextInput
            label="Rule Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Auto-route Database incidents"
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Trigger Event</label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="TICKET_CREATED">Ticket Created</option>
              <option value="STATUS_CHANGED">Status Changed</option>
              <option value="SLA_BREACHED">SLA Breached</option>
              <option value="PRIORITY_CHANGED">Priority Escalated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Condition Filter (JSON)
            </label>
            <textarea
              rows={2}
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              className="w-full font-mono text-xs p-2.5 rounded-lg border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Automated Action (JSON)
            </label>
            <textarea
              rows={2}
              value={formData.actions}
              onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
              className="w-full font-mono text-xs p-2.5 rounded-lg border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
