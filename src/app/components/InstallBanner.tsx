import { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Don't show banner if already installed
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('installBannerDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    if (dismissedTime > oneDayAgo) {
      return; // Don't show if dismissed within last 24 hours
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);

    setIsIOS(iOS);
    setIsAndroid(android);

    // Show banner after a short delay for better UX
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 3000); // Show after 3 seconds

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome - use native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - show instructions (can't programmatically install)
      // Instructions are already visible in the banner
      return;
    } else {
      // Fallback - just hide banner
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-slide-up">
      <div className="max-w-lg mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4 pr-8">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-white rounded-2xl p-2 shadow-lg">
                <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(256, 256)">
                    <path d="M-60 -20 C-60 -60, -90 -80, -120 -60 C-150 -40, -150 0, -120 30 L-60 80 L-60 -20 Z" fill="url(#miniGradient)" opacity="0.9"/>
                    <path d="M60 -20 C60 -60, 90 -80, 120 -60 C150 -40, 150 0, 120 30 L60 80 L60 -20 Z" fill="url(#miniGradient)" opacity="0.9"/>
                    <path d="M0 -30 C0 -70, -30 -90, -60 -70 C-75 -60, -80 -40, -80 -20 C-80 10, -60 40, 0 90 C60 40, 80 10, 80 -20 C80 -40, 75 -60, 60 -70 C30 -90, 0 -70, 0 -30 Z" fill="url(#miniGradient)"/>
                  </g>
                  <defs>
                    <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-1">
                Install TwoBeOne
              </h3>
              <p className="text-white/90 text-sm mb-3">
                Add to your home screen for the best experience
              </p>

              {/* Platform-specific instructions */}
              {isIOS && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
                  <div className="flex items-start gap-2 text-white/95 text-xs">
                    <Share className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">To install on iOS:</p>
                      <ol className="list-decimal list-inside space-y-1 text-white/80">
                        <li>Tap the <Share className="w-3 h-3 inline mx-1" /> Share button below</li>
                        <li>Scroll and tap "Add to Home Screen"</li>
                        <li>Tap "Add" to confirm</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {isAndroid && deferredPrompt && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
                  <div className="flex items-start gap-2 text-white/95 text-xs">
                    <Download className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Tap the button below to install TwoBeOne on your device</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {deferredPrompt && !isIOS && (
                  <Button
                    onClick={handleInstallClick}
                    className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install App
                  </Button>
                )}

                {!deferredPrompt && !isIOS && (
                  <div className="text-white/80 text-xs">
                    Open menu <span className="inline-block">⋮</span> and select "Install app" or "Add to Home screen"
                  </div>
                )}

                {isIOS && (
                  <Button
                    onClick={handleDismiss}
                    className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30"
                  >
                    Got it!
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-white/90 font-semibold text-xs">⚡ Faster</div>
                <div className="text-white/70 text-xs">Instant access</div>
              </div>
              <div>
                <div className="text-white/90 font-semibold text-xs">📱 Native</div>
                <div className="text-white/70 text-xs">App-like feel</div>
              </div>
              <div>
                <div className="text-white/90 font-semibold text-xs">🔔 Alerts</div>
                <div className="text-white/70 text-xs">Get notified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
