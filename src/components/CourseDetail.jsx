import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursService } from '../services/coursService';
import { taskService } from '../services/taskService';
import { resourceService } from '../services/resourceService';
import { authService } from '../services/authService';
import TaskItem from './TaskItem';
import ResourceItem from './ResourceItem';
import Button from './Button';
import '../styles/Dashboard.css';
import '../styles/CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await coursService.getCourseById(id);
      setCourse(data);
      const currentUser = authService.getCurrentUser();
      setIsOwner(data.user_id === currentUser?.id);
    } catch (err) {
      setError("Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer ce cours ?')) {
      await coursService.deleteCourse(id);
      navigate('/dashboard');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await taskService.deleteTask(taskId);
      await fetchCourse();
    } catch (err) {
      console.error(err);
      setError('Impossible de supprimer la tâche');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await taskService.toggleComplete(taskId);
      await fetchCourse();
    } catch (err) {
      console.error(err);
      setError('Impossible de mettre à jour la tâche');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await resourceService.deleteResource(resourceId);
      await fetchCourse();
    } catch (err) {
      console.error(err);
      setError('Impossible de supprimer la ressource');
    }
  };

  const handleDuplicateCourse = async () => {
    try {
      await coursService.duplicateCourse(id);
      alert('Cours ajouté à vos cours!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Impossible d\'ajouter ce cours');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return null;

  return (
    <div className="course-detail-container">
      <Button onClick={() => navigate('/dashboard')} style={{ marginBottom: '2rem' }}>← Retour</Button>
      <h2>{course.title}</h2>
      {course.user && course.user.name && (
        <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Créé par {course.user.name} {course.user.filiere && `(${course.user.filiere})`}
        </p>
      )}
      <div className="course-detail-meta">
        {course.category && <span>📚 Catégorie : {course.category}</span>}
        {course.description && <span>📝 Description : {course.description}</span>}
      </div>
      {isOwner && (
        <div className="course-detail-actions">
          <Button onClick={() => navigate(`/courses/${id}/edit`)}>✏️ Éditer</Button>
          <Button variant="secondary" onClick={handleDelete}>🗑️ Supprimer</Button>
        </div>
      )}
      {!isOwner && (
        <div className="course-detail-actions">
          <Button onClick={handleDuplicateCourse}>➕ Ajouter ce cours à mes cours</Button>
        </div>
      )}
      <section className="course-tasks">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>📋 Tâches</h3>
          {isOwner && (
            <Button onClick={() => navigate(`/courses/${id}/tasks/new`)}>+ Nouvelle tâche</Button>
          )}
        </div>
        <div className="tasks-list">
          {course.tasks && course.tasks.length > 0 ? (
            course.tasks.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                description={task.description}
                deadline={task.deadline}
                status={task.status}
                onEdit={isOwner ? () => navigate(`/tasks/${task.id}/edit`) : null}
                onDelete={isOwner ? () => handleDeleteTask(task.id) : null}
                onToggleStatus={isOwner ? () => handleToggleTask(task.id, task.status) : null}
              />
            ))
          ) : (
            <p>Aucune tâche pour ce cours.</p>
          )}
        </div>
      </section>
      <section className="course-resources">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>📁 Ressources</h3>
          {isOwner && (
            <Button onClick={() => navigate(`/courses/${id}/resources/upload`)}>+ Ajouter ressource</Button>
          )}
        </div>
        <div className="resources-list">
          {course.resources && course.resources.length > 0 ? (
            course.resources.map((res) => (
              <ResourceItem
                key={res.id}
                id={res.id}
                title={res.title}
                fileUrl={res.file_url}
                onDelete={isOwner ? () => handleDeleteResource(res.id) : null}
              />
            ))
          ) : (
            <p>Aucune ressource pour ce cours.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
