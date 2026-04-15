import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ title, category, taskCount, courseId, isShared = false, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (courseId) {
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <div className="course-card" onClick={handleClick} style={{cursor: 'pointer'}}>
      <h3 className="course-card__title">{title}</h3>
      <div className="course-card__meta">
        <div className="course-card__category">{category || 'Sans catégorie'}</div>
        {isShared && <span className="course-card__shared">Partagé</span>}
      </div>
      <div className="course-card__tasks">{taskCount} tâche(s)</div>
    </div>
  );
};

export default CourseCard;
