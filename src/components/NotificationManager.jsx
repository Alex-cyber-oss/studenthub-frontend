import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationManager = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderSyncActive, setReminderSyncActive] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Vérifier l'état initial et les capacités du navigateur
    const checkBrowserSupport = () => {
      const hasNotifications = 'Notification' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      const permission = hasNotifications ? Notification.permission : 'not-supported';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isHttps = window.location.protocol === 'https:';
      const canUseNotifications = isLocalhost || isHttps;
      
      const info = `Notifications: ${hasNotifications ? 'Oui' : 'Non'}, Service Worker: ${hasServiceWorker ? 'Oui' : 'Non'}, Permission: ${permission}, HTTPS/Localhost: ${canUseNotifications ? 'Oui' : 'Non'}`;
      setDebugInfo(info);
      console.log('Support navigateur:', info);
      
      const isEnabled = notificationService.isEnabled();
      setNotificationsEnabled(isEnabled);
    };

    checkBrowserSupport();

    // Surveiller les changements de permission
    const checkPermission = () => {
      const currentEnabled = notificationService.isEnabled();
      setNotificationsEnabled(currentEnabled);
    };

    // Vérifier toutes les 5 secondes
    const permissionInterval = setInterval(checkPermission, 5000);

    // Une fois 5 secondes après le chargement, synchroniser les rappels si activé
    const syncTimer = setTimeout(() => {
      if (isEnabled && !reminderSyncActive) {
        startReminderSync();
      }
    }, 5000);

    return () => {
      clearTimeout(syncTimer);
      clearInterval(permissionInterval);
    };
  }, []); // Suppression des dépendances pour éviter la boucle infinie

  // Effet séparé pour gérer la synchronisation
  useEffect(() => {
    if (notificationsEnabled && !reminderSyncActive) {
      startReminderSync();
    } else if (!notificationsEnabled && reminderSyncActive) {
      stopReminderSync();
    }
  }, [notificationsEnabled, reminderSyncActive]);

  const startReminderSync = async () => {
    console.log('Démarrage synchronisation des rappels...');
    const syncId = notificationService.startReminderSync(60000); // Sync toutes les minutes
    setReminderSyncActive(true);

    // Stocker l'ID pour pouvoir l'arrêter plus tard
    window.reminderSyncId = syncId;

    // Récupérer les stats
    try {
      const reminders = await notificationService.getPendingReminders();
      setPendingCount(reminders.length);
    } catch (error) {
      console.log('Erreur récupération rappels:', error);
    }
  };

  const testNotification = () => {
    console.log('Test de notification...');
    notificationService.sendLocalNotification(
      'Test de notification 🔔',
      {
        body: 'Ceci est un test pour vérifier que les notifications fonctionnent.',
        tag: 'test-notification'
      }
    );
  };

  const enableNotifications = async () => {
    console.log('Demande de permission pour les notifications...');
    
    // Vérifier si nous sommes dans un environnement approprié
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';
    
    if (!isLocalhost && !isHttps) {
      alert('Les notifications nécessitent HTTPS ou localhost. En développement, utilisez localhost.');
      return;
    }
    
    const granted = await notificationService.requestPermission();
    console.log('Permission accordée:', granted);
    
    if (granted) {
      setNotificationsEnabled(true);
      console.log('Notifications activées, démarrage de la synchronisation...');
      
      // Envoyer une notification de test
      notificationService.sendLocalNotification(
        'Notifications activées ! 🔔',
        {
          body: 'Vous recevrez maintenant des rappels pour vos tâches.',
          tag: 'notification-enabled'
        }
      );
      
      // Démarrer la sync
      startReminderSync();
    } else {
      console.log('Permission refusée');
      alert('Permission de notifications refusée. Vous ne recevrez pas de rappels.');
    }
  };

  // Ne pas afficher le composant si les notifications sont déjà activées
  if (notificationsEnabled && reminderSyncActive) {
    return null;
  }

  return (
    <div style={{
      padding: '15px',
      background: '#e7f3ff',
      border: '1px solid #b3d9ff',
      borderRadius: '4px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong>🔔 Rappels de tâches</strong>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#333' }}>
          Activez les notifications pour recevoir des rappels pour vos tâches
        </p>
        {debugInfo && (
          <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>
            {debugInfo}
          </p>
        )}
        {reminderSyncActive && (
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: 'green' }}>
            ✓ Synchronisation active ({pendingCount} rappels en attente)
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        {notificationsEnabled && reminderSyncActive ? (
          <div style={{ fontSize: '12px', color: 'green', textAlign: 'center' }}>
            ✓ Notifications actives
          </div>
        ) : (
          <button
            onClick={enableNotifications}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            Activer les rappels
          </button>
        )}
        {notificationsEnabled && (
          <button
            onClick={testNotification}
            style={{
              padding: '4px 8px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '10px'
            }}
          >
            Test notification
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;
