import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { TextArea } from '../components/common/TextArea';
import { Select } from '../components/common/Select';
import { SearchInput } from '../components/common/SearchInput';
import { StatusChip } from '../components/tickets/StatusChip';
import { PriorityChip } from '../components/tickets/PriorityChip';
import { SLABadge } from '../components/tickets/SLABadge';
import { MetricCard } from '../components/dashboard/MetricCard';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Avatar } from '../components/common/Avatar';
import { TableSkeleton, MetricCardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import {
  LifeBuoy,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DesignSystemGallery: React.FC = () => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('HD-1042');
  const [textVal, setTextVal] = useState('VPN certificate issue');
  const [areaVal, setAreaVal] = useState(
    'Detailed description of the workstation boot failure observed after the latest OS patch.'
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="HelpDesk 360 Design System"
        subtitle="Standardized enterprise tokens and reusable component specifications."
      />

      {/* 1. Brand & Semantic Colors */}
      <Card>
        <CardHeader
          title="Color system"
          subtitle="Strict palette for background, borders, primary brand, semantic priorities, and statuses"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg border border-border bg-[#F7F8FA]">
            <div className="h-6 w-full rounded bg-[#F7F8FA] border border-border mb-2" />
            <div className="text-xs font-semibold text-text-primary">Background</div>
            <div className="text-[10px] text-text-muted">#F7F8FA</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <div className="h-6 w-full rounded bg-white border border-border mb-2" />
            <div className="text-xs font-semibold text-text-primary">Surface / Card</div>
            <div className="text-[10px] text-text-muted">#FFFFFF</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <div className="h-6 w-full rounded bg-brand mb-2" />
            <div className="text-xs font-semibold text-text-primary">Primary Brand</div>
            <div className="text-[10px] text-text-muted">#3B3FD9</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <div className="h-6 w-full rounded bg-[#D92D20] mb-2" />
            <div className="text-xs font-semibold text-text-primary">Urgent</div>
            <div className="text-[10px] text-text-muted">#D92D20</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <div className="h-6 w-full rounded bg-[#F79009] mb-2" />
            <div className="text-xs font-semibold text-text-primary">High</div>
            <div className="text-[10px] text-text-muted">#F79009</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <div className="h-6 w-full rounded bg-[#2E90FA] mb-2" />
            <div className="text-xs font-semibold text-text-primary">Medium</div>
            <div className="text-[10px] text-text-muted">#2E90FA</div>
          </div>
        </div>
      </Card>

      {/* 2. Buttons & IconButtons */}
      <Card>
        <CardHeader
          title="Buttons & Icon controls"
          subtitle="All variants, sizes, and interactive states"
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">
              Primary Action
            </Button>
            <Button variant="secondary" size="md">
              Secondary Action
            </Button>
            <Button variant="destructive" size="md" iconLeft={<Trash2 className="w-3.5 h-3.5" />}>
              Destructive
            </Button>
            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
            <Button variant="primary" size="md" isLoading>
              Loading
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
            <span className="text-xs text-text-muted mr-2">Sizes:</span>
            <Button variant="secondary" size="sm">
              Small (32px)
            </Button>
            <Button variant="secondary" size="md">
              Medium (36px)
            </Button>
            <Button variant="secondary" size="lg">
              Large (40px)
            </Button>
            <span className="text-xs text-text-muted mx-2">Icon buttons:</span>
            <IconButton icon={<Edit2 className="w-4 h-4" />} aria-label="Edit" variant="ghost" />
            <IconButton icon={<Trash2 className="w-4 h-4" />} aria-label="Delete" variant="secondary" />
            <IconButton icon={<Plus className="w-4 h-4" />} aria-label="Add" variant="primary" />
          </div>
        </div>
      </Card>

      {/* 3. Form Components */}
      <Card>
        <CardHeader
          title="Form components & validation"
          subtitle="Inputs with accessible labels, errors, and live character counting"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Standard input"
            value={textVal}
            onChange={(e) => setTextVal(e.target.value)}
            helperText="Provide specific equipment identifier if available."
          />
          <TextInput
            label="Input with validation error"
            value=""
            readOnly
            error="Enter a ticket title."
          />
          <PasswordInput
            label="Password input with toggle"
            value="SecurePassword123!"
            readOnly
          />
          <Select
            label="Category select"
            options={[
              { value: 'HARDWARE', label: 'Hardware' },
              { value: 'NETWORK', label: 'Network' },
              { value: 'SOFTWARE', label: 'Software' },
            ]}
            defaultValue="HARDWARE"
          />
          <div className="md:col-span-2">
            <TextArea
              label="Multiline issue description"
              value={areaVal}
              onChange={(e) => setAreaVal(e.target.value)}
              showCharCount
              maxLength={2000}
            />
          </div>
          <div className="md:col-span-2">
            <SearchInput
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onClear={() => setSearchVal('')}
            />
          </div>
        </div>
      </Card>

      {/* 4. Priority Chips, Status Chips & SLA Badges */}
      <Card>
        <CardHeader
          title="Chips, statuses & SLA badges"
          subtitle="Semantic color tokens and accessibility indicators"
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-text-muted mr-2">Priority chips:</span>
            <PriorityChip priority="URGENT" />
            <PriorityChip priority="HIGH" />
            <PriorityChip priority="MEDIUM" />
            <PriorityChip priority="LOW" />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
            <span className="text-xs text-text-muted mr-2">Status chips:</span>
            <StatusChip status="OPEN" />
            <StatusChip status="IN_PROGRESS" />
            <StatusChip status="RESOLVED" />
            <StatusChip status="CLOSED" />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
            <span className="text-xs text-text-muted mr-2">SLA Badges:</span>
            <SLABadge createdAt={new Date(Date.now() - 45 * 60 * 1000).toISOString()} priority="MEDIUM" status="OPEN" />
            <SLABadge createdAt={new Date(Date.now() - 20 * 3600 * 1000).toISOString()} priority="MEDIUM" status="OPEN" />
            <SLABadge createdAt={new Date(Date.now() - 30 * 3600 * 1000).toISOString()} priority="MEDIUM" status="OPEN" />
          </div>
        </div>
      </Card>

      {/* 5. Metrics & Avatars */}
      <Card>
        <CardHeader
          title="Metrics & user identities"
          subtitle="28px metric numbers and initials avatars"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MetricCard title="Open issues" value={14} accentColor="#2E90FA" />
          <MetricCard title="Urgent requests" value={3} accentColor="#D92D20" />
          <MetricCard title="In progress" value={8} accentColor="#F79009" />
          <MetricCard title="Completed" value={42} accentColor="#12B76A" />
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <span className="text-xs text-text-muted mr-2">Avatars:</span>
          <Avatar name="Priya Nair" size="sm" />
          <Avatar name="Arjun Mehta" size="md" />
          <Avatar name="Kavya Raman" size="lg" />
        </div>
      </Card>

      {/* 6. Interactive Dialogs & Toasts */}
      <Card>
        <CardHeader
          title="Modals, toasts & banners"
          subtitle="Focus trapped dialogs and floating feedback"
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(true)}>
              Open test modal
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={() => setIsConfirmOpen(true)}
            >
              Open confirm dialog
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => toast.success('Ticket HD-1042 created successfully.')}
            >
              Trigger success toast
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => toast.error('Unable to update ticket. Please try again.')}
            >
              Trigger error toast
            </Button>
          </div>

          <ErrorBanner
            message="Cannot reach server. Please check connection and retry."
            onRetry={() => toast.info('Retrying connection...')}
          />
        </div>
      </Card>

      {/* 7. Skeleton & Empty States */}
      <Card>
        <CardHeader title="Loading skeletons & empty states" />
        <div className="space-y-4">
          <TableSkeleton rows={2} cols={4} />
          <EmptyState
            title="No tickets raised yet"
            description="Your tickets will appear here once submitted."
            actionLabel="New ticket"
            onAction={() => toast.info('Action triggered')}
          />
        </div>
      </Card>

      {/* Sample Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal Dialog"
        description="Demonstrating accessible focus trapping, keyboard Esc closing, and clean enterprise layout."
      >
        <div className="space-y-3 text-xs text-text-secondary">
          <p>
            This modal traps keyboard focus inside while open. Pressing Escape or the Close button safely returns focus to the triggering control.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sample Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          toast.success('Action confirmed.');
        }}
        title="Confirm ticket deletion?"
        description="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmLabel="Delete ticket"
        variant="destructive"
      />
    </div>
  );
};
