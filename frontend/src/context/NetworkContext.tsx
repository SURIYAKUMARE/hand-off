import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getOutboxItems, syncOutbox, OutboxItem } from '../offline/syncEngine';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';

interface NetworkContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  triggerSync: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(() => getOutboxItems().length);

  const toast = useToast();
  const queryClient = useQueryClient();

  const updatePendingCount = useCallback(() => {
    setPendingCount(getOutboxItems().length);
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const { syncedCount, errors } = await syncOutbox();
      updatePendingCount();

      if (syncedCount > 0) {
        // Invalidate queries so lists and dashboard update immediately
        queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
        queryClient.invalidateQueries({ queryKey: ['tickets-queue'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        toast.success(
          `Synchronized ${syncedCount} offline change${syncedCount === 1 ? '' : 's'} with server.`,
          'Sync Complete'
        );
      }

      if (errors > 0) {
        toast.error(`Unable to synchronize ${errors} item(s). Will retry automatically.`);
      }
    } catch (err) {
      console.warn('Sync attempt failed', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, queryClient, toast, updatePendingCount]);

  // Listen to browser network status events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info('Back online. Synchronizing data with server...', 'Connection Restored');
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Working offline. Any new requests will be saved locally.', 'Offline Mode');
    };

    const handleOutboxChange = () => {
      updatePendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('helpdesk360_outbox_updated', handleOutboxChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('helpdesk360_outbox_updated', handleOutboxChange);
    };
  }, [triggerSync, toast, updatePendingCount]);

  // Periodic heartbeat / healthcheck verification to detect backend unreachable
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          if (!isOnline) {
            setIsOnline(true);
            triggerSync();
          }
        } else {
          if (isOnline) setIsOnline(false);
        }
      } catch (err) {
        if (isOnline) setIsOnline(false);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [isOnline, triggerSync]);

  return (
    <NetworkContext.Provider value={{ isOnline, isSyncing, pendingCount, triggerSync }}>
      {children}
    </NetworkContext.Provider>
  );
};

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
