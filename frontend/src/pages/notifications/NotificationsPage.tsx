import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  BellAlertIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notificationsService, type Notification } from '@/services/notifications.service';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await notificationsService.getList(filterUnread === true);
      if (filterUnread === false) {
        setNotifications(list.filter((n) => n.readAt));
      } else {
        setNotifications(list);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterUnread]);

  const handleMarkAsRead = async (n: Notification) => {
    try {
      await notificationsService.markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      if (n.relatedType === 'surgery' && n.relatedId) {
        navigate(`/planning/surgeries/${n.relatedId}`);
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <div className="flex items-center gap-2">
          <select
            value={filterUnread === null ? 'all' : filterUnread ? 'unread' : 'read'}
            onChange={(e) => {
              const v = e.target.value;
              setFilterUnread(v === 'all' ? null : v === 'unread');
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-medical-primary focus:outline-none"
          >
            <option value="all">Todas</option>
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
          </select>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-medical-primary text-white text-sm font-medium hover:bg-medical-secondary transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              Marcar todas leídas
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          <BellIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p>No hay notificaciones</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md ${
                n.readAt ? 'border-gray-200' : 'border-medical-primary/30 bg-medical-primary/5'
              }`}
            >
              <button
                type="button"
                onClick={() => handleMarkAsRead(n)}
                className="w-full text-left p-4 flex items-start gap-4"
              >
                <span className="shrink-0 mt-0.5 text-gray-500">
                  {n.readAt ? (
                    <BellIcon className="w-5 h-5" />
                  ) : (
                    <BellAlertIcon className="w-5 h-5 text-medical-primary" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{n.title}</p>
                  {n.message && (
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(n.createdAt), "d 'de' MMMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
