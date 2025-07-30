import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketRow } from '../TicketRow';
import type { Ticket } from '../../../types/ticket';

describe('TicketRow', () => {
  const mockTicket: Ticket = {
    ticket_number: '1234567890',
    issue_title: 'Test Ticket Title',
    issue_description: 'This is a test ticket description that should be displayed properly',
    status: 'Open',
    priority: 'High',
    email: 'test@example.com',
    phone_number: '+15551234567',
    notes: '',
    created: '2024-01-15T10:30:00.000Z',
    changed: '2024-01-15T10:30:00.000Z'
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  // Helper function to render TicketRow in proper table structure
  const renderTicketRow = (ticket: Ticket = mockTicket) => {
    return render(
      <table>
        <tbody>
          <TicketRow 
            ticket={ticket} 
            onEdit={mockOnEdit} 
            onDelete={mockOnDelete} 
          />
        </tbody>
      </table>
    );
  };

  it('should render ticket information correctly', () => {
    renderTicketRow();

    expect(screen.getByText('12345678...')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test ticket description that should be displayed properly')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+15551234567')).toBeInTheDocument();
  });

  it('should call onEdit when ID button is clicked', () => {
    renderTicketRow();

    const idButton = screen.getByText('12345678...');
    fireEvent.click(idButton);

    expect(mockOnEdit).toHaveBeenCalledWith('1234567890');
  });

  it('should call onEdit when edit button is clicked', () => {
    renderTicketRow();

    const editButton = screen.getByRole('button', { name: /edit ticket 1234567890/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith('1234567890');
  });

  it('should call onDelete when delete button is clicked', () => {
    renderTicketRow();

    const deleteButton = screen.getByRole('button', { name: /delete ticket 1234567890/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1234567890');
  });

  it('should display correct status badge styling', () => {
    renderTicketRow();

    const statusBadge = screen.getByText('Open');
    expect(statusBadge).toHaveClass('badge', 'badge-open');
  });

  it('should display correct priority badge styling', () => {
    renderTicketRow();

    const priorityBadge = screen.getByText('High');
    expect(priorityBadge).toHaveClass('badge', 'badge-high');
  });

  it('should truncate long ticket numbers properly', () => {
    const longTicketNumberTicket = { ...mockTicket, ticket_number: 'verylongticketid123456789' };
    
    renderTicketRow(longTicketNumberTicket);

    expect(screen.getByText('verylong...')).toBeInTheDocument();
  });

  it('should show full ticket number in tooltip', () => {
    renderTicketRow();

    const ticketNumberButton = screen.getByText('12345678...');
    expect(ticketNumberButton).toHaveAttribute('title', '1234567890');
  });
}); 