import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursService } from '../services/coursService';
import Button from './Button';
import FormField from './FormField';
import { useEffect } from 'react';
import '../styles/Form.css';

const CourseForm = ({ isEdit = false, initialData = {} }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (isEdit && id) {
        try {
          const data = await coursService.getCourseById(id);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setCategory(data.category || '');
        } catch (err) {
          setError('Impossible de charger le cours');
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
        await coursService.updateCourse(id, title, description, category);
      } else {
        await coursService.createCourse(title, description, category);
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du cours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-form-container">
      <h2>{isEdit ? 'Modifier le cours' : 'Nouveau cours'}</h2>
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
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <FormField
          label="Catégorie"
          name="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        {error && <div className="error-message">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Annuler</Button>
      </form>
    </div>
  );
};

export default CourseForm;
