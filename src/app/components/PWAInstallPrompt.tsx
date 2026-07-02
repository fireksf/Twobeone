import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    // Show prompt if not dismissed in last 7 days and not already installed
    if (!isInStandaloneMode && (!dismissed || Date.now() - dismissedTime > sevenDaysInMs)) {
      if (iOS) {
        // Show iOS install instructions after 3 seconds
        setTimeout(() => setShowPrompt(true), 3000);
      } else {
        // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowPrompt(true);
        };
        
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500 md:left-auto md:right-4 md:max-w-md">
      <Card className="bg-gradient-to-r from-primary-600 to-primary-600 border-0 shadow-2xl">
        <div className="p-4 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center text-2xl">
                💑
              </div>
              <div>
                <h3 className="font-semibold">Install TwoBeOne</h3>
                <p className="text-sm text-primary-100">
                  {isIOS ? 'Add to Home Screen' : 'Install for quick access'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-primary-100 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isIOS ? (
            <div className="space-y-2 text-sm bg-white/10 rounded-lg p-3 mb-3">
              <p className="font-medium">To install on iOS:</p>
              <ol className="space-y-1 list-decimal list-inside text-primary-100">
                <li>Tap the <Share className="w-4 h-4 inline" /> Share button below</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-sm text-primary-100">
                Get faster access and work offline! Install TwoBeOne on your device.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-card text-primary-600 hover:bg-primary-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Not Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
