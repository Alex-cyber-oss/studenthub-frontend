import api from '../api/axiosConfig';

export const notificationService = {
  /**
   * Demander la permission pour les notifications
   */
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.log('Les notifications ne sont pas supportées par ce navigateur');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Vérifier si les notifications sont activées
   */
  isEnabled: () => {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  /**
   * S'inscrire aux notifications push (Web Push)
   */
  subscribeToPush: async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Les notifications push ne sont pas supportées');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        console.log('Déjà abonné aux notifications push');
        return subscription;
      }

      // Ici il faudrait avoir une clé publique VAPID depuis le serveur
      // Pour l'instant, on utilise une approche de notifications simples
      console.log('Service pour s\'abonner aux push réussi');
      return null;
    } catch (error) {
      console.log('Erreur inscription notifications push:', error);
      return null;
    }
  },

  /**
   * Envoyer une notification locale (test)
   */
  sendLocalNotification: (title, options = {}) => {
    if (notificationService.isEnabled()) {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });
    } else {
      console.log('Les notifications ne sont pas activées');
    }
  },

  /**
   * Récupérer les rappels en attente
   */
  getPendingReminders: () => {
    return api.get('/reminders/pending')
      .then(response => response.data)
      .catch(err => {
        console.log('Erreur récupération reminders:', err);
        return [];
      });
  },

  /**
   * Marquer un rappel comme envoyé
   */
  markReminderAsSent: (reminderId) => {
    return api.patch(`/reminders/${reminderId}/sent`)
      .then(response => response.data);
  },

  /**
   * Synchroniser les rappels avec le serveur
   */
  syncReminders: async () => {
    try {
      const reminders = await notificationService.getPendingReminders();
      
      for (const reminder of reminders) {
        // Envoyer une notification pour chaque rappel
        notificationService.sendLocalNotification(
          `Rappel: ${reminder.task.title}`,
          {
            body: `Deadline: ${new Date(reminder.task.deadline).toLocaleDateString('fr-FR')}`,
            tag: `task-${reminder.task.id}`,
            requireInteraction: true,
            data: {
              taskId: reminder.task.id,
              courseId: reminder.task.course_id
            }
          }
        );

        // Marquer comme envoyé
        await notificationService.markReminderAsSent(reminder.id);
      }
    } catch (error) {
      console.log('Erreur sync reminders:', error);
    }
  },

  /**
   * Lancer la synchronisation périodique des rappels
   */
  startReminderSync: (intervalMs = 60000) => {
    // Sync immédiatement au démarrage
    notificationService.syncReminders();

    // Puis toutes les minutes
    return setInterval(() => {
      notificationService.syncReminders();
    }, intervalMs);
  },

  /**
   * Arrêter la synchronisation
   */
  stopReminderSync: (intervalId) => {
    clearInterval(intervalId);
  }
};
