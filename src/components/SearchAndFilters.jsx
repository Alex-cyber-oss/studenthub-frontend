import React, { useState } from 'react';
import './SearchAndFilters.css';

const SearchAndFilters = ({ courses, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Récupérer toutes les catégories uniques
  const categories = [...new Set(courses.flatMap(course => course.category).filter(Boolean))];

  React.useEffect(() => {
    const filtered = courses.filter(course => {
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !categoryFilter || course.category === categoryFilter;

      const matchesStatus = !statusFilter || (() => {
        if (statusFilter === 'with_tasks') {
          return course.tasks && course.tasks.length > 0;
        }
        if (statusFilter === 'without_tasks') {
          return !course.tasks || course.tasks.length === 0;
        }
        if (statusFilter === 'with_completed') {
          return course.tasks && course.tasks.some(t => t.status === 'termine');
        }
        return true;
      })();

      return matchesSearch && matchesCategory && matchesStatus;
    });

    onFilter(filtered);
  }, [searchTerm, categoryFilter, statusFilter, courses]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm || categoryFilter || statusFilter;

  return (
    <div className="search-filters-container">
      <div className="search-section">
        <input
          id="search-input"
          name="search"
          type="text"
          placeholder="🔍 Rechercher un cours..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            ✕ Effacer les filtres
          </button>
        )}
      </div>

      <div className="filters-section">
        <select
          id="category-filter"
          name="category"
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          id="status-filter"
          name="status"
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="with_tasks">Avec tâches</option>
          <option value="without_tasks">Sans tâches</option>
          <option value="with_completed">Avec tâches terminées</option>
        </select>
      </div>
    </div>
  );
};

export default SearchAndFilters;

