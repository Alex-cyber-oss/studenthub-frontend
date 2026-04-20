import axios from 'axios';
import { addToQueue } from '../services/offlineService';

// Configuration de base pour Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs hors ligne
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Vérifier si c'est une erreur de connexion
    const isNetworkError = 
      error.message === 'Network Error' || 
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      !navigator.onLine;

    if (isNetworkError && error.config) {
      // Pour les requêtes POST/PUT/DELETE, les mettre en queue hors ligne
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(error.config.method?.toUpperCase())) {
        if (!navigator.onLine) {
          console.log('📱 Mode hors ligne: Mise en queue de:', error.config.method, error.config.url);
          
          try {
            await addToQueue({
              method: error.config.method,
              url: error.config.url,
              data: error.config.data,
              headers: error.config.headers
            });

            // Retourner une réponse optimiste pour ne pas bloquer l'UI
            return Promise.resolve({
              status: 202, // Accepted (traitement en attente)
              statusText: 'Accepté hors ligne',
              data: { 
                offline: true, 
                message: 'Votre action sera synchronisée automatiquement' 
              },
              config: error.config,
              headers: {},
              request: {}
            });
          } catch (queueError) {
            console.error('❌ Erreur lors de la mise en queue:', queueError);
            return Promise.reject(error);
          }
        }
      }
    }

    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré, déconnecter l'utilisateur
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
