# Ticket Management System

A comprehensive React TypeScript ticketing system with full CRUD operations, sorting, filtering, and responsive design.

## Features

- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete tickets
- ✅ **Sortable & Filterable Table**: Sort by any column, filter by any field
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Form Validation**: Real-time validation with helpful error messages
- ✅ **Loading States**: Visual feedback during API operations
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Modern UI**: Clean, professional design with CSS custom properties
- ✅ **Dark Mode**: Toggle between light and dark themes with persistent preference
- ✅ **Mock Server**: Development server with CORS support
- ✅ **API Logging**: Comprehensive request/response logging for debugging
- ✅ **Webhook Integration**: Automatic notifications for ticket operations with configurable endpoints
- ✅ **Docker Support**: Multi-stage Docker builds for development and production

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with CSS Custom Properties
- **HTTP Client**: Axios
- **Mock Server**: JSON Server with CORS middleware
- **Package Manager**: npm
- **Containerization**: Docker with multi-stage builds
- **Production Server**: Nginx with API proxying

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

#### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickettaker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

This will start both the mock server (port 3001) and the React application (port 5173).

#### Option 2: Docker Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickettaker
   ```

2. **Build and run development container**
   ```bash
   # Using Docker directly
   docker build --target development -t tickettaker:dev .
   docker run -p 3001:3001 -p 5173:5173 -v $(pwd):/app tickettaker:dev

   # Using Docker Compose
   docker-compose --profile dev up --build
   ```

3. **Access the application**
   - React App: http://localhost:5173
   - API Server: http://localhost:3001

#### Option 3: Docker Production

1. **Build and run production container**
   ```bash
   # Using Docker directly
   docker build --target production -t tickettaker:prod .
   docker run -p 80:80 -p 3001:3001 tickettaker:prod

   # Using Docker Compose
   docker-compose --profile prod up --build
   ```

2. **Access the application**
   - Web Application: http://localhost
   - API Server: http://localhost:3001

### Development Scripts

- `npm run dev` - Start both mock server and React app
- `npm run dev:server` - Start only the mock server
- `npm run dev:client` - Start only the React app
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Makefile Commands

The project includes a Makefile for convenient Docker operations:

```bash
# Show all available commands
make help

# Development
make dev              # Start development server
make build            # Build for production
make test             # Run tests
make clean            # Clean build artifacts

# Docker
make docker-dev       # Build and run development container
make docker-prod      # Build and run production container
make docker-test      # Run Docker test script
make docker-clean     # Clean Docker images and containers

# Docker Compose
make compose-dev      # Start development with Docker Compose
make compose-prod     # Start production with Docker Compose
make compose-down     # Stop all Docker Compose services

# Utility
make logs-dev         # View development container logs
make logs-prod        # View production container logs
make shell-dev        # Open shell in development container
make shell-prod       # Open shell in production container
```

## Docker Deployment

The application includes comprehensive Docker support with multi-stage builds for optimal development and production environments.

### Docker Architecture

- **Development Stage**: Full development environment with hot reloading
- **Build Stage**: Optimized build process for production assets
- **Production Stage**: Nginx serving static files with API proxying

### Docker Configuration Files

- **Dockerfile**: Multi-stage build with development and production targets
- **nginx.conf**: Production Nginx configuration with security headers
- **docker-compose.yml**: Orchestration for different deployment scenarios
- **.dockerignore**: Optimized build context exclusion

### Docker Environment Variables

```env
# Core Configuration
NODE_ENV=development|production
PORT=3001

# Webhook Configuration
VITE_WEBHOOK_ENABLED=false|true
VITE_WEBHOOK_URL=https://api.genesys.com/webhook/tickets

# API Configuration
VITE_API_URL=http://localhost:3001/rest
VITE_API_KEY=68544b73bb5cccc333f6d956
VITE_CORS_API_KEY=68544b73bb5cccc333f6d956
```

### Docker Deployment Options

#### 1. Development Mode
```bash
# Build development image
docker build --target development -t tickettaker:dev .

# Run with volume mounting for hot reloading
docker run -p 3001:3001 -p 5173:5173 \
  -v $(pwd):/app \
  -e VITE_WEBHOOK_ENABLED=true \
  -e VITE_WEBHOOK_URL=https://your-webhook-url.com \
  tickettaker:dev

# Using Docker Compose
docker-compose --profile dev up --build
```

#### 2. Production Mode
```bash
# Build production image
docker build --target production -t tickettaker:prod .

# Run production container
docker run -p 80:80 -p 3001:3001 \
  -e VITE_WEBHOOK_ENABLED=true \
  -e VITE_WEBHOOK_URL=https://your-webhook-url.com \
  tickettaker:prod

