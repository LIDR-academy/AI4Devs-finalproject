import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  BellAlertIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { notificationsService, type Notification } from '@/services/notifications.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NOTIFICATIONS_PREVIEW = 5;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (unreadOnly = false) => {
    setLoading(true);
    try {
      const list = await notificationsService.getList(unreadOnly);
      const items = Array.isArray(list) ? list : [];
      setNotifications(items);
      if (!unreadOnly) {
        setUnreadCount(items.filter((n) => !n.readAt).length);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(false);
  }, []);

  // Auto-refresh: cada 60s y al recuperar foco en la ventana
  useEffect(() => {
    const interval = setInterval(() => fetchNotifications(false), 60_000);
    const onFocus = () => fetchNotifications(false);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, relatedId: string | null, relatedType: string | null) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setOpen(false);
      if (relatedType === 'surgery' && relatedId) {
        navigate(`/planning/surgeries/${relatedId}`);
      }
    } catch {
      // keep dropdown open on error
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const preview = notifications.slice(0, NOTIFICATIONS_PREVIEW);
  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (open) return;
          fetchNotifications(false);
        }}
        className="relative p-2 rounded-lg text-white/90 hover:bg-white/20 transition-colors"
        aria-label="Notificaciones"
      >
        {hasUnread ? (
          <BellAlertIcon className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-hidden rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200 z-[100] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-sm text-medical-primary hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Cargando…</div>
            ) : preview.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {preview.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkAsRead(n.id, n.relatedId, n.relatedType)
                      }
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3"
                    >
                      <span
                        className={
                          n.readAt
                            ? 'text-gray-400 mt-0.5'
                            : 'text-medical-primary mt-0.5'
                        }
                      >
                        {n.readAt ? (
                          <BellIcon className="w-5 h-5" />
                        ) : (
                          <BellAlertIcon className="w-5 h-5" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-2 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
                className="w-full py-2 text-sm font-medium text-medical-primary hover:bg-white rounded-lg flex items-center justify-center gap-1"
              >
                Ver todas
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
