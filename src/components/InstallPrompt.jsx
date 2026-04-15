import React, { useState, useEffect } from 'react';
import '../styles/Form.css'; // Réutiliser les styles existants

const InstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Montrer le bouton si l'app n'est pas déjà installée
    const isStandalone = window.navigator.standalone === true || 
                         window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isStandalone && window.installPWA) {
      setIsVisible(true);
    } else {
      setIsInstalled(true);
    }

    // Écouter l'événement appinstalled
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = () => {
    if (window.installPWA) {
      window.installPWA();
      setIsVisible(false);
    }
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#007bff',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px' }}>
        📲 Installez StudentHub pour un accès rapide !
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'white',
            color: '#007bff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          Installer
        </button>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
