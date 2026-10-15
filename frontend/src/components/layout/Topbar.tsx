import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { PlusCircle, Search, WifiOff, RefreshCw } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

export interface TopbarProps {
  onSearchClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetwork();

  return (
    <header className="h-14 bg-surface border-b border-border sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => {
            if (user?.role === 'TECHNICIAN') {
              navigate('/technician/queue');
            } else {
              navigate('/employee/tickets');
            }
          }}
          className="w-full max-w-xs h-8 px-3 rounded-lg border border-border bg-[#F7F8FA] hover:bg-[#F2F4F7] text-text-muted hover:text-text-primary text-xs flex items-center gap-2 transition-colors cursor-pointer text-left"
          aria-label="Quick search tickets"
        >
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span className="truncate">Quick search (ID or title)...</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === 'EMPLOYEE' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/employee/new-ticket')}
            iconLeft={<PlusCircle className="w-3.5 h-3.5" />}
          >
            New ticket
          </Button>
        )}

        {/* Dynamic Network Status Indicator */}
        {!isOnline ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FEF0C7] border border-[#FEDF89] text-[11px] font-medium text-[#7A2E0E] cursor-default"
            title="Application is working offline. All changes are stored locally in outbox."
          >
            <WifiOff className="w-3 h-3 text-[#B54708]" />
            <span>Offline {pendingCount > 0 ? `(${pendingCount} pending)` : '(Cached)'}</span>
          </div>
        ) : isSyncing ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFF8FF] border border-[#B2DDFF] text-[11px] font-medium text-[#175CD3]"
            title="Synchronizing queued offline changes with the server..."
          >
            <RefreshCw className="w-3 h-3 animate-spin text-[#175CD3]" />
            <span>Syncing ({pendingCount})...</span>
          </div>
        ) : pendingCount > 0 ? (
          <button
            type="button"
            onClick={() => triggerSync()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFF8FF] hover:bg-[#D1E9FF] border border-[#B2DDFF] text-[11px] font-medium text-[#175CD3] transition-colors cursor-pointer"
            title="Click to manually synchronize queued items"
          >
            <RefreshCw className="w-3 h-3 text-[#175CD3]" />
            <span>Sync {pendingCount} pending</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#ECFDF3] border border-[#A6F4C5] text-[11px] font-medium text-[#027A48]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
            <span>System Healthy</span>
          </div>
        )}
      </div>
    </header>
  );
};
