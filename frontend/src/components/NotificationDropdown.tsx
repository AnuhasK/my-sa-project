import { useEffect, useState } from 'react';
import { X, CheckCheck, Loader2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { api } from '../services/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onNotificationClick?: (notification: Notification) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  token,
  onNotificationClick,
  onUnreadCountChange
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchNotifications();
    }
  }, [isOpen, token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotifications(token, 1, 20);
      setNotifications(data.notifications || data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id, token);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update unread count
      const unreadCount = notifications.filter(n => !n.isRead && n.id !== id).length;
      onUnreadCountChange?.(unreadCount);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(token);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      onUnreadCountChange?.(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteNotification(id, token);
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Update unread count if deleted notification was unread
      if (deletedNotif && !deletedNotif.isRead) {
        const unreadCount = notifications.filter(n => !n.isRead && n.id !== id).length;
        onUnreadCountChange?.(unreadCount);
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <CheckCheck className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              // TODO: Navigate to full notifications page
              onClose();
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
