import api from '../api/axiosConfig';

export const authService = {
  // Inscription utilisateur
  register: (name, email, password, filiere, annee) => {
    return api.post('/register', { name, email, password, filiere, annee }).then((response) => {
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    });
  },

  // Connexion utilisateur
  login: (email, password) => {
    return api.post('/login', { email, password }).then((response) => {
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    });
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return api.post('/logout');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Récupérer l'utilisateur depuis l'API
  getMe: () => {
    return api.get('/me').then((response) => response.data);
  },

  // Mettre à jour le profil
  updateProfile: (data) => {
    return api.put('/user', data).then((response) => {
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};
