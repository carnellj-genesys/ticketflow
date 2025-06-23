import { http, HttpResponse } from 'msw';
import type { Ticket } from '../../types/ticket';

const mockTickets: Ticket[] = [
  {
    _id: '1',
    issue_title: 'Login page not loading',
    issue_description: 'Users are unable to access the login page. The page shows a blank screen with no error messages.',
    status: 'Open',
    priority: 'High',
    email: 'user@example.com',
    created: '2024-01-15T10:30:00.000Z',
    changed: '2024-01-15T10:30:00.000Z'
  },
  {
    _id: '2',
    issue_title: 'Database connection timeout',
    issue_description: 'Application experiencing intermittent database connection timeouts during peak hours.',
    status: 'In-progress',
    priority: 'Critical',
    email: 'admin@company.com',
    created: '2024-01-14T14:20:00.000Z',
    changed: '2024-01-15T09:15:00.000Z'
  }
];

export const handlers = [
  // GET all tickets
  http.get('http://localhost:3001/rest/ticket', () => {
    return HttpResponse.json(mockTickets);
  }),

  // GET ticket by ID
  http.get('http://localhost:3001/rest/ticket/:id', ({ params }) => {
    const ticket = mockTickets.find(t => t._id === params.id);
    if (ticket) {
      return HttpResponse.json(ticket);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // POST new ticket
  http.post('http://localhost:3001/rest/ticket', async ({ request }) => {
    const newTicket = await request.json() as Partial<Ticket>;
    const ticket: Ticket = {
      _id: Date.now().toString(),
      issue_title: newTicket.issue_title || '',
      issue_description: newTicket.issue_description || '',
      status: newTicket.status || 'Open',
      priority: newTicket.priority || 'Medium',
      email: newTicket.email || '',
      created: new Date().toISOString(),
      changed: new Date().toISOString()
    };
    mockTickets.push(ticket);
    return HttpResponse.json(ticket, { status: 201 });
  }),

  // PUT update ticket
  http.put('http://localhost:3001/rest/ticket/:id', async ({ params, request }) => {
    const updates = await request.json() as Partial<Ticket>;
    const index = mockTickets.findIndex(t => t._id === params.id);
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
  http.delete('http://localhost:3001/rest/ticket/:id', ({ params }) => {
    const index = mockTickets.findIndex(t => t._id === params.id);
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