import api from '../api/axiosConfig';

export const taskService = {
  // Récupérer les tâches d'un cours
  getTasks: (courseId) => {
    return api.get(`/tasks?course_id=${courseId}`).then((response) => response.data);
  },

  // Récupérer une tâche par id
  getTaskById: (id) => {
    return api.get(`/tasks/${id}`).then((response) => response.data);
  },

  // Créer une tâche
  createTask: (courseId, title, description, deadline, status) => {
    return api.post(`/tasks`, { course_id: courseId, title, description, deadline, status }).then((response) => response.data);
  },

  // Mettre à jour une tâche
  updateTask: (id, title, description, deadline, status) => {
    return api.put(`/tasks/${id}`, { title, description, deadline, status }).then((response) => response.data);
  },

  // Supprimer une tâche
  deleteTask: (id) => {
    return api.delete(`/tasks/${id}`).then((response) => response.data);
  },

  // Récupérer les tâches à venir
  getUpcomingTasks: (days = 7) => {
    return api.get(`/tasks/upcoming?days=${days}`).then((response) => response.data);
  },

  // Récupérer le calendrier des tâches
  getCalendar: (month, year) => {
    return api.get(`/tasks/calendar?month=${month}&year=${year}`).then((response) => response.data);
  },

  // Marquer/démarquer une tâche comme terminée pour l'utilisateur actuel
  toggleComplete: (id) => {
    return api.patch(`/tasks/${id}/toggle`).then((response) => response.data);
  },
};
