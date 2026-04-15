import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import Button from './Button';
import FormField from './FormField';
import '../styles/Form.css';

const TaskForm = ({ isEdit = false, initialData = {} }) => {
  const navigate = useNavigate();
  const { courseId, id } = useParams();
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [deadline, setDeadline] = useState(initialData.deadline || '');
  const [status, setStatus] = useState(initialData.status || 'a_faire');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [courseIdFromTask, setCourseIdFromTask] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const data = await taskService.getTaskById(id);
          setTitle(data.title || '');
          setDescription(data.description || '');
          // Formater la date au format yyyy-MM-dd
          const dateObj = new Date(data.deadline);
          const formattedDate = dateObj.toISOString().split('T')[0];
          setDeadline(formattedDate || '');
          setStatus(data.status || 'a_faire');
          setCourseIdFromTask(data.course_id || null);
        } catch (err) {
          setError('Impossible de charger la tâche');
        }
      }
    };
    load();
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await taskService.updateTask(id, title, description, deadline, status);
      } else {
        await taskService.createTask(courseId, title, description, deadline, status);
      }
      const targetCourseId = courseId || courseIdFromTask;
      navigate(`/courses/${targetCourseId}`);
    } catch (err) {
      // Afficher l'erreur détaillée du serveur si disponible
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde de la tâche';
      setError(errorMessage);
      console.error('Erreur complète:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <h2>{isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Titre"
          name="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Détails de la tâche..."
        />
        <FormField
          label="Deadline"
          name="deadline"
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          required
        />
        <FormField
          label="Statut"
          name="status"
          type="select"
          value={status}
          onChange={e => setStatus(e.target.value)}
          required
        >
          <option value="a_faire">À faire</option>
          <option value="termine">Terminé</option>
        </FormField>
        {error && <div className="error-message">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
        <Button type="button" variant="secondary" onClick={() => navigate(`/courses/${courseId}`)}>Annuler</Button>
      </form>
    </div>
  );
};

export default TaskForm;
