import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from './Button';
import FormField from './FormField';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [filiere, setFiliere] = useState('');
  const [annee, setAnnee] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(name, email, password, filiere, annee);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur inscription:', err);
      if (err.response?.data?.errors) {
        // Gérer les erreurs de validation Laravel
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>StudentHub</h1>
        <h2>Inscription</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <FormField label="Nom" name="name" value={name} onChange={e => setName(e.target.value)} required />
          <FormField label="Email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <FormField label="Mot de passe" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <FormField label="Filière" name="filiere" value={filiere} onChange={e => setFiliere(e.target.value)} />
          <FormField label="Année" name="annee" value={annee} onChange={e => setAnnee(e.target.value)} />

          <Button type="submit" disabled={loading}>{loading ? 'Inscription...' : "S'inscrire"}</Button>
        </form>

        <p className="signup-link">
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
