import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Smartphone, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function PWADebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const info: any = {};

    // Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    info.isIOS = /iphone|ipad|ipod/.test(userAgent);
    info.isAndroid = /android/.test(userAgent);
    info.isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    info.isChrome = /chrome/.test(userAgent);
    
    // PWA status
    info.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    info.isStandaloneNavigator = (window.navigator as any).standalone;
    info.isInstallable = 'BeforeInstallPromptEvent' in window;
    
    // Service Worker
    info.hasServiceWorker = 'serviceWorker' in navigator;
    info.serviceWorkerReady = false;
    
    if (info.hasServiceWorker) {
      navigator.serviceWorker.ready.then(() => {
        info.serviceWorkerReady = true;
        setDebugInfo({ ...info });
      });
    }
    
    // Manifest
    info.hasManifest = document.querySelector('link[rel="manifest"]') !== null;
    
    // Icons
    info.hasAppleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') !== null;
    
    // HTTPS
    info.isHTTPS = window.location.protocol === 'https:';
    info.isLocalhost = window.location.hostname === 'localhost';
    
    // Viewport
    info.viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
    
    setDebugInfo(info);
  }, []);

  // Show debug info after 5 taps on the screen corner (for testing)
  useEffect(() => {
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;

    const handleTap = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Check if tap is in top-right corner
      if (touch.clientX > window.innerWidth - 100 && touch.clientY < 100) {
        tapCount++;
        clearTimeout(tapTimer);
        
        if (tapCount >= 5) {
          setShowDebug(true);
          tapCount = 0;
        }
        
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 2000);
      }
    };

    document.addEventListener('touchstart', handleTap);
    return () => {
      document.removeEventListener('touchstart', handleTap);
      clearTimeout(tapTimer);
    };
  }, []);

  if (!showDebug) {
    return null;
  }

  const StatusIcon = ({ value }: { value: boolean }) => {
    return value ? (
      <CheckCircle2 className="w-16 h-16 text-green-600" />
    ) : (
      <XCircle className="w-16 h-16 text-red-600" />
    );
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-16">
      <Card className="bg-white dark:bg-gray-900 p-24 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-12 mb-24">
          <Smartphone className="w-24 h-24 text-violet-600" />
          <h2 className="text-gray-900 dark:text-white">PWA Debug Info</h2>
        </div>

        <div className="space-y-16">
          <div className="space-y-8">
            <h3 className="text-gray-700 dark:text-gray-300 flex items-center gap-8">
              <AlertCircle className="w-20 h-20" />
              Device & Browser
            </h3>
            <div className="pl-28 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">iOS Device</span>
                <StatusIcon value={debugInfo.isIOS} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Android Device</span>
                <StatusIcon value={debugInfo.isAndroid} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Safari Browser</span>
                <StatusIcon value={debugInfo.isSafari} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Chrome Browser</span>
                <StatusIcon value={debugInfo.isChrome} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-gray-700 dark:text-gray-300 flex items-center gap-8">
              <AlertCircle className="w-20 h-20" />
              PWA Status
            </h3>
            <div className="pl-28 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Standalone Mode</span>
                <StatusIcon value={debugInfo.isStandalone} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Standalone (iOS)</span>
                <StatusIcon value={debugInfo.isStandaloneNavigator} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Installable</span>
                <StatusIcon value={debugInfo.isInstallable} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-gray-700 dark:text-gray-300 flex items-center gap-8">
              <AlertCircle className="w-20 h-20" />
              Requirements
            </h3>
            <div className="pl-28 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Worker Support</span>
                <StatusIcon value={debugInfo.hasServiceWorker} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Worker Ready</span>
                <StatusIcon value={debugInfo.serviceWorkerReady} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Manifest Present</span>
                <StatusIcon value={debugInfo.hasManifest} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Apple Touch Icon</span>
                <StatusIcon value={debugInfo.hasAppleTouchIcon} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">HTTPS</span>
                <StatusIcon value={debugInfo.isHTTPS || debugInfo.isLocalhost} />
              </div>
            </div>
          </div>

          {debugInfo.isIOS && !debugInfo.isStandalone && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-16">
              <h4 className="text-yellow-900 dark:text-yellow-200 mb-8">iOS Installation Steps</h4>
              <ol className="list-decimal list-inside space-y-4 text-sm text-yellow-800 dark:text-yellow-300">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install the app</li>
              </ol>
            </div>
          )}

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-xs font-mono">
            <div className="text-gray-600 dark:text-gray-400">
              User Agent: {window.navigator.userAgent.substring(0, 100)}...
            </div>
          </div>
        </div>

        <div className="mt-24 flex gap-8">
          <Button onClick={() => setShowDebug(false)} className="flex-1">
            Close
          </Button>
          <Button 
            onClick={() => {
              const debugText = JSON.stringify(debugInfo, null, 2);
              navigator.clipboard?.writeText(debugText);
              alert('Debug info copied to clipboard!');
            }}
            variant="outline"
            className="flex-1"
          >
            Copy Info
          </Button>
        </div>
      </Card>
    </div>
  );
}
