import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { queueOfflineTicket } from '../../offline/syncEngine';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/common/TextInput';
import { TextArea } from '../../components/common/TextArea';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { PRIORITY_CONFIG, CATEGORY_LABELS } from '@helpdesk360/shared';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOnline } = useNetwork();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('HARDWARE');
  const [priority, setPriority] = useState<string>('MEDIUM');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const categoryOptions = [
    { value: 'HARDWARE', label: CATEGORY_LABELS.HARDWARE },
    { value: 'NETWORK', label: CATEGORY_LABELS.NETWORK },
    { value: 'SOFTWARE', label: CATEGORY_LABELS.SOFTWARE },
    { value: 'ACCOUNT_ACCESS', label: CATEGORY_LABELS.ACCOUNT_ACCESS },
  ];

  const priorityOptions = [
    { value: 'LOW', label: `${PRIORITY_CONFIG.LOW.label} — Routine / Minor` },
    { value: 'MEDIUM', label: `${PRIORITY_CONFIG.MEDIUM.label} — Standard productivity issue` },
    { value: 'HIGH', label: `${PRIORITY_CONFIG.HIGH.label} — Severe degradation` },
    { value: 'URGENT', label: `${PRIORITY_CONFIG.URGENT.label} — Critical operation halted` },
  ];

  // TanStack mutation ensuring real database persistence before navigating
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post<{ success: boolean; ticket: any; message: string }>('/tickets', payload);
    },
    onSuccess: (data) => {
      // Invalidate queries so lists update immediately
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast.success(
        `Ticket ${data.ticket.ticketNumber} created successfully.`,
        'Ticket Submitted'
      );
      // Navigate to created ticket detail using real ID
      navigate(`/employee/tickets/${data.ticket.id}`);
    },
    onError: (err: any, variables: any) => {
      if (err instanceof ApiError && err.validationErrors) {
        const errors: Record<string, string> = {};
        err.validationErrors.forEach((v) => {
          errors[v.field] = v.message;
        });
        setFieldErrors(errors);
      } else {
        // Check if error is network/offline related
        const isNetworkFailure =
          !navigator.onLine ||
          err?.name === 'TypeError' ||
          err?.message?.toLowerCase().includes('fetch') ||
          err?.message?.toLowerCase().includes('network');

        if (isNetworkFailure) {
          const pending = queueOfflineTicket(variables, {
            id: user?.id || 'offline-emp',
            name: user?.name || 'Local Employee',
            email: user?.email || 'employee@helpdesk.local',
          });
          toast.info(
            `Connection lost. Ticket ${pending.ticketNumber} saved locally in outbox. It will sync automatically when back online.`,
            'Saved Offline'
          );
          navigate('/employee/tickets');
        } else {
          setGeneralError(err?.message || 'Unable to create ticket. Please try again.');
        }
      }
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Enter a ticket title.';
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    } else if (title.length > 120) {
      errors.title = 'Title must be 120 characters or fewer.';
    }

    if (!description.trim()) {
      errors.description = 'Describe the issue.';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    } else if (description.length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters.';
    }

    if (!category) {
      errors.category = 'Select a category.';
    }

    if (!priority) {
      errors.priority = 'Select a priority.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category as any,
      priority: priority as any,
    };

    // If client is currently detected as offline, queue directly into outbox
    if (!isOnline || !navigator.onLine) {
      const pending = queueOfflineTicket(payload, {
        id: user?.id || 'offline-emp',
        name: user?.name || 'Local Employee',
        email: user?.email || 'employee@helpdesk.local',
      });
      toast.info(
        `Working offline. Ticket ${pending.ticketNumber} saved to local outbox and will synchronize once reconnected.`,
        'Saved Offline'
      );
      navigate('/employee/tickets');
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="New ticket"
        subtitle="Tell the IT team what went wrong."
        breadcrumbs={[
          { label: 'My tickets', href: '/employee/tickets' },
          { label: 'New ticket' },
        ]}
      />

      {generalError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 mb-6 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318]"
        >
          <AlertCircle className="w-4 h-4 text-[#D92D20] mt-0.5 flex-shrink-0" />
          <div className="flex-1">{generalError}</div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <TextInput
            label="Ticket title"
            required
            placeholder="e.g. Laptop does not boot after update"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: '' }));
              }
            }}
            error={fieldErrors.title}
            disabled={createMutation.isPending}
          />

          {/* Description */}
          <TextArea
            label="Issue description"
            required
            placeholder="Provide detailed symptoms, error messages, and what troubleshooting steps you have already tried..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (fieldErrors.description) {
                setFieldErrors((prev) => ({ ...prev, description: '' }));
              }
            }}
            error={fieldErrors.description}
            maxLength={2000}
            showCharCount
            disabled={createMutation.isPending}
            className="min-h-[140px]"
          />

          {/* Category & Priority in 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              options={categoryOptions}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (fieldErrors.category) {
                  setFieldErrors((prev) => ({ ...prev, category: '' }));
                }
              }}
              error={fieldErrors.category}
              disabled={createMutation.isPending}
            />

            <Select
              label="Priority"
              required
              options={priorityOptions}
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                if (fieldErrors.priority) {
                  setFieldErrors((prev) => ({ ...prev, priority: '' }));
                }
              }}
              error={fieldErrors.priority}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Explanatory notice */}
          <div className="p-3 bg-[#F7F8FA] border border-border rounded-lg text-[11px] text-text-secondary leading-normal">
            <span className="font-semibold text-text-primary">Service Level Commitment:</span>{' '}
            Urgent requests are triaged within 4 hours. Standard hardware and software requests are resolved within 24–48 hours.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/employee/tickets')}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
            >
              Submit ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
