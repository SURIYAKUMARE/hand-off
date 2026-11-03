import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { NotificationItem } from '@helpdesk360/shared';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; notifications: NotificationItem[] }>('/notifications');
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      // offline or network error handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup SSE connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/notifications/stream', { withCredentials: true });
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.id) {
            setNotifications((prev) => [data, ...prev.filter((n) => n.id !== data.id)]);
          }
        } catch {
          // ignore parse errors
        }
      };
    } catch (e) {
      // fallback
    }

    // Polling fallback every 60s
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string, link?: string | null) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // continue
    }
    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // continue
    }
  };

  const formatTime = (dateStr: string | Date) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border bg-surface shadow-xs transition-colors cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-modal z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-3 border-b border-border flex items-center justify-between bg-surface-muted">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-text-primary tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand/15 text-brand border border-brand/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-brand hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Bell className="w-6 h-6 text-text-muted mx-auto mb-2 opacity-40" />
                <p className="text-xs text-text-muted">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id, item.link)}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-surface-hover flex gap-3 ${
                    !item.isRead ? 'bg-brand/5 dark:bg-brand/10' : 'bg-surface'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full block ${
                        !item.isRead ? 'bg-brand shadow-xs' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {item.message}
                    </div>
                    <div className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.createdAt)}</span>
                      {item.link && (
                        <span className="ml-auto text-brand text-[10px] font-sans font-medium flex items-center gap-0.5">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
