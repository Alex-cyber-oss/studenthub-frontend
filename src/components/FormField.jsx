import React from 'react';
import './FormField.css';

const FormField = ({ label, type = 'text', name, value, onChange, placeholder, children, ...props }) => (
  <div className="form-field">
    {label && <label htmlFor={name}>{label}</label>}
    {type === 'select' ? (
      <select id={name} name={name} value={value} onChange={onChange} {...props}>
        {children}
      </select>
    ) : type === 'textarea' ? (
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} {...props} />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    )}
  </div>
);

export default FormField;
