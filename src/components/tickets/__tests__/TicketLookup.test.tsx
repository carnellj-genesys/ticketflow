import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TicketLookup } from '../TicketLookup';

describe('TicketLookup', () => {
  const mockOnLookup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the lookup form', () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    expect(screen.getByPlaceholderText('Enter ticket number...')).toBeInTheDocument();
    expect(screen.getByText('🔍 Lookup')).toBeInTheDocument();
  });

  it('calls onLookup when form is submitted with valid ticket number', async () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const input = screen.getByPlaceholderText('Enter ticket number...');
    const submitButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(input, { target: { value: '123456789' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnLookup).toHaveBeenCalledWith('123456789');
    });
  });

  it('calls onLookup when Enter key is pressed', async () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const input = screen.getByPlaceholderText('Enter ticket number...');
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: '123456789' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockOnLookup).toHaveBeenCalledWith('123456789');
    });
  });

  it('does not call onLookup when ticket number is empty', () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const submitButton = screen.getByText('🔍 Lookup');
    fireEvent.click(submitButton);
    
    expect(mockOnLookup).not.toHaveBeenCalled();
  });

  it('does not call onLookup when ticket number is only whitespace', () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const input = screen.getByPlaceholderText('Enter ticket number...');
    const submitButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(submitButton);
    
    expect(mockOnLookup).not.toHaveBeenCalled();
  });

  it('trims whitespace from ticket number', async () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const input = screen.getByPlaceholderText('Enter ticket number...');
    const submitButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(input, { target: { value: '  123456789  ' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnLookup).toHaveBeenCalledWith('123456789');
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<TicketLookup onLookup={mockOnLookup} isLoading={true} />);
    
    expect(screen.getByText('Looking...')).toBeInTheDocument();
    expect(screen.queryByText('🔍 Lookup')).not.toBeInTheDocument();
  });

  it('disables input and button when loading', () => {
    render(<TicketLookup onLookup={mockOnLookup} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('Enter ticket number...');
    const submitButton = screen.getByText('Looking...').closest('button');
    
    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when input is empty', () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const submitButton = screen.getByText('🔍 Lookup');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has value', () => {
    render(<TicketLookup onLookup={mockOnLookup} />);
    
    const input = screen.getByPlaceholderText('Enter ticket number...');
    const submitButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(input, { target: { value: '123456789' } });
    
    expect(submitButton).not.toBeDisabled();
  });
}); 