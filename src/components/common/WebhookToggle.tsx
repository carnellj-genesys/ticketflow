import React, { useState, useEffect } from 'react';
import { webhookService } from '../../services/webhookService';

interface WebhookToggleProps {
  onToggle?: (enabled: boolean) => void;
}

export const WebhookToggle: React.FC<WebhookToggleProps> = ({ onToggle }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with current webhook state from backend
    const initializeState = async () => {
      try {
        // Add a small delay to show loading state in tests
        await new Promise(resolve => setTimeout(resolve, 10));
        const status = await webhookService.getStatus();
        console.log('🔗 WebhookToggle: Initial status from backend:', status);
        setIsEnabled(status);
      } catch (error) {
        console.error('Failed to get webhook status:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeState();
  }, []);

  const handleToggle = async () => {
    const newState = !isEnabled;
    console.log('🔗 WebhookToggle: Setting local state to:', newState);
    setIsEnabled(newState);
    
    try {
      // Update webhook service state on backend
      await webhookService.setEnabled(newState);
      
      // Notify parent component
      onToggle?.(newState);
    } catch (error) {
      // Revert state if update failed
      console.log('🔗 WebhookToggle: Reverting state due to error');
      setIsEnabled(!newState);
      console.error('Failed to update webhook status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="webhook-toggle-small-skeleton" aria-label="Loading webhook status">
        <div className="webhook-toggle-small-skeleton-inner"></div>
      </div>
    );
  }

  console.log('🔗 WebhookToggle: Rendering with isEnabled:', isEnabled, 'className:', `webhook-toggle-small ${isEnabled ? 'enabled' : 'disabled'}`);

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