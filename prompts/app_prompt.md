# TicketFlow Application Development Prompt

## Overview

You are tasked with developing and maintaining the **TicketFlow** application - a modern, responsive ticket management system built with React, TypeScript, and Express.js. This application provides an intuitive interface for creating, managing, and tracking support tickets with real-time updates and webhook integrations.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with CSS Custom Properties
- **HTTP Client**: Axios
- **Backend**: Express.js with SQLite database
- **Database**: SQLite with better-sqlite3
- **Testing**: Vitest with React Testing Library
- **Containerization**: Docker with multi-stage builds

## Core Features

### 1. Ticket Management
- Complete CRUD operations (Create, Read, Update, Delete)
- Ticket lookup by ticket number for quick access and editing
- Sortable and filterable ticket table
- Real-time status updates
- Priority and status management
- Agent notes field for internal communication
- Auto-title generation from description (first 100 characters)
- Auto-status generation (defaults to "Open")
- SQLite database persistence with automatic migration

### 2. Ticket Lookup Feature
- Quick ticket lookup by entering ticket number
- Direct access to edit modal when ticket is found
- Clear error message when ticket is not found
- Loading states during lookup operations
- Input validation and trimming
- Keyboard support (Enter key to submit)

### 3. User Interface
- Responsive design for desktop, tablet, and mobile
- Dark mode support with persistent preference
- Modern, clean UI with accessibility features
- Form validation with real-time feedback
- Multi-line notes field for agents
- Paginated ticket table with sorting

### 4. Webhook Integration
- Automatic notifications for ticket operations
- Configurable webhook endpoints
- Error handling and retry logic
- Runtime enable/disable toggle
- Notes field included in webhook payloads

### 5. API Layer
- RESTful API with comprehensive endpoints
- CORS support for cross-origin requests
- Request/response logging for debugging
- Error handling and status codes
- SQLite database with prepared statements

### 6. Database Management
- SQLite database with automatic schema creation
- Data migration from JSON to SQLite
- Backup creation and data integrity checks
- Transaction safety and ACID compliance
- Graceful shutdown handling

### 7. Auto-Generation Features
- **Auto-Title Generation**: Automatic title generation when no title is provided
  - Uses first 100 characters of description as title
  - Adds "..." for descriptions longer than 100 characters
  - Works for both POST (create) and PUT (update) operations
  - Ensures all tickets have meaningful titles for organization
- **Auto-Status Generation**: Automatic status setting when no status is provided
  - Defaults to "Open" status for new tickets
  - Works for both POST (create) and PUT (update) operations
  - Ensures all tickets have valid status for workflow management

## Development Guidelines

### Code Quality
- Use TypeScript for type safety
- Follow React best practices and hooks
- Implement proper error handling
- Write comprehensive tests
- Use semantic HTML and accessibility features

### Styling
- Use CSS custom properties for theming
- Implement responsive design patterns
- Ensure accessibility compliance
- Maintain consistent design system

### Testing
- Unit tests for utilities and services
- Component tests with user interaction simulation
- API mocking with MSW
- Error scenario testing

### Docker Support
- Multi-stage builds for development and production
- Nginx configuration for production serving
- Health checks and monitoring
- Environment variable configuration

## File Structure

```
ticketflow/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Shared components
│   │   ├── layout/         # Layout components
│   │   └── tickets/        # Ticket-specific components
│   │       ├── TicketLookup.tsx    # Ticket lookup component
│   │       ├── TicketForm.tsx      # Ticket form component
│   │       ├── TicketTable.tsx     # Ticket table component
│   │       └── TicketRow.tsx       # Ticket row component
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── server/                 # Express.js backend
│   ├── server.js           # Main server file
│   ├── database.js         # SQLite database service
│   └── tickets.db          # SQLite database file
├── public/                 # Static assets
├── scripts/                # Build and deployment scripts
└── test/                   # Test configuration
```

## API Endpoints

- `GET /rest/ticket` - Get all tickets
- `GET /rest/ticket/:id` - Get ticket by ID
- `POST /rest/ticket` - Create new ticket
- `PUT /rest/ticket/:id` - Update ticket
- `DELETE /rest/ticket/:id` - Delete ticket

## Ticket Data Structure

