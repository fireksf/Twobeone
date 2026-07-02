import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { isOnline, addNetworkListeners } from '../utils/pwa';

export function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const cleanup = addNetworkListeners(
      () => {
        console.log('[Network] Back online');
        setOnline(true);
        setShowReconnected(true);
        
        // Hide the "reconnected" message after 3 seconds
        setTimeout(() => {
          setShowReconnected(false);
        }, 3000);
      },
      () => {
        console.log('[Network] Gone offline');
        setOnline(false);
        setShowReconnected(false);
      }
    );

    return cleanup;
  }, []);

  // Show reconnected message temporarily
  if (online && showReconnected) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top duration-300">
        <div className="bg-success-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      </div>
    );
  }

  // Show offline banner
  if (!online) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[300] animate-in slide-in-from-top duration-300">
        <div className="bg-warning-500 text-white px-4 py-3 flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">
            You're offline. Some features may be limited.
          </span>
        </div>
      </div>
    );
  }

  return null;
}
