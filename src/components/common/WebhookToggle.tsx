import React, { useState, useEffect } from 'react';
import { webhookService } from '../../services/webhookService';

interface WebhookToggleProps {
  onToggle?: (enabled: boolean) => void;
}

export const WebhookToggle: React.FC<WebhookToggleProps> = ({ onToggle }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with current webhook state
    const initializeState = async () => {
      // Add a small delay to show loading state in tests
      await new Promise(resolve => setTimeout(resolve, 10));
      setIsEnabled(webhookService.isEnabled());
      setIsLoading(false);
    };
    
    initializeState();
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    // Update webhook service state
    webhookService.setEnabled(newState);
    
    // Notify parent component
    onToggle?.(newState);
  };

  if (isLoading) {
    return (
      <div className="webhook-toggle-small-skeleton" aria-label="Loading webhook status">
        <div className="webhook-toggle-small-skeleton-inner"></div>
      </div>
    );
  }

  return (
    <button
      className={`webhook-toggle-small ${isEnabled ? 'enabled' : 'disabled'}`}
      onClick={handleToggle}
      aria-label={`Webhook integration ${isEnabled ? 'enabled' : 'disabled'}. Click to ${isEnabled ? 'disable' : 'enable'}.`}
      title={`Webhook integration ${isEnabled ? 'enabled' : 'disabled'}`}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    </button>
  );
}; 