### Ticket Fields
- `ticket_number`: Unique ticket number (auto-generated)
- `issue_title`: Brief description (max 100 characters)
- `issue_description`: Detailed description (max 500 characters)
- `status`: Current status ('Open', 'In-progress', 'Closed')
- `priority`: Priority level ('Critical', 'High', 'Medium', 'Low')
- `email`: Contact email (validated)
- `phone_number`: US E.164 phone number format (+1XXXXXXXXXX)
- `notes`: Agent notes for internal communication (max 1000 characters, optional)
- `created`: ISO date string
- `changed`: ISO date string

### Request Types
- `CreateTicketRequest`: All fields required except notes (optional)
- `UpdateTicketRequest`: All fields optional for partial updates

## Database Schema

```sql
CREATE TABLE tickets (
  ticket_number TEXT PRIMARY KEY,
  issue_title TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'In-progress', 'Closed')),
  priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created TEXT NOT NULL,
  changed TEXT NOT NULL
);
```

## Environment Configuration

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:run
```

### Docker Development
```bash
docker build --target development -t ticketflow:dev .
docker run -p 3001:3001 -p 5173:5173 -e VITE_WEBHOOK_ENABLED=true ticketflow:dev
```

### Docker Production
```bash
docker build --target production -t ticketflow:prod .
docker run -p 80:80 -p 3001:3001 -e VITE_WEBHOOK_ENABLED=true ticketflow:prod
```

## Key Components

### Ticket Management
- **TicketTable**: Main table displaying all tickets with sorting and filtering
- **TicketForm**: Form for creating and editing tickets with notes field
- **TicketRow**: Individual ticket row component
- **TicketLookup**: Component for looking up tickets by ticket number
- **ConfirmationModal**: Modal for confirming destructive actions

### Common Components
- **ErrorBanner**: Displays application errors
- **DarkModeToggle**: Theme switching functionality
- **WebhookToggle**: Webhook integration control
- **HelpIcon**: Contextual help and tooltips

### Services
- **ticketService**: API calls for ticket operations
- **webhookService**: Webhook notification handling with notes support
- **databaseService**: SQLite database operations and migration

## Validation Rules

### Field Validation
- **Issue Title**: Required, max 100 characters
- **Issue Description**: Required, max 500 characters
- **Email**: Required, valid email format
- **Phone Number**: Required, US E.164 format (+1XXXXXXXXXX)
- **Status**: Required, must be 'Open', 'In-progress', or 'Closed'
- **Priority**: Required, must be 'Critical', 'High', 'Medium', or 'Low'
- **Notes**: Optional, max 1000 characters

## Database Migration

### Automatic Migration Process
1. **Startup Check**: Server checks for existing `db.json` file
2. **Duplicate Prevention**: Skips migration if SQLite already has data
3. **Data Migration**: Migrates all tickets with enhanced logging
4. **Verification**: Runs comprehensive database verification
5. **Backup**: Creates `db.json.backup` for safety

### Migration Features
- **Schema Validation**: Checks all required fields are present
- **Data Integrity**: Verifies ticket count and structure
- **Error Handling**: Continues migration even if individual tickets fail
- **Transaction Safety**: Uses SQLite transactions for data consistency

## Testing Strategy

### Unit Tests
- Utility functions (validation, date formatting)
- Service layer with API mocking
- Component behavior and user interactions

### Integration Tests
- API endpoint testing
- Webhook integration testing
- End-to-end user workflows

### Test Commands
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run all tests once
npm run test:coverage # Run tests with coverage
npm run test:ui       # Open test UI
```

## Deployment

### Docker Compose
```bash
# Development
docker-compose --profile dev up --build

# Production
docker-compose --profile prod up --build
```

### Manual Deployment
```bash
npm run build
npm run server
```

## Maintenance Tasks

### Regular Updates
- Keep dependencies up to date
- Monitor for security vulnerabilities
- Update Docker base images
- Review and update test coverage

### Performance Optimization
- Bundle size analysis
- Image optimization
- API response caching
- Database query optimization

### Security Considerations
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Security headers
- Dependency vulnerability scanning

## Support and Documentation

- Maintain comprehensive README
- Document API endpoints
- Provide usage examples
- Include troubleshooting guides
- Keep deployment instructions current

---

**Remember**: Always prioritize user experience, code quality, and maintainability. The TicketFlow application should be intuitive, reliable, and easy to extend with new features. The notes field provides agents with a dedicated space for internal communication without cluttering the main ticket description. The SQLite database provides robust data persistence with automatic migration from JSON files.