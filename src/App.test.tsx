import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';
import { handlers } from './test/mocks/handlers';

// Setup MSW server
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App - Ticket Lookup', () => {
  it('renders ticket lookup form', async () => {
    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('All Tickets')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Enter ticket number...')).toBeInTheDocument();
    expect(screen.getByText('🔍 Lookup')).toBeInTheDocument();
  });

  it('shows error when ticket is not found', async () => {
    // Mock API to return 404 for non-existent ticket
    server.use(
      http.get('*/rest/ticket/:id', () => {
        return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
      })
    );

    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('All Tickets')).toBeInTheDocument();
    });
    
    const lookupInput = screen.getByPlaceholderText('Enter ticket number...');
    const lookupButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(lookupInput, { target: { value: '999999999' } });
    fireEvent.click(lookupButton);
    
    await waitFor(() => {
      expect(screen.getByText('Ticket #999999999 not found. Please check the ticket number and try again.')).toBeInTheDocument();
    });
  });

  it('opens edit modal when ticket is found', async () => {
    // Mock API to return a valid ticket
    const mockTicket = {
      ticket_number: '123456789',
      issue_title: 'Test Ticket',
      issue_description: 'Test Description',
      status: 'Open',
      priority: 'Medium',
      email: 'test@example.com',
      phone_number: '+1234567890',
      notes: 'Test notes',
      created: '2024-01-01T00:00:00.000Z',
      changed: '2024-01-01T00:00:00.000Z'
    };

    server.use(
      http.get('*/rest/ticket/:id', () => {
        return HttpResponse.json(mockTicket);
      })
    );

    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('All Tickets')).toBeInTheDocument();
    });
    
    const lookupInput = screen.getByPlaceholderText('Enter ticket number...');
    const lookupButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(lookupInput, { target: { value: '123456789' } });
    fireEvent.click(lookupButton);
    
    await waitFor(() => {
      expect(screen.getByText('Edit Ticket #123456789')).toBeInTheDocument();
    });
  });

  it('shows loading state during lookup', async () => {
    // Mock API with delay
    server.use(
      http.get('*/rest/ticket/:id', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
      })
    );

    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('All Tickets')).toBeInTheDocument();
    });
    
    const lookupInput = screen.getByPlaceholderText('Enter ticket number...');
    const lookupButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(lookupInput, { target: { value: '123456789' } });
    fireEvent.click(lookupButton);
    
    // Should show loading state
    expect(screen.getByText('Looking...')).toBeInTheDocument();
    expect(lookupInput).toBeDisabled();
  });

  it('disables lookup button when input is empty', async () => {
    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('All Tickets')).toBeInTheDocument();
    });
    
    const lookupButton = screen.getByText('🔍 Lookup');
    expect(lookupButton).toBeDisabled();
  });

  it('enables lookup button when input has value', async () => {
    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('All Tickets')).toBeInTheDocument();
    });
    
    const lookupInput = screen.getByPlaceholderText('Enter ticket number...');
    const lookupButton = screen.getByText('🔍 Lookup');
    
    fireEvent.change(lookupInput, { target: { value: '123456789' } });
    expect(lookupButton).not.toBeDisabled();
  });
}); 