# Using Docker Compose
docker-compose --profile prod up --build
```

#### 3. Production with Webhook Enabled
```bash
# Production with webhook enabled by default
docker-compose --profile prod-webhook up --build
```

### Docker Features

#### Development Features
- **Hot Reloading**: Live code changes without container restart
- **Volume Mounting**: Source code mounted for real-time updates
- **Development Tools**: Full development environment with debugging
- **Health Checks**: API server health monitoring

#### Production Features
- **Nginx Server**: Optimized static file serving
- **API Proxying**: Nginx proxies API requests to Node.js server
- **Security Headers**: Comprehensive security headers
- **Rate Limiting**: API rate limiting protection
- **Gzip Compression**: Static asset compression
- **Caching**: Optimized caching for static assets
- **Load Balancing**: Nginx upstream configuration

### Docker Health Checks

The application includes built-in health checks:

- **Development**: Checks API server at `/echo` endpoint
- **Production**: Checks both Nginx and API server health
- **Interval**: 30-second health check intervals
- **Timeout**: 3-second timeout for health checks
- **Retries**: 3 retry attempts before marking unhealthy

### Docker Compose Profiles

The `docker-compose.yml` file includes three profiles:

#### Development Profile (`dev`)
```bash
docker-compose --profile dev up --build
```
- Full development environment
- Hot reloading enabled
- Volume mounting for source code
- Ports: 3001 (API), 5173 (React)

#### Production Profile (`prod`)
```bash
docker-compose --profile prod up --build
```
- Optimized production build
- Nginx serving static files
- API proxying
- Ports: 80 (Nginx), 3001 (API)

#### Production with Webhook Profile (`prod-webhook`)
```bash
docker-compose --profile prod-webhook up --build
```
- Production build with webhook enabled
- Different ports to avoid conflicts
- Ports: 8080 (Nginx), 3002 (API)

### Docker Best Practices

#### Build Optimization
- Multi-stage builds for smaller production images
- Layer caching for faster builds
- `.dockerignore` for optimized build context

#### Security
- Non-root user in production
- Security headers in Nginx
- Rate limiting for API protection
- Minimal base images

#### Performance
- Gzip compression for static assets
- Optimized caching headers
- Efficient Nginx configuration
- Health checks for monitoring

### Docker Troubleshooting

#### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3001
   lsof -i :5173
   lsof -i :80
   ```

2. **Permission Issues**
   ```bash
   # Fix volume mounting permissions
   sudo chown -R $USER:$USER .
   ```

3. **Build Failures**
   ```bash
   # Clean build cache
   docker system prune -a
   docker build --no-cache --target production .
   ```

4. **Container Health**
   ```bash
   # Check container health
   docker ps
   docker logs <container-id>
   ```

#### Docker Test Script

A test script is included to verify Docker setup:

```bash
# Run the Docker test script
./scripts/docker-test.sh
```

This script will:
- Check if Docker is installed and running
- Test both development and production builds
- Verify container startup and health checks
- Clean up test containers automatically
- Provide usage examples

#### Debugging Commands

