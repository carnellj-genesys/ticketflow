import { http, HttpResponse } from 'msw';
import type { Ticket } from '../../types/ticket';

const mockTickets: Ticket[] = [
  {
    ticket_number: '1',
    issue_title: 'Login page not loading',
    issue_description: 'Users are unable to access the login page. The page shows a blank screen with no error messages.',
    status: 'Open',
    priority: 'High',
    email: 'user@example.com',
    phone_number: '+1234567890',
    notes: '',
    created: '2024-01-15T10:30:00.000Z',
    changed: '2024-01-15T10:30:00.000Z'
  },
  {
    ticket_number: '2',
    issue_title: 'Database connection timeout',
    issue_description: 'Application experiencing intermittent database connection timeouts during peak hours.',
    status: 'In-progress',
    priority: 'Critical',
    email: 'admin@company.com',
    phone_number: '+1234567891',
    notes: '',
    created: '2024-01-14T14:20:00.000Z',
    changed: '2024-01-15T09:15:00.000Z'
  }
];

export const handlers = [
  // GET all tickets
  http.get('/rest/ticket', () => {
    return HttpResponse.json(mockTickets);
  }),

  // GET ticket by ID
  http.get('/rest/ticket/:id', ({ params }) => {
    const ticket = mockTickets.find(t => t.ticket_number === params.id);
    if (ticket) {
      return HttpResponse.json(ticket);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // POST new ticket
  http.post('/rest/ticket', async ({ request }) => {
    const newTicket = await request.json() as Partial<Ticket>;
    const ticket: Ticket = {
      ticket_number: Date.now().toString(),
      issue_title: newTicket.issue_title || '',
      issue_description: newTicket.issue_description || '',
      status: newTicket.status || 'Open',
      priority: newTicket.priority || 'Medium',
      email: newTicket.email || '',
      phone_number: newTicket.phone_number || '',
      notes: newTicket.notes || '',
      created: new Date().toISOString(),
      changed: new Date().toISOString()
    };
    mockTickets.push(ticket);
    return HttpResponse.json(ticket, { status: 201 });
  }),

  // PUT update ticket
  http.put('/rest/ticket/:id', async ({ params, request }) => {
    const updates = await request.json() as Partial<Ticket>;
    const index = mockTickets.findIndex(t => t.ticket_number === params.id);
    if (index !== -1) {
      mockTickets[index] = {
        ...mockTickets[index],
        ...updates,
        changed: new Date().toISOString()
      };
      return HttpResponse.json(mockTickets[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // DELETE ticket
  http.delete('/rest/ticket/:id', ({ params }) => {
    const index = mockTickets.findIndex(t => t.ticket_number === params.id);
    if (index !== -1) {
      mockTickets.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Webhook endpoint
  http.post('https://api.example.com/webhook/tickets', () => {
    return HttpResponse.json({ success: true });
  })
]; 