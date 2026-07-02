import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Bell, BellOff, Check, X, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { requestNotificationPermission, subscribeToPushNotifications } from '../utils/pwa';
import { projectId } from '../utils/supabase/info';

interface PushNotificationSetupProps {
  userId: string;
  accessToken: string;
  onComplete?: () => void;
}

export function PushNotificationSetup({ userId, accessToken, onComplete }: PushNotificationSetupProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('denied');
      return;
    }

    const permission = Notification.permission;
    setNotificationStatus(permission === 'default' ? 'prompt' : permission);

    // Check if already subscribed
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('[PushNotification] Error checking subscription:', error);
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      // Check if Service Worker is supported
      if (!('serviceWorker' in navigator)) {
        toast.error('Push notifications are not supported in your browser.');
        setIsLoading(false);
        return;
      }

      // Check if Service Worker is registered
      const swRegistration = await navigator.serviceWorker.getRegistration();
      if (!swRegistration) {
        toast.error('Service Worker not registered. Please refresh the page and try again.');
        setIsLoading(false);
        return;
      }

      // Request permission
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied. You can enable it later in settings.');
        setNotificationStatus('denied');
        setIsLoading(false);
        return;
      }

      setNotificationStatus('granted');

      // Subscribe to push notifications
      const subscription = await subscribeToPushNotifications();
      
      if (!subscription) {
        toast.error('Failed to subscribe to notifications');
        setIsLoading(false);
        return;
      }

      // Send subscription to backend
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/push-subscription`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              subscription: subscription.toJSON()
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[PushNotification] Backend error:', errorData);
          throw new Error(errorData.error || 'Failed to save subscription');
        }

        const result = await response.json();
        console.log('[PushNotification] Subscription saved:', result);
      } catch (apiError) {
        console.error('[PushNotification] API error:', apiError);
        // Continue anyway - subscription is local, backend can be updated later
        toast.success('✅ Notifications enabled locally! (Backend sync pending)');
      }

      setIsSubscribed(true);
      toast.success('✅ Push notifications enabled! You\'ll receive updates from your partner.');
      
      // Show a test notification
      setTimeout(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('TwoBeOne', {
              body: 'Notifications are now enabled! Stay connected with your partner.',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
              tag: 'welcome-notification'
            });
          }).catch(err => {
            console.error('[PushNotification] Test notification error:', err);
          });
        }
      }, 1000);

      setShowDialog(false);
      onComplete?.();
    } catch (error) {
      console.error('[PushNotification] Setup error:', error);
      toast.error('Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);

    try {
      // Unsubscribe from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/push-subscription`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove subscription');
      }

      // Unsubscribe locally
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      setIsSubscribed(false);
      toast.success('Notifications disabled');
      setShowDialog(false);
    } catch (error) {
      console.error('[PushNotification] Disable error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Show prompt if not subscribed and permission is not denied
  const shouldShowPrompt = notificationStatus === 'prompt' || (notificationStatus === 'granted' && !isSubscribed);

  return (
    <>
      {/* Status indicator button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDialog(true)}
        className={`h-8 w-8 ${isSubscribed ? 'text-success-700 hover:bg-success-50' : 'text-muted-foreground hover:bg-muted'}`}
        title={isSubscribed ? 'Notifications On' : 'Enable Notifications'}
      >
        {isSubscribed ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
      </Button>

      {/* Setup Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              Push Notifications
            </DialogTitle>
            <DialogDescription>
              Stay connected with your partner through instant notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status Card */}
            <Card className={isSubscribed ? 'border-success-500 bg-success-50' : 'border-border'}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${isSubscribed ? 'bg-success-50' : 'bg-muted'}`}>
                    {isSubscribed ? (
                      <Check className="w-5 h-5 text-success-700" />
                    ) : notificationStatus === 'denied' ? (
                      <X className="w-5 h-5 text-error-700" />
                    ) : (
                      <Bell className="w-5 h-5 text-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      {isSubscribed ? 'Notifications Enabled' : 
                       notificationStatus === 'denied' ? 'Notifications Blocked' :
                       'Notifications Available'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSubscribed ? 'You\'ll receive notifications when your partner shares verses, prayer requests, and more.' :
                       notificationStatus === 'denied' ? 'You\'ve blocked notifications. Enable them in your browser settings.' :
                       'Get notified when your partner shares content or completes devotionals.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">You'll be notified about:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <span>Shared Bible verses and highlights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <span>New prayer requests from your partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <span>Journal entries and devotional completions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <span>Daily devotional reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-600" />
                  <span>Milestone celebrations and achievements</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isSubscribed ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDialog(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDisableNotifications}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Disabling...' : 'Disable Notifications'}
                  </Button>
                </>
              ) : notificationStatus === 'denied' ? (
                <div className="w-full">
                  <p className="text-sm text-muted-foreground mb-3">
                    To enable notifications, please allow them in your browser settings.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDialog(false)}
                  >
                    Maybe Later
                  </Button>
                  <Button
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                    onClick={handleEnableNotifications}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Setting up...' : 'Enable Notifications'}
                  </Button>
                </>
              )}
            </div>

            {/* Privacy note */}
            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. You can disable notifications at any time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}