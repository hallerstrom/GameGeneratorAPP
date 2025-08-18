import React from 'react';

const Button = ({ onClick, children, className }) => {
  return (
    <button className={`generic-button ${className || ''}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;