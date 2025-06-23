import React from 'react';
import type { Ticket } from '../../types/ticket';
import { formatDate } from '../../utils/dateUtils';

interface TicketRowProps {
  ticket: Ticket;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TicketRow: React.FC<TicketRowProps> = ({ ticket, onEdit, onDelete }) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open': return 'badge badge-open';
      case 'In-progress': return 'badge badge-in-progress';
      case 'Closed': return 'badge badge-closed';
      default: return 'badge';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'badge badge-critical';
      case 'High': return 'badge badge-high';
      case 'Medium': return 'badge badge-medium';
      case 'Low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  return (
    <tr>
      <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => onEdit(ticket._id)}
          className="btn btn-sm"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: 0,
            font: 'inherit',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={ticket._id}
        >
          {ticket._id.length > 8 ? `${ticket._id.substring(0, 8)}...` : ticket._id}
        </button>
      </td>
      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {ticket.issue_title}
      </td>
      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {ticket.issue_description}
      </td>
      <td>
        <span className={getStatusBadgeClass(ticket.status)}>
          {ticket.status}
        </span>
      </td>
      <td>
        <span className={getPriorityBadgeClass(ticket.priority)}>
          {ticket.priority}
        </span>
      </td>
      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {ticket.email}
      </td>
      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {ticket.phone_number}
      </td>
      <td style={{ width: '120px', minWidth: '120px' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            onClick={() => onEdit(ticket._id)}
            className="btn btn-sm btn-secondary"
            aria-label={`Edit ticket ${ticket._id}`}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(ticket._id)}
            className="btn btn-sm btn-delete"
            aria-label={`Delete ticket ${ticket._id}`}
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}; 