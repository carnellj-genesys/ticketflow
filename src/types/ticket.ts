export interface Ticket {
  _id: string;                    // Unique identifier (auto-generated)
  issue_title: string;            // Max 100 characters
  issue_description: string;      // Max 500 characters
  status: 'Open' | 'In-progress' | 'Closed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  email: string;                  // Email validation required
  phone_number: string;           // US E.164 phone number format (+1XXXXXXXXXX)
  created: string;                // ISO date string
  changed: string;                // ISO date string
}

export interface CreateTicketRequest {
  issue_title: string;
  issue_description: string;
  status: 'Open' | 'In-progress' | 'Closed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  email: string;
  phone_number: string;
}

export interface UpdateTicketRequest {
  issue_title?: string;
  issue_description?: string;
  status?: 'Open' | 'In-progress' | 'Closed';
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  email?: string;
  phone_number?: string;
} 