import React from 'react';
import './TaskItem.css';

const TaskItem = ({ title, description, deadline, status, onEdit, onDelete, onToggleStatus }) => (
  <div className={`task-item task-item--${status}`}>
    <div className="task-item__main">
      <span className="task-item__title">{title}</span>
      {description && (
        <p className="task-item__description">{description}</p>
      )}
      <span className="task-item__deadline">Échéance: {new Date(deadline).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</span>
      <span className={`task-item__status task-item__status--${status}`}>
        {status === 'termine' ? '✓ Terminé' : '⏳ À faire'}
      </span>
    </div>
    {(onEdit || onDelete || onToggleStatus) && (
      <div className="task-item__actions">
        {onToggleStatus && <button onClick={onToggleStatus}>{status === 'termine' ? '↩️ Réouvrir' : '✔️ Marquer terminé'}</button>}
        {onEdit && <button onClick={onEdit}>✏️ Éditer</button>}
        {onDelete && <button onClick={onDelete}>🗑️ Supprimer</button>}
      </div>
    )}
  </div>
);

export default TaskItem;
