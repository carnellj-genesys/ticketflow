import React, { useState } from 'react';

interface TicketLookupProps {
  onLookup: (ticketNumber: string) => Promise<void>;
  isLoading?: boolean;
}

export const TicketLookup: React.FC<TicketLookupProps> = ({ onLookup, isLoading = false }) => {
  const [ticketNumber, setTicketNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketNumber.trim()) {
      onLookup(ticketNumber.trim());
    }
  };

  return (
    <div className="ticket-lookup">
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="Enter ticket number..."
            className="form-input"
            disabled={isLoading}
            style={{ width: '100%' }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={isLoading || !ticketNumber.trim()}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: 'var(--spacing-xs)' }}></div>
              Looking...
            </>
          ) : (
            '🔍 Lookup'
          )}
        </button>
      </form>
    </div>
  );
}; 