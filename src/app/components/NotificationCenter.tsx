import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, Heart, MessageCircle, Users, MessageSquareDot } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'devotional' | 'journal' | 'prayer' | 'question' | 'question_answered' | 'partner_link' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationCenterProps {
  accessToken: string;
  projectId: string;
  publicAnonKey: string;
  onNotificationClick?: (notification: Notification) => void;
}

const SESSION_KEY = 'dismissed_notification_ids';

function getSessionDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addSessionDismissed(ids: string[]) {
  try {
    const existing = getSessionDismissed();
    ids.forEach(id => existing.add(id));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...existing]));
  } catch {
    // sessionStorage unavailable — no-op
  }
}

export function NotificationCenter({
  accessToken,
  projectId,
  publicAnonKey,
  onNotificationClick
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter out session-dismissed notifications before displaying
  const visible = notifications.filter(n => !getSessionDismissed().has(n.id));
  const unreadCount = visible.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/notifications`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        if (response.status !== 401) {
          console.warn('Failed to fetch notifications (status:', response.status, ')');
        }
        setNotifications([]);
        return;
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error: any) {
      const isNetworkErr =
        error?.message?.includes('Unable to connect') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('timeout') ||
        error instanceof TypeError;
      if (!isNetworkErr) {
        console.warn('Could not load notifications:', error);
      }
      setNotifications([]);
    }
  }, [accessToken, projectId]);

  useEffect(() => {
    if (!accessToken) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [accessToken, fetchNotifications]);

  // Auto-dismiss: when panel opens, mark all currently visible unread notifications
  // as read after a 2.5s view delay, then remove them from the panel.
  useEffect(() => {
    if (!isOpen) {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
      return;
    }

    const unreadVisible = visible.filter(n => !n.isRead);
    if (unreadVisible.length === 0) return;

    autoDismissTimer.current = setTimeout(async () => {
      const ids = unreadVisible.map(n => n.id);

      // Optimistically remove from panel immediately
      addSessionDismissed(ids);
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));

      // Persist read state server-side (fire-and-forget)
      ids.forEach(id => {
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/notifications/${id}/read`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        ).catch(err => console.warn('Auto-dismiss mark-read failed for', id, err));
      });
    }, 2500);

    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [isOpen]);

  const dismissNotification = useCallback((notificationId: string) => {
    // Optimistic removal
    addSessionDismissed([notificationId]);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // Persist server-side
    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(err => console.warn('Mark-read failed for', notificationId, err));
  }, [accessToken, projectId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    // Optimistic removal
    addSessionDismissed([notificationId]);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) throw new Error('Delete failed');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [accessToken, projectId]);

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/notifications/read-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to mark all as read');

      // Optimistically remove all unread from panel for this session
      const unreadIds = visible.filter(n => !n.isRead).map(n => n.id);
      addSessionDismissed(unreadIds);
      setNotifications(prev => prev.filter(n => n.isRead));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    dismissNotification(notification.id);
    setIsOpen(false);
    if (onNotificationClick) onNotificationClick(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'devotional': return <Heart style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} className="fill-current" />;
      case 'journal':    return <MessageCircle style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />;
      case 'prayer':     return <Heart style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />;
      case 'question':   return <MessageCircle style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />;
      case 'question_answered': return <MessageSquareDot style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />;
      case 'partner_link': return <Users style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />;
      default: return <Bell style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />;
    }
  };

  const getIconStyle = (type: string): React.CSSProperties => {
    switch (type) {
      case 'devotional':
        return { background: 'var(--primary-50)', color: 'var(--primary-600)' };
      case 'journal':
        return { background: 'var(--secondary-50)', color: 'var(--secondary-600)' };
      case 'prayer':
        return { background: 'var(--primary-100)', color: 'var(--primary-500)' };
      case 'question':
        return { background: 'var(--success-50)', color: 'var(--success-700)' };
      case 'question_answered':
        return { background: 'var(--success-50)', color: 'var(--success-700)' };
      case 'partner_link':
        return { background: 'var(--warning-50)', color: 'var(--warning-700)' };
      default:
        return { background: 'var(--neutral-100)', color: 'var(--neutral-600)' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffInMs = Date.now() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          padding: 'var(--spacing-2)',
          borderRadius: 'var(--radius-full)',
          transition: 'background 150ms',
          color: 'var(--neutral-700)',
          background: 'transparent',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral-100)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        aria-label="Notifications"
      >
        <Bell style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
        {unreadCount > 0 && (
          <Badge
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              height: '20px',
              minWidth: '20px',
              padding: '0 var(--spacing-1)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--font-weight-bold)',
              background: 'var(--error-500)',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + var(--spacing-2))',
              width: 'min(calc(100vw - var(--spacing-8)), 384px)',
              background: 'var(--card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)',
              zIndex: 50,
              maxHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-4)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--foreground)',
                    margin: 0,
                  }}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p
                    style={{
                      fontSize: 'var(--text-caption-small)',
                      color: 'var(--muted-foreground)',
                      margin: 0,
                    }}
                  >
                    {unreadCount} unread · auto-dismissing in a moment
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={isLoading}
                    style={{ fontSize: 'var(--text-caption-small)' }}
                  >
                    <Check style={{ width: 12, height: 12, marginRight: 4 }} />
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: 'var(--spacing-1)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    color: 'var(--muted-foreground)',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
              {visible.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-12) var(--spacing-4)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <Bell
                    style={{
                      width: 'var(--icon-2xl)',
                      height: 'var(--icon-2xl)',
                      margin: '0 auto var(--spacing-3)',
                      color: 'var(--neutral-300)',
                    }}
                  />
                  <p
                    style={{
                      fontSize: 'var(--text-callout)',
                      margin: '0 0 var(--spacing-1)',
                    }}
                  >
                    All caught up
                  </p>
                  <p style={{ fontSize: 'var(--text-caption-small)', margin: 0 }}>
                    You'll be notified when your partner completes activities
                  </p>
                </div>
              ) : (
                <div>
                  {visible.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: 'var(--spacing-3) var(--spacing-4)',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: !notification.isRead ? 'var(--secondary-50)' : 'transparent',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                      onMouseLeave={e =>
                        (e.currentTarget.style.background = !notification.isRead
                          ? 'var(--secondary-50)'
                          : 'transparent')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                        {/* Icon bubble */}
                        <div
                          style={{
                            flexShrink: 0,
                            width: 'var(--icon-xl)',
                            height: 'var(--icon-xl)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...getIconStyle(notification.type),
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontSize: 'var(--text-callout)',
                                  fontWeight: !notification.isRead
                                    ? 'var(--font-weight-semibold)'
                                    : 'var(--font-weight-medium)',
                                  color: 'var(--foreground)',
                                  margin: 0,
                                }}
                              >
                                {notification.title}
                              </p>
                              <p
                                style={{
                                  fontSize: 'var(--text-caption)',
                                  color: 'var(--neutral-600)',
                                  margin: 'var(--spacing-1) 0 0',
                                }}
                              >
                                {notification.message}
                              </p>
                            </div>
                            {/* Delete button */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              style={{
                                flexShrink: 0,
                                padding: 'var(--spacing-1)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'transparent',
                                color: 'var(--muted-foreground)',
                                transition: 'background 150ms',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral-200)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              aria-label="Dismiss"
                            >
                              <X style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                          <p
                            style={{
                              fontSize: 'var(--text-label)',
                              color: 'var(--muted-foreground)',
                              marginTop: 'var(--spacing-1)',
                            }}
                          >
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notification.isRead && (
                          <div
                            style={{
                              flexShrink: 0,
                              width: 8,
                              height: 8,
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--secondary-500)',
                              marginTop: 'var(--spacing-2)',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
