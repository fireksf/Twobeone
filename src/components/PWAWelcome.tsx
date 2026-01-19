import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Smartphone, Download, Wifi, Bell, Heart } from 'lucide-react';
import { isInstalledPWA } from '../utils/pwa';

export function PWAWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isInstalledPWA());
    
    // Show welcome screen if:
    // 1. Not installed
    // 2. First time visitor (no welcome-seen flag)
    // 3. Not dismissed in last 30 days
    const welcomeSeen = localStorage.getItem('twobeone-pwa-welcome-seen');
    const welcomeDismissed = localStorage.getItem('twobeone-pwa-welcome-dismissed');
    
    if (!isInstalledPWA() && !welcomeSeen) {
      // Show after 3 seconds
      setTimeout(() => {
        setShowWelcome(true);
      }, 3000);
    } else if (welcomeDismissed) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (new Date(welcomeDismissed) < thirtyDaysAgo) {
        // Show again after 30 days
        setTimeout(() => {
          setShowWelcome(true);
        }, 3000);
      }
    }
  }, []);

  const handleGotIt = () => {
    setShowWelcome(false);
    localStorage.setItem('twobeone-pwa-welcome-seen', 'true');
  };

  const handleDismiss = () => {
    setShowWelcome(false);
    localStorage.setItem('twobeone-pwa-welcome-dismissed', new Date().toISOString());
  };

  if (!showWelcome || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl animate-in zoom-in duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome to TwoBeOne!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your faith-centered couples app</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              TwoBeOne works best when installed on your device. Get the full app experience!
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Install App</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  One tap from home screen
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <Wifi className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Works Offline</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Access content anytime
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-pink-100 dark:border-pink-800">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <Bell className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Get Notified</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Daily reminders & alerts
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Full Screen</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  App-like experience
                </p>
              </div>
            </div>

            {/* Installation Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>💡 How to install:</strong>
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li><strong>Android/Desktop:</strong> Look for the install prompt or button in the address bar</li>
                <li><strong>iOS:</strong> Tap Share → "Add to Home Screen"</li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleGotIt}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                Got It!
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
