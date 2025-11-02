import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Auto-hide success banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
      
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register('sync-form-data');
        }).catch((err) => console.error('Sync registration failed:', err));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for SW messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          setPendingSync(0);
          checkPendingRequests();
        }
      });
    }

    // Check pending requests on mount
    checkPendingRequests();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingRequests = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('pending-requests', 'readonly');
      const store = tx.objectStore('pending-requests');
      const count = await new Promise<number>((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
      setPendingSync(count);
    } catch (error) {
      setPendingSync(0);
    }
  };

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('krishiraksha-offline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  if (!showBanner && isOnline && pendingSync === 0) {
    // Don't show indicator when everything is normal
    return null;
  }

  return (
    <>
      {/* Toast-style banner for connection changes */}
      {showBanner && (
        <div
          className={`fixed top-4 right-4 z-50 animate-slide-in-right ${className}`}
          style={{
            maxWidth: '400px',
          }}
        >
          <div
            className="rounded-lg shadow-lg p-4 flex items-center gap-3"
            style={{
              backgroundColor: isOnline ? '#E8F5E8' : '#FFF3E0',
              borderLeft: `4px solid ${isOnline ? '#2E7D32' : '#F9A825'}`,
            }}
            role="status"
            aria-live="polite"
          >
            <div className="flex-shrink-0">
              {isOnline ? (
                <Wifi className="w-6 h-6" style={{ color: '#2E7D32' }} aria-hidden="true" />
              ) : (
                <WifiOff className="w-6 h-6" style={{ color: '#F9A825' }} aria-hidden="true" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: isOnline ? '#2E7D32' : '#F9A825' }}>
                {isOnline ? 'Back Online' : 'You\'re Offline'}
              </p>
              <p className="text-sm" style={{ color: isOnline ? '#616161' : '#9E9E9E' }}>
                {isOnline
                  ? 'Connection restored. Syncing data...'
                  : 'Changes will be saved and synced later.'}
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 p-1 hover:bg-black/5 rounded"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Persistent indicator for pending sync */}
      {!isOnline && showDetails && (
        <div
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 ${className}`}
        >
          <div
            className="rounded-lg shadow-lg p-4"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <CloudOff className="w-5 h-5 mt-0.5" style={{ color: '#F9A825' }} aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#212121' }}>
                  Offline Mode
                </p>
                <p className="text-xs" style={{ color: '#616161' }}>
                  You can continue working. Data will sync automatically.
                </p>
              </div>
            </div>

            {pendingSync > 0 && (
              <div
                className="mt-3 pt-3 flex items-center justify-between text-sm"
                style={{ borderTop: '1px solid #E0E0E0' }}
              >
                <span style={{ color: '#616161' }}>
                  {pendingSync} pending sync{pendingSync !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1" style={{ color: '#F9A825' }}>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="text-xs">Queued</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact status badge (always visible when offline) */}
      {!isOnline && !showDetails && (
        <div
          className={`fixed bottom-4 right-4 z-40 ${className}`}
        >
          <div
            className="rounded-full shadow-lg px-4 py-2 flex items-center gap-2"
            style={{ backgroundColor: '#FFF3E0', border: '1px solid #F9A825' }}
            role="status"
            aria-label="Offline status"
          >
            <WifiOff className="w-4 h-4" style={{ color: '#F9A825' }} aria-hidden="true" />
            <span className="text-sm font-medium" style={{ color: '#F9A825' }}>
              Offline
            </span>
            {pendingSync > 0 && (
              <span
                className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#F9A825', color: 'white' }}
              >
                {pendingSync}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
