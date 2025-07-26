import React, { useState, useMemo } from 'react';
import type { Ticket } from '../../types/ticket';
import { TicketRow } from './TicketRow';

interface TicketTableProps {
  tickets: Ticket[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

type SortField = keyof Ticket;
type SortDirection = 'asc' | 'desc';

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  onEdit,
  onDelete,
  isLoading = false
}) => {

  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedTickets = useMemo(() => {
    const sorted = [...tickets];
    sorted.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });

    return sorted;
  }, [tickets, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = sortedTickets.slice(startIndex, startIndex + itemsPerPage);


  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <div 
      onClick={() => handleSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}
    >
      {children}
      {sortField === field && (
        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: 'var(--spacing-md)' }}>Loading tickets...</span>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="loading">
        <p>No tickets found. Create your first ticket to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table className="table" style={{ minWidth: '1200px' }}>
          <thead>
            <tr>
              <th style={{ width: '80px', minWidth: '80px' }}>
                <SortableHeader field="_id">ID</SortableHeader>
              </th>
              <th style={{ width: '200px', minWidth: '200px' }}>
                <SortableHeader field="issue_title">Title</SortableHeader>
              </th>
              <th style={{ width: '250px', minWidth: '250px' }}>
                <SortableHeader field="issue_description">Description</SortableHeader>
              </th>
              <th style={{ width: '100px', minWidth: '100px' }}>
                <SortableHeader field="status">Status</SortableHeader>
              </th>
              <th style={{ width: '100px', minWidth: '100px' }}>
                <SortableHeader field="priority">Priority</SortableHeader>
              </th>
              <th style={{ width: '150px', minWidth: '150px' }}>
                <SortableHeader field="email">Email</SortableHeader>
              </th>
              <th style={{ width: '120px', minWidth: '120px' }}>
                <SortableHeader field="phone_number">Phone</SortableHeader>
              </th>
              <th style={{ width: '200px', minWidth: '200px' }}>
                <SortableHeader field="notes">Notes</SortableHeader>
              </th>
              <th style={{ width: '120px', minWidth: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map((ticket, index) => (
              <TicketRow
                key={`${ticket._id}-${index}`}
                ticket={ticket}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-lg)'
        }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span style={{ color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div style={{ 
        textAlign: 'center', 
        marginTop: 'var(--spacing-md)',
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-sm)'
      }}>
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedTickets.length)} of {sortedTickets.length} tickets
      </div>
    </div>
  );
}; 