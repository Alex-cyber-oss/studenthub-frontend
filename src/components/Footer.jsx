import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__content">
      <span>© {new Date().getFullYear()} StudentHub. Tous droits réservés.</span>
      <div className="footer__right">
        <span className="footer__author">Développé par DIGBENE Alex</span>
        <span className="footer__mentions">Mentions légales</span>
      </div>
    </div>
  </footer>
);

export default Footer;
