import React from 'react';
import api from '../api/axiosConfig';
import './ResourceItem.css';

const ResourceItem = ({ id, title, fileUrl, onDelete }) => {
  const handleView = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/resources/${id}/download`, {
        responseType: 'blob',
      });
      
      // Créer un blob URL et l'ouvrir dans un nouvel onglet
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      // Nettoyer l'URL après un délai
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        };
      } else {
        // Si la popup est bloquée, créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier:', error);
      alert('Erreur lors de l\'ouverture de la ressource. Assurez-vous d\'être connecté.');
    }
  };
  
  return (
    <div className="resource-item">
      <a 
        href="#" 
        onClick={handleView}
        className="resource-item__link"
      >
        {title}
      </a>
      {onDelete && (
        <button className="resource-item__delete" onClick={onDelete}>🗑️ Supprimer</button>
      )}
    </div>
  );
};

export default ResourceItem;