```bash
# View container logs
docker logs <container-id>

# Execute commands in running container
docker exec -it <container-id> /bin/sh

# Inspect container configuration
docker inspect <container-id>

# Monitor resource usage
docker stats <container-id>
```

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── ErrorBanner.tsx
│   │   ├── HelpIcon.tsx
│   │   └── ConfirmationModal.tsx
│   ├── tickets/          # Ticket-specific components
│   │   ├── TicketTable.tsx
│   │   ├── TicketForm.tsx
│   │   └── TicketRow.tsx
│   └── layout/           # Layout components
│       └── Header.tsx
├── services/
│   ├── ticketService.ts  # API service layer
│   └── webhookService.ts # Webhook notification service
├── types/
│   └── ticket.ts         # TypeScript interfaces
├── utils/
│   ├── validation.ts     # Form validation utilities
│   └── dateUtils.ts      # Date formatting utilities
├── styles/
│   └── global.css        # Global styles and CSS variables
└── App.tsx               # Main application component
```

## API Integration

The application includes a comprehensive service layer with:

- **Comprehensive Logging**: All API requests/responses are logged with emojis for easy debugging
- **Error Handling**: Proper error handling with user feedback
- **Type Safety**: Full TypeScript support for API operations
- **CORS Support**: Built-in CORS handling for cross-origin requests

### API Endpoints

- `GET /rest/ticket` - Get all tickets
- `GET /rest/ticket/:id` - Get specific ticket
- `POST /rest/ticket` - Create new ticket
- `PUT /rest/ticket/:id` - Update existing ticket
- `DELETE /rest/ticket/:id` - Delete ticket

### Environment Variables

Create a `.env.development` file for development:

```env
VITE_API_URL=http://localhost:3001/rest
VITE_API_KEY=68544b73bb5cccc333f6d956
VITE_CORS_API_KEY=68544b73bb5cccc333f6d956
```

## Webhook Configuration

The application includes webhook functionality that automatically notifies external systems when tickets are created, updated, or deleted.

### Webhook Environment Variables

Add the following to your `.env.development` file for webhook configuration:

```env
# Webhook Configuration
VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events
VITE_WEBHOOK_ENABLED=true
```

### Webhook Configuration Options

- **VITE_WEBHOOK_URL**: The URL where webhook notifications will be sent (default: `https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events`)
- **VITE_WEBHOOK_ENABLED**: Set to `false` to disable webhook functionality (default: `true`)

### Webhook Toggle

The application includes a small webhook toggle in the header (next to the dark mode toggle) that allows users to:

- **Enable/Disable**: Click the link icon to toggle webhook integration on/off
- **Visual Feedback**: The icon changes color (green when enabled, muted when disabled)
- **Tooltip**: Hover to see the current webhook status
- **Immediate Effect**: Changes take effect immediately without page refresh

The toggle provides a quick way to control webhook integration without needing to modify environment variables.

### Webhook Behavior

- **Asynchronous Execution**: Webhook calls are made asynchronously and don't block the UI
- **Error Handling**: Webhook failures are displayed in the error banner but don't prevent ticket operations
- **Payload Format**: POST requests with JSON body containing complete ticket data
- **Timeout**: 5-second timeout for webhook requests
- **Logging**: Comprehensive console logging including:
  - HTTP status codes and status text
  - Response headers and JSON response bodies
  - Detailed error information with status codes and error bodies
  - Request setup errors and network failures
- **Runtime Control**: Webhook state can be changed at runtime via the UI toggle

### Webhook Payload Example

When a ticket is created, updated, or deleted, the webhook sends a POST request with this payload:

```json
{
  "id": "1234567890",
  "action": "CREATE",
  "issue_title": "Critical Bug Report",
  "issue_description": "Application crashes on startup",
  "status": "Open",
  "priority": "Critical",
  "email": "user@example.com",
  "phone_number": "+15551234567",
  "created": "2024-01-15T10:30:00.000Z",
  "changed": "2024-01-15T10:30:00.000Z"
}
```

The `action` field will be one of: `CREATE`, `UPDATE`, or `DELETE` depending on the operation performed.

### Webhook Events

The application sends webhook notifications for the following events:

1. **CREATE**: When a new ticket is created
2. **UPDATE**: When an existing ticket is updated
3. **DELETE**: When a ticket is deleted (includes ticket data before deletion)

### Testing Webhooks

To test webhook functionality:

1. Set up a webhook endpoint (e.g., using webhook.site or a local server)
2. Configure the `VITE_WEBHOOK_URL` environment variable
3. Create, update, or delete tickets in the application
4. Check your webhook endpoint for incoming requests
5. Monitor the browser console for webhook logs

### Disabling Webhooks

Webhooks are enabled by default. To disable webhook functionality, either:

1. **Via Environment Variable**: Set `VITE_WEBHOOK_ENABLED=false` in your `.env.development` file
2. **Via UI Toggle**: Use the webhook toggle switch in the application interface

When disabled, no webhook calls will be made, and the application will operate normally without webhook notifications.

## Theme Customization

The application supports both light and dark themes with automatic preference detection and persistent storage.

### Dark Mode Features

- **Theme Toggle**: Click the sun/moon icon (🌙/☀️) in the header to switch themes
- **System Preference**: Automatically detects and applies your system's color scheme preference
- **Persistent Storage**: Your theme choice is saved in localStorage and remembered across sessions
- **Smooth Transitions**: All theme changes include smooth CSS transitions

### Theme Behavior

- **Default**: Light theme (unless system preference is dark)
- **Toggle**: Click the theme button to switch between light and dark
- **Persistence**: Theme choice is saved and restored on page reload
- **System Sync**: Respects `prefers-color-scheme` media query for initial load

### Customization

Themes are implemented using CSS custom properties, making it easy to customize colors:

```css
:root {
  /* Light theme colors */
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  /* ... other variables */
}

