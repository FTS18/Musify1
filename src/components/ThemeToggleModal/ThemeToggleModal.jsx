import React from 'react';
import './ThemeToggleModal.css';

const ThemeToggleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="theme-modal-overlay" onClick={onClose}>
      <div className="theme-modal" onClick={e => e.stopPropagation()}>
        <div className="theme-modal-header">
          <h3>Theme Settings</h3>
          <button className="theme-modal-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="theme-modal-content">
          <div className="theme-testing-notice">
            <span className="material-icons">science</span>
            <div>
              <h4>Still in Testing</h4>
              <p>Light/Dark theme switching is currently being tested and optimized. This feature will be available soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggleModal;