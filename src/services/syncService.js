/**
 * Service de synchronisation des requêtes hors ligne
 * Synchronise les requêtes en queue quand la connexion revient
 */

import api from '../api/axiosConfig';
import { getQueuedRequests, removeFromQueue, updateQueueItem } from './offlineService';

let isSyncing = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 secondes

/**
 * Attend un délai avant de retry
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Envoie une requête avec retry
 */
const executeRequest = async (queueItem) => {
  try {
    const config = {
      method: queueItem.method,
      url: queueItem.url,
      data: queueItem.data,
      headers: queueItem.headers
    };

    const response = await api(config);
    console.log(`✅ Synchronisé: ${queueItem.method} ${queueItem.url}`);
    return { success: true, response };
  } catch (error) {
    console.error(`❌ Erreur sync: ${queueItem.method} ${queueItem.url}`, error.message);
    throw error;
  }
};

/**
 * Synchronise toutes les requêtes en queue
 */
export const syncQueuedRequests = async () => {
  // Éviter les sync parallèles
  if (isSyncing) {
    console.log('⏳ Synchronisation déjà en cours...');
    return;
  }

  isSyncing = true;
  console.log('🔄 Démarrage de la synchronisation des requêtes en queue...');

  try {
    const queuedRequests = await getQueuedRequests();
    
    if (queuedRequests.length === 0) {
      console.log('✨ Aucune requête à synchroniser');
      isSyncing = false;
      return;
    }

    console.log(`📦 ${queuedRequests.length} requête(s) à synchroniser`);

    // Traiter chaque requête
    for (const queueItem of queuedRequests) {
      try {
        await executeRequest(queueItem);
        
        // Supprimer de la queue si succès
        await removeFromQueue(queueItem.id);
        
        // Notifier les clients
        notifyClients({
          type: 'SYNC_SUCCESS',
          item: queueItem
        });
      } catch (error) {
        // Gérer les retries
        if (queueItem.retries < MAX_RETRIES) {
          console.log(`⏳ Retry ${queueItem.retries + 1}/${MAX_RETRIES} pour: ${queueItem.method} ${queueItem.url}`);
          
          await updateQueueItem(queueItem.id, {
            retries: queueItem.retries + 1,
            lastError: error.message
          });

          // Attendre avant le prochain retry
          await delay(RETRY_DELAY * (queueItem.retries + 1));
        } else {
          console.error(`❌ Max retries atteint pour: ${queueItem.method} ${queueItem.url}`);
          
          // Notifier l'erreur
          notifyClients({
            type: 'SYNC_ERROR',
            item: queueItem,
            error: error.message
          });
        }
      }
    }

    console.log('✅ Synchronisation terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  } finally {
    isSyncing = false;
  }
};

/**
 * Notifie les clients de l'état de synchronisation
 */
const notifyClients = async (message) => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Envoyer le message via le Service Worker
      if (registration.controller) {
        registration.controller.postMessage(message);
      }

      // Aussi émettre un événement localStorage pour les autres onglets
      window.dispatchEvent(new CustomEvent('sync_status', { detail: message }));
    } catch (error) {
      console.error('Erreur notification clients:', error);
    }
  }
};

/**
 * Détecte le changement de connexion
 */
export const listenForConnectionChanges = () => {
  // Quand la connexion revient
  window.addEventListener('online', () => {
    console.log('🟢 Connexion rétablie!');
    // Attendre 1 sec pour s'assurer que la connexion est stable
    setTimeout(syncQueuedRequests, 1000);
  });

  // Quand on perd la connexion
  window.addEventListener('offline', () => {
    console.log('🔴 Pas de connexion');
  });
};

/**
 * Vérifie si on est connecté
 */
export const isOnline = () => {
  return navigator.onLine;
};

export default {
  syncQueuedRequests,
  listenForConnectionChanges,
  isOnline
};
