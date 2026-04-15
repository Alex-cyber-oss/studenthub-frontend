import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Button from './Button';
import FormField from './FormField';
import '../styles/Form.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [annee, setAnnee] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authService.getMe();
        setUser(data);
        setName(data.name || '');
        setFiliere(data.filiere || '');
        setAnnee(data.annee || '');
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await authService.updateProfile({ name, filiere, annee, password: password || undefined });
      setUser(updated);
      setPassword('');
      alert('Profil mis à jour');
    } catch (err) {
      setError('Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="profile-container">
      <h2>Mon profil</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSave}>
        <FormField label="Nom" name="name" value={name} onChange={e => setName(e.target.value)} required />
        <FormField label="Filière" name="filiere" value={filiere} onChange={e => setFiliere(e.target.value)} />
        <FormField label="Année" name="annee" value={annee} onChange={e => setAnnee(e.target.value)} />
        <FormField label="Nouveau mot de passe" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Mettre à jour'}</Button>
      </form>
    </div>
  );
};

export default Profile;
