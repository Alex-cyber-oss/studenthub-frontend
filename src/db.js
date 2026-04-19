export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyArenaOffline', 1);
    
    // Création de la table "outbox" (boîte d'envoi)
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveToOutbox = async (data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('outbox', 'readwrite');
    const store = transaction.objectStore('outbox');
    store.add(data);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
