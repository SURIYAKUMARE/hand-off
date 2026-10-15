import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetwork();

  // If online and no queued items waiting to sync, don't take up any vertical space
  if (isOnline && pendingCount === 0) {
    return null;
  }

  // 1. Offline Mode Banner
  if (!isOnline) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className="w-full bg-[#FEF0C7] border-b border-[#FEDF89] px-4 py-2 text-xs text-[#7A2E0E] flex flex-wrap items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-[#B54708] flex-shrink-0" />
          <span className="font-medium text-[#7A2E0E]">Offline mode:</span>
          <span className="truncate text-[#93370D]">
            Working with locally cached data. You can draft tickets and post comments — all changes will auto-sync when connection restores.
          </span>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FDE29A] text-[11px] font-semibold text-[#7A2E0E] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span>{pendingCount} change{pendingCount === 1 ? '' : 's'} pending sync</span>
          </div>
        )}
      </aside>
    );
  }

  // 2. Online with pending outbox items banner
  return (
    <aside
      role="status"
      aria-live="polite"
      className="w-full bg-[#EFF8FF] border-b border-[#B2DDFF] px-4 py-2 text-xs text-[#175CD3] flex flex-wrap items-center justify-between gap-3 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <RefreshCw className={`w-4 h-4 text-[#175CD3] flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
        <span className="font-medium">Connection restored:</span>
        <span className="text-[#1849A9]">
          {isSyncing
            ? `Synchronizing ${pendingCount} offline update${pendingCount === 1 ? '' : 's'} with server...`
            : `${pendingCount} offline change${pendingCount === 1 ? '' : 's'} queued for database persistence.`}
        </span>
      </div>

      <button
        type="button"
        onClick={() => triggerSync()}
        disabled={isSyncing}
        className="px-2.5 py-1 rounded bg-[#175CD3] hover:bg-[#1550B8] active:bg-[#103E8F] text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
      </button>
    </aside>
  );
};
