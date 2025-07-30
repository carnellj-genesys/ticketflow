import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ticketService } from '../ticketService';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../../types/ticket';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock webhook service
vi.mock('../webhookService', () => ({
  webhookService: {
    notifyTicketCreated: vi.fn(),
    notifyTicketUpdated: vi.fn(),
    notifyTicketDeleted: vi.fn()
  }
}));

describe('TicketService', () => {
  const mockTicket: Ticket = {
    ticket_number: '1',
    issue_title: 'Test Ticket',
    issue_description: 'Test Description',
    status: 'Open',
    priority: 'Medium',
    email: 'test@example.com',
    phone_number: '+15551234567',
    notes: '',
    created: '2024-01-15T10:30:00.000Z',
    changed: '2024-01-15T10:30:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTickets', () => {
    it('should fetch all tickets successfully', async () => {
      const axios = await import('axios');
      const mockResponse = { data: [mockTicket] };
      vi.mocked(axios.default.get).mockResolvedValue(mockResponse);

      const result = await ticketService.getAllTickets();

      expect(result).toEqual([mockTicket]);
      expect(axios.default.get).toHaveBeenCalledWith(
        'http://localhost:3001/rest/ticket',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-apikey': '68544b73bb5cccc333f6d956',
            'CORS-API-Key': '68544b73bb5cccc333f6d956',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle errors when fetching tickets', async () => {
      const axios = await import('axios');
      const error = new Error('Network error');
      vi.mocked(axios.default.get).mockRejectedValue(error);

      await expect(ticketService.getAllTickets()).rejects.toThrow('Network error');
    });
  });

  describe('getTicketById', () => {
    it('should fetch a ticket by ID successfully', async () => {
      const axios = await import('axios');
      const mockResponse = { data: mockTicket };
      vi.mocked(axios.default.get).mockResolvedValue(mockResponse);

      const result = await ticketService.getTicketById('1');

      expect(result).toEqual(mockTicket);
      expect(axios.default.get).toHaveBeenCalledWith(
        'http://localhost:3001/rest/ticket/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-apikey': '68544b73bb5cccc333f6d956',
            'CORS-API-Key': '68544b73bb5cccc333f6d956',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const axios = await import('axios');
      const mockResponse = { data: mockTicket };
      vi.mocked(axios.default.post).mockResolvedValue(mockResponse);

      const createData: CreateTicketRequest = {
        issue_title: 'New Ticket',
        issue_description: 'New Description',
        status: 'Open',
        priority: 'High',
        email: 'new@example.com',
        phone_number: '+15551234567',
        notes: ''
      };

      const result = await ticketService.createTicket(createData);

      expect(result).toEqual(mockTicket);
      expect(axios.default.post).toHaveBeenCalledWith(
        'http://localhost:3001/rest/ticket',
        createData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-apikey': '68544b73bb5cccc333f6d956',
            'CORS-API-Key': '68544b73bb5cccc333f6d956',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('updateTicket', () => {
    it('should update a ticket successfully', async () => {
      const axios = await import('axios');
      const mockResponse = { data: mockTicket };
      vi.mocked(axios.default.put).mockResolvedValue(mockResponse);

      const updateData: UpdateTicketRequest = {
        status: 'In-progress'
      };

      const result = await ticketService.updateTicket('1', updateData);

      expect(result).toEqual(mockTicket);
      expect(axios.default.put).toHaveBeenCalledWith(
        'http://localhost:3001/rest/ticket/1',
        updateData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-apikey': '68544b73bb5cccc333f6d956',
            'CORS-API-Key': '68544b73bb5cccc333f6d956',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('deleteTicket', () => {
    it('should delete a ticket successfully', async () => {
      const axios = await import('axios');
      const mockDeleteResponse = { status: 204 };
      vi.mocked(axios.default.delete).mockResolvedValue(mockDeleteResponse);

      await ticketService.deleteTicket('1');

      expect(axios.default.delete).toHaveBeenCalledWith(
        'http://localhost:3001/rest/ticket/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-apikey': '68544b73bb5cccc333f6d956',
            'CORS-API-Key': '68544b73bb5cccc333f6d956',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
}); 