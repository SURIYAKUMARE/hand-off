import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { PlusCircle, Search, WifiOff, RefreshCw, Sun, Moon, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { NotificationCenter } from './NotificationCenter';

export interface TopbarProps {
  onSearchClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetwork();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 bg-header-bg backdrop-blur-md border-b border-header-border sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        <button
          type="button"
          onClick={() => {
            if (user?.role === 'ADMIN') {
              navigate('/admin/tickets');
            } else if (user?.role === 'TECHNICIAN') {
              navigate('/technician/queue');
            } else {
              navigate('/employee/tickets');
            }
          }}
          className="w-full h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text-muted hover:text-text-primary text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer text-left"
          aria-label="Quick search tickets"
        >
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span className="truncate">Quick search (Ticket ID, subject)...</span>
          <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-muted border border-border text-text-muted hidden sm:inline-block">
            ⌘K
          </span>
        </button>
      </div>

      {/* Center: Institutional Meta Status (Desktop) */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
          <span className="live-indicator-dot" />
          <span>Operational</span>
          <span className="opacity-40">•</span>
          <span className="font-mono text-[10px]">ISO 20000 SLA 99.8%</span>
        </div>
      </div>

      {/* Right: Actions, Theme Switcher, Notifications, Network, Role Badge */}
      <div className="flex items-center gap-2 sm:gap-2.5">
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

        {/* Theme Toggle Button (Niyam AI signature feature) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-text-secondary hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* In-App Notifications */}
        <NotificationCenter />

        {/* Network & Sync Indicator */}
        {!isOnline ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-700 dark:text-amber-300 cursor-default shadow-xs"
            title="Application is working offline. All changes are stored locally in outbox."
          >
            <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Offline</span>
            <span>{pendingCount > 0 ? `(${pendingCount})` : ''}</span>
          </div>
        ) : isSyncing ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/25 text-[11px] font-semibold text-brand shadow-xs"
            title="Synchronizing queued offline changes with the server..."
          >
            <RefreshCw className="w-3 h-3 animate-spin text-brand" />
            <span className="hidden sm:inline">Syncing ({pendingCount})...</span>
          </div>
        ) : pendingCount > 0 ? (
          <button
            type="button"
            onClick={() => triggerSync()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand/10 hover:bg-brand/20 border border-brand/30 text-[11px] font-semibold text-brand transition-colors cursor-pointer shadow-xs"
            title="Click to manually synchronize queued items"
          >
            <RefreshCw className="w-3 h-3 text-brand" />
            <span>Sync {pendingCount}</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-semibold text-text-secondary shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Synced</span>
          </div>
        )}

        {/* Role Monospace Badge */}
        {user?.role && (
          <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold font-mono tracking-wider uppercase bg-surface-muted text-text-secondary border border-border shadow-xs">
            <ShieldCheck className="w-3 h-3 text-brand" />
            <span>{user.role}</span>
          </div>
        )}
      </div>
    </header>
  );
};
