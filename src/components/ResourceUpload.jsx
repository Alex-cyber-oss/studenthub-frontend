import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService } from '../services/resourceService';
import Button from './Button';
import FormField from './FormField';
import '../styles/Form.css';

const ResourceUpload = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resourceService.uploadResource(courseId, title, file);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError('Erreur lors de l\'upload de la ressource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resource-upload-container">
      <h2>Ajouter une ressource</h2>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Titre"
          name="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <div className="form-field">
          <label htmlFor="file">Fichier</label>
          <input
            id="file"
            name="file"
            type="file"
            onChange={e => setFile(e.target.files[0])}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Enregistrer'}</Button>
        <Button type="button" variant="secondary" onClick={() => navigate(`/courses/${courseId}`)}>Annuler</Button>
      </form>
    </div>
  );
};

export default ResourceUpload;
