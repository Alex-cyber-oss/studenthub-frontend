import api from '../api/axiosConfig';

export const resourceService = {
  // Récupérer les ressources d'un cours
  getResources: (courseId) => {
    return api.get(`/courses/${courseId}/resources`).then((response) => response.data);
  },

  // Ajouter une ressource (upload)
  uploadResource: (courseId, title, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    return api.post(`/courses/${courseId}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((response) => response.data);
  },

  // Supprimer une ressource
  deleteResource: (id) => {
    return api.delete(`/resources/${id}`).then((response) => response.data);
  },

  // Obtenir l'URL de téléchargement d'une ressource
  getDownloadUrl: (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return `${API_BASE_URL}/resources/${id}/download`;
  },
};
