import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout().then(() => {
      navigate('/login');
    });
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <Link to="/dashboard">
            <span className="header__logo-icon">📚</span>
            <span className="header__logo-text">StudentHub</span>
          </Link>
        </div>
        <nav className="header__nav">
          {user && (
            <>
              <Link to="/dashboard" className="header__nav-link">Dashboard</Link>
              <Link to="/profile" className="header__nav-link">Profil</Link>
              <span className="header__user-name">{user.name}</span>
              {user.filiere && <span className="header__user-filiere">{user.filiere}</span>}
              <button className="header__logout" onClick={handleLogout}>Déconnexion</button>
            </>
          )}
          {!user && <Link to="/login" className="header__nav-link">Connexion</Link>}
        </nav>
      </div>
    </header>
  );
};

export default Header;
