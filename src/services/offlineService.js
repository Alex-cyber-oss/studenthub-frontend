/**
 * Service de gestion des opérations hors ligne
 * Stocke les requêtes en attente dans IndexedDB et les synchronise quand possible
 */

const DB_NAME = 'StudentHubOffline';
const DB_VERSION = 1;
const STORE_NAME = 'requests_queue';

/**
 * Ouvre la base de données IndexedDB
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Créer les object stores si ils n'existent pas
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/**
 * Ajoute une requête à la queue hors ligne
 */
export const addToQueue = async (request) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const item = {
      method: request.method,
      url: request.url,
      data: request.data,
      headers: request.headers,
      timestamp: new Date().getTime(),
      retries: 0,
      lastError: null
    };

    return new Promise((resolve, reject) => {
      const addRequest = store.add(item);
      addRequest.onsuccess = () => {
        console.log('✅ Requête mise en queue (hors ligne):', item.method, item.url);
        resolve(addRequest.result);
      };
      addRequest.onerror = () => reject(addRequest.error);
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout à la queue:', error);
    throw error;
  }
};

/**
 * Récupère toutes les requêtes en attente
 */
export const getQueuedRequests = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la lecture de la queue:', error);
    return [];
  }
};

/**
 * Supprime une requête de la queue
 */
export const removeFromQueue = async (id) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la queue:', error);
    throw error;
  }
};

/**
 * Met à jour une requête en queue (ex: incrémenter les retries)
 */
export const updateQueueItem = async (id, updates) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updated = { ...item, ...updates, id };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve(updated);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la queue:', error);
    throw error;
  }
};

/**
 * Vide complètement la queue
 */
export const clearQueue = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log('🗑️ Queue vidée');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erreur lors du vidage de la queue:', error);
    throw error;
  }
};

/**
 * Vérifie le nombre de requêtes en queue
 */
export const getQueueCount = async () => {
  try {
    const requests = await getQueuedRequests();
    return requests.length;
  } catch (error) {
    console.error('❌ Erreur lors du comptage:', error);
    return 0;
  }
};

export default {
  addToQueue,
  getQueuedRequests,
  removeFromQueue,
  updateQueueItem,
  clearQueue,
  getQueueCount
};
