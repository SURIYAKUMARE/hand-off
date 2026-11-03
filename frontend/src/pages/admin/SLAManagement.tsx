import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { SlaPolicyItem, TicketPriority, PRIORITY_CONFIG } from '@helpdesk360/shared';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Clock, ShieldAlert, CheckCircle, Save, Loader2, AlertCircle } from 'lucide-react';

export const SLAManagement: React.FC = () => {
  const [policies, setPolicies] = useState<SlaPolicyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPriority, setSavingPriority] = useState<string | null>(null);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; policies: SlaPolicyItem[] }>('/admin/sla');
      if (res.success) {
        setPolicies(res.policies);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load SLA policies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFieldChange = (priority: TicketPriority, field: keyof SlaPolicyItem, value: any) => {
    setPolicies((prev) =>
      prev.map((p) => (p.priority === priority ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePolicy = async (policy: SlaPolicyItem) => {
    try {
      setSavingPriority(policy.priority);
      const res = await api.patch<{ success: boolean; policy: SlaPolicyItem }>(
        `/admin/sla/${policy.priority}`,
        {
          firstResponseHours: Number(policy.firstResponseHours),
          resolutionHours: Number(policy.resolutionHours),
          escalationHours: Number(policy.escalationHours),
          isActive: Boolean(policy.isActive),
        }
      );
      if (res.success) {
        toast.success(`SLA for ${policy.priority} updated successfully.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update SLA policy.');
    } finally {
      setSavingPriority(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Service Level Agreements (SLA)"
        subtitle="Enforce binding first-response and full-resolution targets based on incident severity."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'SLA Management' },
        ]}
      />

      <div className="p-4 rounded-lg bg-[#EFF8FF] border border-[#B2DDFF] flex items-start gap-3">
        <Clock className="w-5 h-5 text-[#175CD3] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#175CD3] space-y-1">
          <p className="font-semibold">Automatic Deadline Calculation</p>
          <p>
            When a ticket is created or its priority is upgraded, the system recalculates its{' '}
            <code className="bg-white/60 px-1 py-0.5 rounded font-mono">slaDeadline</code> and{' '}
            <code className="bg-white/60 px-1 py-0.5 rounded font-mono">firstResponseDeadline</code>{' '}
            based on the active targets below.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading SLA rules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => {
            const config = PRIORITY_CONFIG[p.priority];
            const isSaving = savingPriority === p.priority;

            return (
              <div
                key={p.id}
                className="p-5 rounded-lg border border-border bg-surface hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <h3 className="text-sm font-bold text-text-primary">{config.label} Priority</h3>
                    </div>

                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={p.isActive ?? true}
                        onChange={(e) =>
                          handleFieldChange(p.priority, 'isActive', e.target.checked)
                        }
                        className="rounded border-border text-brand focus:ring-brand"
                      />
                      <span className={(p.isActive ?? true) ? 'text-text-primary font-medium' : 'text-text-muted'}>
                        {(p.isActive ?? true) ? 'Policy Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        First Response
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={p.firstResponseHours ?? (p.firstResponseMinutes ? p.firstResponseMinutes / 60 : 1)}
                          onChange={(e) =>
                            handleFieldChange(
                              p.priority,
                              'firstResponseHours',
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
                          hrs
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Resolution Target
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={p.resolutionHours ?? (p.resolutionMinutes ? p.resolutionMinutes / 60 : 4)}
                          onChange={(e) =>
                            handleFieldChange(
                              p.priority,
                              'resolutionHours',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
                          hrs
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Auto-Escalation
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={p.escalationHours ?? 6}
                          onChange={(e) =>
                            handleFieldChange(
                              p.priority,
                              'escalationHours',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
                          hrs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-border">
                  <span className="text-[11px] text-text-muted">
                    Target: {p.resolutionHours ?? (p.resolutionMinutes ? p.resolutionMinutes / 60 : 4)} hours to full resolution
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSavePolicy(p)}
                    isLoading={isSaving}
                    iconLeft={<Save className="w-3.5 h-3.5" />}
                  >
                    Save policy
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
