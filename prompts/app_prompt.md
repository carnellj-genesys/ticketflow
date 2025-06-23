# TicketFlow Application Development Prompt

## Overview

You are tasked with developing and maintaining the **TicketFlow** application - a modern, responsive ticket management system built with React, TypeScript, and Express.js. This application provides an intuitive interface for creating, managing, and tracking support tickets with real-time updates and webhook integrations.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with CSS Custom Properties
- **HTTP Client**: Axios
- **Backend**: Express.js with JSON Server
- **Testing**: Vitest with React Testing Library
- **Containerization**: Docker with multi-stage builds

## Core Features

### 1. Ticket Management
- Complete CRUD operations (Create, Read, Update, Delete)
- Sortable and filterable ticket table
- Real-time status updates
- Priority and status management

### 2. User Interface
- Responsive design for desktop, tablet, and mobile
- Dark mode support with persistent preference
- Modern, clean UI with accessibility features
- Form validation with real-time feedback

### 3. Webhook Integration
- Automatic notifications for ticket operations
- Configurable webhook endpoints
- Error handling and retry logic
- Runtime enable/disable toggle

### 4. API Layer
- RESTful API with comprehensive endpoints
- CORS support for cross-origin requests
- Request/response logging for debugging
- Error handling and status codes

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
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── server/                 # Express.js backend
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
- **TicketForm**: Form for creating and editing tickets
- **TicketRow**: Individual ticket row component
- **ConfirmationModal**: Modal for confirming destructive actions

### Common Components
- **ErrorBanner**: Displays application errors
- **DarkModeToggle**: Theme switching functionality
- **WebhookToggle**: Webhook integration control
- **HelpIcon**: Contextual help and tooltips

### Services
- **ticketService**: API calls for ticket operations
- **webhookService**: Webhook notification handling

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

**Remember**: Always prioritize user experience, code quality, and maintainability. The TicketFlow application should be intuitive, reliable, and easy to extend with new features.