import React from 'react';

interface ErrorBannerProps {
  error: string;
  onClose: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onClose }) => {
  return (
    <div className="error-banner" role="alert">
      <span>⚠️</span>
      <span>{error}</span>
      <button 
        className="close" 
        onClick={onClose}
        aria-label="Close error message"
      >
        ×
      </button>
    </div>
  );
}; 