[data-theme="dark"] {
  /* Dark theme colors */
  --bg-primary: #1e293b;
  --text-primary: #f1f5f9;
  /* ... other variables */
}
```

## Usage

### Viewing Tickets

1. The main dashboard displays all tickets in a sortable, filterable table
2. Click column headers to sort by that field
3. Use the filter inputs below column headers to filter tickets
4. Tickets are sorted by creation date (newest first) by default

### Creating Tickets

1. Click the "Create Ticket" button
2. Fill out the form with:
   - **Issue Title** (required, max 100 characters)
   - **Issue Description** (required, max 500 characters)
   - **Email** (required, valid email format)
   - **Phone Number** (required, US E.164 format: +1XXXXXXXXXX)
   - **Priority** (Critical, High, Medium, Low)
   - **Status** (Open, In-progress, Closed)
3. Click "Create Ticket" to save

### Editing Tickets

1. Click on a ticket ID or the edit button (✏️) in the Actions column
2. Modify the ticket details in the form
3. Click "Update Ticket" to save changes

### Deleting Tickets

1. Click the delete button (🗑️) in the Actions column
2. Confirm the deletion in the confirmation modal
3. Click "Delete" to permanently remove the ticket

### Filtering and Sorting

- **Sorting**: Click any column header to sort by that field
- **Filtering**: Type in the filter inputs below column headers
- **Pagination**: Navigate through pages if you have more than 10 tickets

## Features in Detail

### Form Validation

- Real-time validation as you type
- Character limits enforced
- Email format validation
- Required field validation
- Visual error indicators

### Status and Priority Badges

- **Status**: Open (blue), In-progress (yellow), Closed (green)
- **Priority**: Critical (red), High (red), Medium (yellow), Low (green)

### Responsive Design

- Mobile-first approach
- Horizontal scrolling for tables on small screens
- Responsive modals and forms
- Touch-friendly buttons and inputs

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Focus indicators

## Development

### Mock Server

The development server runs on port 3001 and provides:

- RESTful API endpoints
- CORS support for development
- Sample data in `server/db.json`
- Request logging for debugging

### Adding New Features

1. **Components**: Add new components in the appropriate directory
2. **Types**: Define TypeScript interfaces in `src/types/`
3. **Services**: Add API calls in `src/services/`
4. **Styles**: Use CSS custom properties for consistent theming

## Testing

The application includes a comprehensive test suite built with Vitest, Testing Library, and MSW (Mock Service Worker) for reliable and maintainable tests.

### Test Setup

The testing environment is configured with:

- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **MSW**: API mocking for service layer tests
- **jsdom**: DOM environment for component tests

### Running Tests

#### All Tests
```bash
npm run test:run
```

#### Watch Mode (Development)
```bash
npm run test
```

#### Test Coverage
```bash
npm run test:coverage
```

### Test Structure

```
src/
├── components/
│   ├── common/__tests__/
│   │   └── ErrorBanner.test.tsx
│   └── tickets/__tests__/
│       └── TicketRow.test.tsx
├── services/__tests__/
│   ├── ticketService.test.ts
│   └── webhookService.test.ts
├── utils/__tests__/
│   ├── dateUtils.test.ts
│   └── validation.test.ts
└── test/
    ├── mocks/
    │   ├── handlers.ts
    │   └── server.ts
    └── setup.ts
```

### Test Categories

#### 1. Unit Tests (`src/utils/__tests__/`)
- **validation.test.ts**: Form validation utilities
- **dateUtils.test.ts**: Date formatting and manipulation functions

#### 2. Service Tests (`src/services/__tests__/`)
- **ticketService.test.ts**: API service layer with MSW mocking
- **webhookService.test.ts**: Webhook notification service with error handling

#### 3. Component Tests (`src/components/*/__tests__/`)
- **ErrorBanner.test.tsx**: Error display component
- **TicketRow.test.tsx**: Individual ticket row component

### Test Features

#### API Mocking with MSW
- Realistic API responses without external dependencies
- Network error simulation
- Request/response logging for debugging

#### Component Testing
- User interaction simulation
- Accessibility testing
- Props and state validation

#### Error Handling
- Webhook failure scenarios
- Network timeout testing
- Async operation testing

### Test Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open Vitest UI (if configured) |

### Writing Tests

#### Component Test Example
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TicketRow from '../TicketRow';

describe('TicketRow', () => {
  it('should render ticket information correctly', () => {
    const ticket = {
      _id: '1',
      issue_title: 'Test Ticket',
      status: 'Open',
      priority: 'High'
    };

    render(<TicketRow ticket={ticket} onEdit={() => {}} onDelete={() => {}} />);
    
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
```

#### Service Test Example
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ticketService } from '../ticketService';

describe('TicketService', () => {
  it('should fetch all tickets successfully', async () => {
    const tickets = await ticketService.getAllTickets();
    expect(tickets).toBeInstanceOf(Array);
  });
});
```

### Test Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **Mock External Dependencies**: Use MSW for API calls
5. **Test User Behavior**: Focus on user interactions, not implementation details

### Debugging Tests

#### Console Logging
Tests include comprehensive logging for debugging:
- API request/response logs
- Webhook operation logs
- Error details

#### Test Output
```bash
# Example test output with logs
stdout | src/services/__tests__/webhookService.test.ts > WebhookService > notifyTicketCreated > should send webhook notification for ticket creation
🔗 Webhook Request: CREATE for ticket 1
  📤 Webhook URL: https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events
✅ Webhook Success: CREATE for ticket 1
```