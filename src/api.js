import { queueRequest } from './db';

/**
 * Fonction universelle pour envoyer des données à Laravel
 * Gère automatiquement le mode hors-ligne via IndexedDB
 */
export const postData = async (endpoint, data) => {
  const apiUrl = `https://alexmoi.alwaysdata.net/api/${endpoint}`;

  try {
    // 1. Tentative d'envoi réseau
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // Si le serveur répond avec une erreur (ex: 500 ou 404)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur serveur");
    }

    // Si tout va bien, on renvoie la réponse de Laravel
    return await response.json();

  } catch (error) {
    // 2. ÉCHEC RÉSEAU (C'est ici que l'erreur de ta photo est capturée)
    console.warn("Réseau indisponible ou erreur. Passage en mode local...");

    // On sauvegarde IMPÉRATIVEMENT dans le PC
    try {
      await queueRequest(apiUrl, 'POST', data);
      console.log("Données sauvegardées dans IndexedDB avec succès.");
    } catch (dbError) {
      console.error("Impossible de sauvegarder localement :", dbError);
    }

    // 3. Enregistrement de la synchronisation en arrière-plan
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-everything');
        console.log("Synchronisation en arrière-plan enregistrée !");
      } catch (syncError) {
        console.error("Le navigateur n'a pas pu enregistrer le Sync :", syncError);
      }
    }

    // On renvoie un objet spécifique pour que ton interface React
    // sache qu'elle ne doit pas afficher "Erreur", mais "En attente".
    return { 
      offline: true, 
      message: "Action sauvegardée localement",
      data: data 
    };
  }
};
