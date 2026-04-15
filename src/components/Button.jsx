import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', ...props }) => {
  const handleClick = (e) => {
    // Ne pas empêcher le comportement par défaut pour les boutons de type "submit"
    if (type === 'button') {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
