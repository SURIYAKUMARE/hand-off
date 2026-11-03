import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { WifiOff, RefreshCw } from 'lucide-react';

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
        className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="font-bold">Offline mode:</span>
          <span className="truncate opacity-90">
            Working with locally cached records. You can draft tickets and post comments — all changes will auto-sync when connection restores.
          </span>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-100 flex-shrink-0 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingCount} change{pendingCount === 1 ? '' : 's'} queued</span>
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
      className="w-full bg-brand/10 border-b border-brand/20 px-4 py-2 text-xs text-brand flex flex-wrap items-center justify-between gap-3 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <RefreshCw className={`w-4 h-4 text-brand flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
        <span className="font-bold">Connection active:</span>
        <span className="text-text-primary opacity-90">
          {isSyncing
            ? `Synchronizing ${pendingCount} offline update${pendingCount === 1 ? '' : 's'} with server...`
            : `${pendingCount} offline change${pendingCount === 1 ? '' : 's'} queued for database persistence.`}
        </span>
      </div>

      <button
        type="button"
        onClick={() => triggerSync()}
        disabled={isSyncing}
        className="px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 shadow-xs"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
      </button>
    </aside>
  );
};
