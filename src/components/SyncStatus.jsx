import React, { useEffect, useState } from 'react';
import { getQueueCount } from '../services/offlineService';
import { syncQueuedRequests, isOnline } from '../services/syncService';
import './SyncStatus.css';

function SyncStatus() {
  const [queueCount, setQueueCount] = useState(0);
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Vérifier la queue au démarrage
    updateQueueCount();

    // Écouter les changements de connexion
    const handleOnline = () => {
      console.log('🟢 En ligne');
      setIsConnected(true);
      syncQueuedRequests();
    };

    const handleOffline = () => {
      console.log('🔴 Hors ligne');
      setIsConnected(false);
    };

    // Écouter les messages de synchronisation
    const handleSyncStatus = (event) => {
      const { type } = event.detail;
      if (type === 'SYNC_SUCCESS' || type === 'SYNC_ERROR') {
        updateQueueCount();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync_status', handleSyncStatus);

    // Mettre à jour la queue périodiquement
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync_status', handleSyncStatus);
      clearInterval(interval);
    };
  }, []);

  const updateQueueCount = async () => {
    const count = await getQueueCount();
    setQueueCount(count);
  };

  const handleManualSync = async () => {
    if (!isConnected) {
      alert('Pas de connexion internet');
      return;
    }

    setIsSyncing(true);
    try {
      await syncQueuedRequests();
      await updateQueueCount();
    } finally {
      setIsSyncing(false);
    }
  };

  // Ne pas afficher si en ligne et aucune queue
  if (isConnected && queueCount === 0) {
    return null;
  }

  return (
    <div className={`sync-status ${isConnected ? 'online' : 'offline'}`}>
      <div className="sync-status-content">
        {!isConnected ? (
          <>
            <span className="status-icon">🔴</span>
            <div className="status-text">
              <p className="status-title">Mode hors ligne</p>
              {queueCount > 0 && (
                <p className="status-info">{queueCount} action(s) en attente</p>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="status-icon">🟢</span>
            <div className="status-text">
              <p className="status-title">En ligne</p>
              {queueCount > 0 && (
                <p className="status-info">
                  {isSyncing ? '⏳ Synchronisation...' : `${queueCount} action(s) à synchroniser`}
                </p>
              )}
            </div>
            {queueCount > 0 && (
              <button 
                className="sync-button"
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                {isSyncing ? '⏳' : '🔄'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SyncStatus;
