import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Login.css';

const GUEST_EMAIL = 'guest@guest.com';
const GUEST_PASSWORD = '123456';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur connexion:', err);
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillGuestCredentials = () => {
    setEmail(GUEST_EMAIL);
    setPassword(GUEST_PASSWORD);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>StudentHub</h1>
        <h2>Connexion</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <section className="guest-credentials" aria-label="Compte invité">
          <h3>Accès invité</h3>
          <p>Utilisez ce compte pour découvrir l’application sans créer de compte personnel.</p>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>{GUEST_EMAIL}</dd>
            </div>
            <div>
              <dt>Mot de passe</dt>
              <dd>{GUEST_PASSWORD}</dd>
            </div>
          </dl>
          <button type="button" className="guest-button" onClick={fillGuestCredentials}>
            Remplir les identifiants invités
          </button>
        </section>

        <p className="signup-link">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
