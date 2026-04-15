import api from '../api/axiosConfig';

export const coursService = {
  // Récupérer tous les cours de l'utilisateur
  getMyCourses: () => {
    return api.get('/courses').then((response) => response.data);
  },

  // Récupérer un cours spécifique avec ses tâches et ressources
  getCourseById: (id) => {
    return api.get(`/courses/${id}`).then((response) => response.data);
  },

  // Créer un nouveau cours
  createCourse: (title, description, category) => {
    return api.post('/courses', { title, description, category }).then((response) => response.data);
  },

  // Mettre à jour un cours
  updateCourse: (id, title, description, category) => {
    return api.put(`/courses/${id}`, { title, description, category }).then((response) => response.data);
  },

  // Supprimer un cours
  deleteCourse: (id) => {
    return api.delete(`/courses/${id}`).then((response) => response.data);
  },

  // Récupérer les cours partagés par filière et année
  getSharedCourses: (filiere, annee = null) => {
    const url = annee 
      ? `/courses/shared/${encodeURIComponent(filiere)}/${encodeURIComponent(annee)}`
      : `/courses/shared/${encodeURIComponent(filiere)}`;
    return api.get(url).then((response) => response.data);
  },

  // Récupérer les statistiques
  getStats: () => {
    return api.get('/courses/stats').then((response) => response.data);
  },

  // Dupliquer un cours partagé
  duplicateCourse: (id) => {
    return api.post(`/courses/${id}/duplicate`).then((response) => response.data);
  },
};
