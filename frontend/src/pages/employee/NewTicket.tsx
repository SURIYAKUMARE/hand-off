import React, { useState, useEffect, useRef } from 'react';
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
import {
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
  DepartmentSummary,
  AssetItem,
  DuplicateTicketMatch,
} from '@helpdesk360/shared';
import {
  AlertCircle,
  CheckCircle2,
  Paperclip,
  X,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

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
  const [departmentId, setDepartmentId] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');

  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // Duplicate detection state
  const [duplicates, setDuplicates] = useState<DuplicateTicketMatch[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load departments and assets
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptsRes, assetsRes] = await Promise.all([
          api.get<{ success: boolean; departments: DepartmentSummary[] }>('/departments'),
          api.get<{ success: boolean; assets: AssetItem[] }>('/assets'),
        ]);

        if (deptsRes.success) {
          setDepartments(deptsRes.departments);
          if (user?.departmentId) {
            setDepartmentId(user.departmentId);
          } else if (deptsRes.departments.length > 0) {
            setDepartmentId(deptsRes.departments[0].id);
          }
        }

        if (assetsRes.success) {
          setAssets(assetsRes.assets);
        }
      } catch {
        // graceful offline fallback
      }
    };

    fetchMetadata();
  }, [user]);

  // Duplicate ticket detection debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (title.trim().length >= 4) {
      setIsCheckingDuplicates(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await api.get<{ success: boolean; duplicates: DuplicateTicketMatch[] }>(
            `/tickets/duplicates?title=${encodeURIComponent(title.trim())}&category=${category}`
          );
          if (res.success) {
            setDuplicates(res.duplicates);
          }
        } catch {
          // ignore error
        } finally {
          setIsCheckingDuplicates(false);
        }
      }, 400);
    } else {
      setDuplicates([]);
      setIsCheckingDuplicates(false);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [title, category]);

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
      const res = await api.post<{ success: boolean; ticket: any; message: string }>('/tickets', payload);

      // If user selected files, upload them
      if (res.success && res.ticket && files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          try {
            await api.postFormData(`/tickets/${res.ticket.id}/attachments`, formData);
          } catch (uploadErr) {
            console.error('File upload failed', uploadErr);
          }
        }
      }

      return res;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedList = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedList]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
      departmentId: departmentId || undefined,
      assetId: assetId || undefined,
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
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader
        title="New IT Support Request"
        subtitle="Submit an issue or service request to the IT engineering team."
        breadcrumbs={[
          { label: 'My tickets', to: '/employee/tickets' },
          { label: 'New ticket' },
        ]}
      />

      {generalError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318]"
        >
          <AlertCircle className="w-4 h-4 text-[#D92D20] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span>{generalError}</span>
            {generalError.toLowerCase().includes('sign in') && (
              <span
                className="ml-2 font-bold underline hover:text-[#7A1C14] cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Sign in again &rarr;
              </span>
            )}
          </div>
        </div>
      )}

      {/* Duplicate Ticket Suggestions Banner */}
      {duplicates.length > 0 && (
        <div className="p-4 rounded-lg bg-[#FFFAEB] border border-[#FEDF89] text-xs text-[#7A2E0E] space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#B54708]" />
            <span>Similar Active Tickets Detected</span>
          </div>
          <p className="text-[11px] text-[#B54708]">
            An open ticket matching your description already exists in the system. Check if your issue is
            already reported:
          </p>
          <div className="space-y-1.5 pt-1">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                onClick={() => navigate(`/employee/tickets/${dup.id}`)}
                className="flex items-center justify-between p-2 rounded bg-white/80 border border-[#FEDF89] hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono font-bold text-brand">{dup.ticketNumber}</span>
                  <span className="text-text-primary truncate">{dup.title}</span>
                </div>
                <span className="text-[11px] text-brand flex items-center gap-0.5 flex-shrink-0">
                  Inspect <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <TextInput
            label="Ticket title"
            required
            placeholder="e.g. Wi-Fi drops intermittently in conference room B"
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
            className="min-h-[130px]"
          />

          {/* Category & Priority */}
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

          {/* Department & Asset Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Affected Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">General Company Issue</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.code ? ` (${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Related IT Asset (Optional)
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">None / Not equipment related</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              File Attachments (Screenshots, Logs)
            </label>
            <div className="border border-dashed border-border rounded-lg p-3 bg-[#F9FAFB] flex flex-col items-center justify-center text-center">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.log,.txt,.csv"
              />
              <Paperclip className="w-5 h-5 text-text-muted mb-1" />
              <div className="text-xs text-text-secondary">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-brand font-medium hover:underline mr-1"
                >
                  Click to attach files
                </button>
                <span>or drag and drop</span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                PNG, JPG, PDF, TXT up to 10MB each
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-white border border-border text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                      <span className="truncate text-text-primary">{file.name}</span>
                      <span className="text-[10px] text-text-muted">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-text-muted hover:text-[#D92D20] p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explanatory notice */}
          <div className="p-3 bg-[#F7F8FA] border border-border rounded-lg text-[11px] text-text-secondary leading-normal">
            <span className="font-semibold text-text-primary">SLA Commitment:</span> Urgent incidents are triaged in &lt;1 hour. Standard hardware/software requests are resolved in 8–24 hours.
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
