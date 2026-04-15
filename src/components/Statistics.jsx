import React, { useState, useEffect } from 'react';
import { coursService } from '../services/coursService';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Forcer le rafraîchissement quand le composant devient visible
  useEffect(() => {
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await coursService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="statistics-loading">Chargement des statistiques...</div>;
  if (!stats) return null;

  return (
    <div className="statistics-container">
      <h3>📊 Statistiques</h3>
      <div className="statistics-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">📚</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.total_courses}</div>
            <div className="stat-card__label">Cours</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.completed_tasks}</div>
            <div className="stat-card__label">Tâches terminées</div>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.pending_tasks}</div>
            <div className="stat-card__label">Tâches en cours</div>
          </div>
        </div>

        <div className="stat-card stat-card--info">
          <div className="stat-card__icon">📈</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.completion_rate}%</div>
            <div className="stat-card__label">Taux de complétion</div>
          </div>
        </div>

        <div className="stat-card stat-card--danger">
          <div className="stat-card__icon">⏰</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.upcoming_deadlines}</div>
            <div className="stat-card__label">Deadlines prochaines</div>
          </div>
        </div>
      </div>

      {stats.courses_by_category && Object.keys(stats.courses_by_category).length > 0 && (
        <div className="statistics-categories">
          <h4>Cours par catégorie</h4>
          <div className="categories-list">
            {Object.entries(stats.courses_by_category).map(([category, count]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category || 'Sans catégorie'}</span>
                <span className="category-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;

