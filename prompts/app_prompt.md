# React TypeScript Ticketing System - Development Requirements

You are a senior TypeScript React developer tasked with building a comprehensive ticketing system application. Please generate a complete, production-ready React application based on the following specifications.

## Project Setup & Technology Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: CSS modules or styled-components for component-specific styling
- **State Management**: React hooks (useState, useEffect) or Context API
- **HTTP Client**: Axios or fetch API
- **Build Tool**: Vite or Create React App
- **Package Manager**: npm or yarn
- **Development Server**: Express.js with CORS middleware
- **Mock Server**: Custom Express server for development data
- **Containerization**: Docker with multi-stage builds for development and production

## Docker Support

The application includes comprehensive Docker support for both development and production environments.

### Docker Architecture
- **Multi-stage Dockerfile**: Separate stages for development, build, and production
- **Development Stage**: Full development environment with hot reloading
- **Production Stage**: Optimized production build with Nginx serving static files
- **Health Checks**: Built-in health checks for both development and production
- **Environment Variables**: Configurable environment variables for all deployment scenarios

### Docker Configuration Files
- **Dockerfile**: Multi-stage build with development and production targets
- **nginx.conf**: Production Nginx configuration with API proxying and security headers
- **docker-compose.yml**: Orchestration for development and production deployments
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

#### Development Mode
```bash
# Build and run development container
docker build --target development -t tickettaker:dev .
docker run -p 3001:3001 -p 5173:5173 -e VITE_WEBHOOK_ENABLED=true tickettaker:dev

# Using Docker Compose
docker-compose --profile dev up --build
```

#### Production Mode
```bash
# Build and run production container
docker build --target production -t tickettaker:prod .
docker run -p 80:80 -p 3001:3001 -e VITE_WEBHOOK_ENABLED=true tickettaker:prod

# Using Docker Compose
docker-compose --profile prod up --build
```

#### Production with Webhook
```bash
# Production with webhook enabled
docker-compose --profile prod-webhook up --build
```

### Docker Features
- **Volume Mounting**: Database persistence through volume mounts
- **Network Isolation**: Custom Docker networks for service communication
- **Security Headers**: Nginx security headers in production
- **Rate Limiting**: API rate limiting in production
- **Gzip Compression**: Static asset compression
- **Caching**: Optimized caching for static assets
- **Load Balancing**: Nginx upstream configuration for API server

### Docker Health Checks
- **Development**: Checks API server health at `/echo` endpoint
- **Production**: Checks both Nginx and API server health
- **Interval**: 30-second health check intervals
- **Timeout**: 3-second timeout for health checks
- **Retries**: 3 retry attempts before marking unhealthy

## Webhook Integration

The application includes webhook integration that sends notifications when tickets are created, updated, or deleted. The webhook payload follows this structure:

```json
{
  "id": "string",
  "action": "CREATE" | "UPDATE" | "DELETE",
  "issue_title": "string",
  "issue_description": "string",
  "status": "Open" | "In-progress" | "Closed",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "email": "string",
  "phone_number": "string",
  "created": "string",
  "changed": "string"
}
```

The `action` field indicates the type of operation performed: `CREATE` for new tickets, `UPDATE` for modified tickets, or `DELETE` for removed tickets.

### Webhook Configuration

- **Default URL**: `https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events`
- **Environment Variable**: `VITE_WEBHOOK_URL` (overrides default)
- **Enable/Disable**: `VITE_WEBHOOK_ENABLED` (default: `true`, can be explicitly set to `false`)
- **Runtime Toggle**: WebhookToggle component allows enabling/disabling at runtime
- **Timeout**: 5 seconds
- **Async Execution**: Uses setTimeout to prevent blocking UI operations

### Webhook Toggle Component
- **Location**: Small toggle button in the header next to the dark mode toggle
- **Design**: Subtle link icon that changes color based on enabled/disabled state
- **Functionality**: 
  - Click to enable/disable webhook integration
  - Visual feedback with color changes (green when enabled, muted when disabled)
  - Hover effects with tooltip showing current status
  - Immediate state updates to the webhook service
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### Webhook Behavior
- **Asynchronous Execution**: Webhook calls are made asynchronously using `setTimeout` to prevent blocking the UI
- **Error Handling**: Webhook failures are displayed in the error banner but don't prevent main ticket operations
- **Payload Format**: POST requests with JSON body containing complete ticket data
- **Timeout**: 5-second timeout for webhook requests
- **Logging**: Comprehensive console logging including:
  - HTTP status codes and status text
  - Response headers and JSON response bodies
  - Detailed error information with status codes and error bodies
  - Request setup errors and network failures
- **Runtime Control**: Webhook state can be changed at runtime via the UI toggle

### Webhook Integration Points
- **Create Ticket**: Webhook called after successful ticket creation
- **Update Ticket**: Webhook called after successful ticket update
- **Delete Ticket**: Webhook called after successful ticket deletion (with ticket data fetched before deletion)

### Error Handling
- Webhook failures don't prevent main ticket operations from completing
- Failed webhook attempts are logged to console with detailed error information
- Webhook errors are displayed in the main error banner on the landing page
- If webhook is disabled via environment variable, no calls are made

## Data Model 

### Ticket Entity
```typescript
interface Ticket {
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
```

### Field Constraints
- **issue_title**: Required, max 100 characters, no special formatting
- **issue_description**: Required, max 500 characters, supports line breaks
- **status**: Required, enum values only
- **priority**: Required, enum values only  
- **email**: Required, must be valid email format
- **phone_number**: Required, must be valid US E.164 format (+1XXXXXXXXXX)
- **created**: Auto-generated, read-only, sortable
- **changed**: Auto-generated, read-only, sortable

## Application Architecture

### Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── ErrorBanner.tsx
│   │   ├── HelpIcon.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── WebhookToggle.tsx
│   │   ├── Tooltip.tsx
│   │   └── ConfirmationModal.tsx
│   ├── tickets/
│   │   ├── TicketTable.tsx
│   │   ├── TicketForm.tsx
│   │   └── TicketRow.tsx
│   └── layout/
│       └── Header.tsx (includes TicketIcon SVG component)
├── services/
│   ├── ticketService.ts
│   └── webhookService.ts
├── types/
│   └── ticket.ts
├── utils/
│   ├── validation.ts
│   └── dateUtils.ts
├── styles/
│   └── global.css
└── App.tsx
```

### Global Styling Requirements
- Create a single `global.css` file for all application styles
- Use CSS custom properties for consistent theming
- Implement responsive design for mobile compatibility
- Use modern CSS features (Grid, Flexbox, CSS Variables)
- Support both light and dark themes with CSS custom properties
- Theme preference saved in localStorage
- Respect user's system preference for initial theme

### Header CSS Classes
```css
.header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: var(--radius-lg);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.logo:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.brand-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.brand-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-actions button {
  transition: all 0.2s ease-in-out;
}

.header-actions button:hover {
  transform: translateY(-1px);
  color: var(--primary-color);
}
```

## Screen Specifications

### 1. Landing Screen (Main Dashboard)

**Location**: `/` (root route)

**Features**:
- **Data Table**: Display all tickets in a sortable table with horizontal scrolling
- **Default Sort**: Newest to oldest by `created` field
- **Columns**: ID, Title, Description, Status, Priority, Email, Actions
- **Interactive Elements**:
  - Clickable ID buttons → open Update Record Screen modal
  - Sortable columns (click header to sort)
  - Delete button per row with confirmation modal
- **Pagination**: Handle large datasets (implement if >50 records)
- **Create Button**: Fixed position or prominent placement

**Table Features**:
- **Horizontal Scrolling**: Table container with overflow-x: auto and minimum width
- **Fixed Column Widths**: Each column has defined width and minimum width
- **ID Truncation**: Long IDs are truncated with ellipsis (first 8 characters + "...")
- **ID Tooltips**: Full ID displayed on hover via title attribute
- **Responsive Design**: Horizontal scroll on mobile devices
- **Loading States**: While fetching data
- **Empty State**: When no tickets exist
- **Error Handling**: With retry functionality

### 2. Create Record Screen

**Type**: Modal/Popup window

**Form Fields**:
- Issue Title (text input, required, max 100 chars)
- Issue Description (textarea, required, max 500 chars)
- Email (email input, required, validation)
- Priority (select dropdown, required)
- Status (select dropdown, required, default: "Open")

**Validation Rules**:
- All fields required
- Email format validation
- Character limits enforced
- Real-time validation feedback

**Actions**:
- **Save**: POST to API, show loading state, refresh main table on success
- **Cancel**: Close modal, discard changes
- **Form Reset**: Clear all fields on successful save

### 3. Update Record Screen

**Type**: Modal/Popup window

**Data Loading**: Fetch ticket by ID on modal open

**Form Fields** (pre-populated):
- Issue Title (editable)
- Issue Description (editable)
- Email (editable, validation)
- Priority (editable)
- Status (editable)

**Actions**:
- **Update**: PUT to API, show loading state, close modal on success
- **Cancel**: Close modal, discard changes

## UI/UX Requirements

### Header Design
- **Professional Branding**: Modern header with "TicketFlow" as the main brand name
- **Logo Design**: Custom SVG ticket icon in a gradient container (48x48px)
- **Typography Hierarchy**: 
  - Brand title: "TicketFlow" (font-size-2xl, font-weight-700, letter-spacing: -0.025em)
  - Brand subtitle: "Management System" (font-size-sm, uppercase, letter-spacing: 0.05em)
- **Layout Structure**: 
  - Left side: Logo + brand text in horizontal layout
  - Right side: Action buttons (help icon, dark mode toggle)
  - Responsive: Stacks vertically on mobile devices
- **Interactive Elements**:
  - Logo hover effect: translateY(-2px) with enhanced shadow
  - Action button hover effects: translateY(-1px) with color change
  - Smooth transitions (0.2s-0.3s ease-in-out)
- **Visual Design**:
  - Subtle box shadow on header container
  - Gradient logo background (primary-color to primary-hover)
  - Consistent spacing using CSS custom properties

### Global Design System
- **Color Scheme**: Professional, accessible colors
- **Typography**: Clear, readable fonts with proper hierarchy
- **Spacing**: Consistent padding/margins throughout
- **Icons**: Use appropriate icons for actions (edit, delete, help, etc.)

### Interactive Elements
- **Help Icon**: Question mark icon in header, opens help modal
- **Dark Mode Toggle**: Sun/moon icon in header, switches between light and dark themes
- **Tooltips**: Hover tooltips on all form fields explaining their purpose
- **Error Banner**: Red banner at top of screen for API errors and webhook failures
- **Loading States**: Spinners/loading indicators for async operations
- **Confirmation Modals**: For destructive actions (delete)
- **Action Buttons**: 
  - Edit button: Secondary button style with pencil icon (✏️)
  - Delete button: Subtle ghost button with hover effects, trash icon (🗑️)

### Table Design Specifications
- **ID Column**: 
  - Width: 80px, minimum width: 80px
  - Truncated IDs with ellipsis for IDs longer than 8 characters
  - Full ID shown in tooltip on hover
  - Clickable button (no hyperlink styling) to open edit modal
  - Regular text color (no underline or primary color)
- **Title Column**: Width: 200px, minimum width: 200px
- **Description Column**: Width: 300px, minimum width: 300px
- **Status Column**: Width: 100px, minimum width: 100px
- **Priority Column**: Width: 100px, minimum width: 100px
- **Email Column**: Width: 180px, minimum width: 180px
- **Actions Column**: Width: 120px, minimum width: 120px
- **Table Container**: Horizontal scroll enabled with minimum table width of 1000px

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## API Integration

### Service Layer
Create dedicated service classes in `src/services/`:

```typescript
// ticketService.ts
class TicketService {
  private baseUrl: string;
  private apiKey: string;
  private corsApiKey: string;
  
  constructor() {
    this.baseUrl = 'http://localhost:3001/rest';
    this.apiKey = '68544b73bb5cccc333f6d956';
    this.corsApiKey = '68544b73bb5cccc333f6d956';
  }
  
  private getHeaders() {
    return {
      'x-apikey': this.apiKey,
      'CORS-API-Key': this.corsApiKey,
      'Content-Type': 'application/json'
    };
  }

  private logRequest(method: string, url: string, data?: any) {
    console.group(`🚀 API Request: ${method} ${url}`);
    console.log('📤 Request Headers:', this.getHeaders());
    if (data) {
      console.log('📤 Request Body:', data);
    }
    console.groupEnd();
  }

  private logResponse(method: string, url: string, response: AxiosResponse) {
    console.group(`✅ API Response: ${method} ${url}`);
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data:', response.data);
    console.groupEnd();
  }

  private logError(method: string, url: string, error: any) {
    console.group(`❌ API Error: ${method} ${url}`);
    console.error('📥 Error Details:', error);
    if (error.response) {
      console.error('📥 Error Status:', error.response.status);
      console.error('📥 Error Headers:', error.response.headers);
      console.error('📥 Error Data:', error.response.data);
    }
    console.groupEnd();
  }
  
  // Implement CRUD methods with comprehensive logging and webhook integration
  async getAllTickets(): Promise<Ticket[]>
  async getTicketById(id: string): Promise<Ticket>
  async createTicket(ticket: CreateTicketRequest): Promise<Ticket>
  async updateTicket(id: string, ticket: UpdateTicketRequest): Promise<Ticket>
  async deleteTicket(id: string): Promise<void>
}

// webhookService.ts
class WebhookService {
  private config: WebhookConfig;
  
  constructor() {
    this.config = {
      url: import.meta.env.VITE_WEBHOOK_URL || 'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
      enabled: import.meta.env.VITE_WEBHOOK_ENABLED !== 'false',
      timeout: 5000
    };
  }
  
  async notifyTicketCreated(ticket: Ticket): Promise<void>
  async notifyTicketUpdated(ticket: Ticket): Promise<void>
  async notifyTicketDeleted(ticket: Ticket): Promise<void>
}
```

### API Endpoints
- **GET** `/ticket` - Retrieve all tickets
- **GET** `/ticket/{id}` - Retrieve specific ticket
- **POST** `/ticket` - Create new ticket
- **PUT** `/ticket/{id}` - Update existing ticket
- **DELETE** `/ticket/{id}` - Delete ticket

### Request Headers
All API calls must include:
```
x-api-key: 54ccc6c8805e7a3312b7cc184465495f35c5c
CORS-API-Key: 68544b73bb5cccc333f6d956
Content-Type: application/json
```

### Environment Variables
- `VITE_API_URL`: Override API base URL (default: `http://localhost:3001/rest`)
- `VITE_API_KEY`: Override API key (default: `68544b73bb5cccc333f6d956`)
- `VITE_CORS_API_KEY`: Override CORS API key (default: `68544b73bb5cccc333f6d956`)
- `VITE_WEBHOOK_URL`: Webhook endpoint URL (default: `https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events`)
- `VITE_WEBHOOK_ENABLED`: Enable/disable webhook functionality (default: `false`, must be set to `true` to enable)

### API Logging Requirements
Implement comprehensive logging for all API calls to facilitate debugging and monitoring:

#### Request Logging
- Log method, URL, headers, and request body (for POST/PUT)
- Use console.group for organized output
- Include emojis for visual distinction (🚀 for requests)

#### Response Logging
- Log response status, headers, and data
- Use console.group for organized output
- Include emojis for visual distinction (✅ for responses)

#### Error Logging
- Log full error details including response status and data
- Use console.group for organized output
- Include emojis for visual distinction (❌ for errors)

#### Log Format Example
```
🚀 API Request: GET https://cragent-ea08.restdb.io/rest/ticket
  📤 Request Headers: {x-api-key: "...", CORS-API-Key: "...", Content-Type: "application/json"}

✅ API Response: GET https://cragent-ea08.restdb.io/rest/ticket
  📥 Response Status: 200
  📥 Response Headers: {content-type: "application/json", ...}
  📥 Response Data: [{_id: "...", issue_title: "...", ...}]
```

## Error Handling

### API Error Scenarios
- Network failures
- 4xx/5xx HTTP errors
- Invalid data responses
- Timeout errors

### User Feedback
- Error banner for API errors
- Form validation errors
- Loading states
- Success confirmations

## Data Mapping

| Screen Field | API Field | Notes |
|--------------|-----------|-------|
| id | _id | Unique identifier |
| issue_title | issue_title | Max 100 chars |
| issue_description | issue_description | Max 500 chars |
| status | status | Enum values only |
| priority | priority | Enum values only |
| email | email | Valid email format |
| created_at | created | ISO date string |
| updated_at | changed | ISO date string |

## Additional Requirements

### Performance
- Implement proper React optimization (memo, useMemo, useCallback)
- Lazy loading for large datasets
- Debounced search/filter inputs

### Security
- Input sanitization
- XSS prevention
- API key security (environment variables)
- CORS support with dedicated API key

### Debugging & Monitoring
- Comprehensive API request/response logging
- Console-based debugging information
- Visual distinction between request, response, and error logs
- Organized log grouping for better readability

### Testing Considerations
- Component unit tests
- Service layer tests
- Error handling tests

### Deployment
- Build optimization
- Environment configuration
- Static file serving

## Success Criteria

The application should:
1. ✅ Display all tickets in a sortable table with horizontal scrolling
2. ✅ Allow creation of new tickets via modal form
3. ✅ Allow editing of existing tickets via modal form
4. ✅ Allow deletion of tickets with confirmation
5. ✅ Handle all error scenarios gracefully
6. ✅ Provide responsive, accessible UI
7. ✅ Follow React/TypeScript best practices
8. ✅ Include proper loading states and user feedback
9. ✅ Implement proper form validation
10. ✅ Use environment variables for configuration
11. ✅ Include CORS-API key support for cross-origin requests
12. ✅ Provide comprehensive API logging for debugging and monitoring
13. ✅ Display truncated IDs with tooltips for long ticket IDs
14. ✅ Support horizontal scrolling for table overflow
15. ✅ Use fixed column widths for consistent layout
16. ✅ Display ID as clickable button without hyperlink styling
17. ✅ Include webhook integration for external system notifications
18. ✅ Display webhook errors in the main error banner
19. ✅ Use elegant, subtle delete button design with hover effects
20. ✅ Optimize table layout without date columns for better focus on essential data

## Development Server Setup

### Mock Server Configuration
Create a custom Express server for development:

**File**: `server/db.json`
```json
{
  "ticket": [
    {
      "_id": "1",
      "issue_title": "Login page not loading",
      "issue_description": "Users are unable to access the login page. The page shows a blank screen with no error messages.",
      "status": "Open",
      "priority": "High",
      "email": "user@example.com",
      "created": "2024-01-15T10:30:00.000Z",
      "changed": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "2",
      "issue_title": "Database connection timeout",
      "issue_description": "Application experiencing intermittent database connection timeouts during peak hours.",
      "status": "In-progress",
      "priority": "Critical",
      "email": "admin@company.com",
      "created": "2024-01-14T14:20:00.000Z",
      "changed": "2024-01-15T09:15:00.000Z"
    },
    {
      "_id": "3",
      "issue_title": "Email notifications not sending",
      "issue_description": "System emails are not being delivered to users. SMTP configuration appears correct.",
      "status": "Closed",
      "priority": "Medium",
      "email": "support@company.com",
      "created": "2024-01-13T16:45:00.000Z",
      "changed": "2024-01-14T11:30:00.000Z"
    }
  ]
}
```

**File**: `server/server.js`
```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-apikey', 'CORS-API-Key', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Load database
let db = { ticket: [] };

async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(data);
    console.log(`📊 Loaded ${db.ticket.length} tickets from database`);
  } catch (error) {
    console.log('📊 No existing database found, starting with empty data');
    db = { ticket: [] };
  }
}

async function saveDatabase() {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    console.log('💾 Data saved successfully');
  } catch (error) {
    console.error('❌ Error saving database:', error);
  }
}

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`🚀 Mock Server Request: ${req.method} ${req.path}`);
  console.log('📤 Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📤 Request Body:', req.body);
  }
  next();
});

// GET all tickets
app.get('/rest/ticket', (req, res) => {
  console.log(`✅ GET /rest/ticket - Returning ${db.ticket.length} tickets`);
  res.json(db.ticket);
});

// GET ticket by ID
app.get('/rest/ticket/:id', (req, res) => {
  const ticket = db.ticket.find(t => t._id === req.params.id);
  if (ticket) {
    console.log(`✅ GET /rest/ticket/${req.params.id} - Found ticket`);
    res.json(ticket);
  } else {
    console.log(`❌ GET /rest/ticket/${req.params.id} - Ticket not found`);
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// POST new ticket
app.post('/rest/ticket', async (req, res) => {
  const newTicket = {
    _id: Date.now().toString(),
    ...req.body,
    created: new Date().toISOString(),
    changed: new Date().toISOString()
  };
  
  db.ticket.push(newTicket);
  await saveDatabase();
  
  console.log(`✅ POST /rest/ticket - Created ticket ${newTicket._id}`);
  res.status(201).json(newTicket);
});

// PUT update ticket
app.put('/rest/ticket/:id', async (req, res) => {
  const index = db.ticket.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    db.ticket[index] = {
      ...db.ticket[index],
      ...req.body,
      changed: new Date().toISOString()
    };
    
    await saveDatabase();
    console.log(`✅ PUT /rest/ticket/${req.params.id} - Updated ticket`);
    res.json(db.ticket[index]);
  } else {
    console.log(`❌ PUT /rest/ticket/${req.params.id} - Ticket not found`);
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// DELETE ticket
app.delete('/rest/ticket/:id', async (req, res) => {
  const index = db.ticket.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    db.ticket.splice(index, 1);
    await saveDatabase();
    console.log(`✅ DELETE /rest/ticket/${req.params.id} - Deleted ticket`);
    res.status(204).send();
  } else {
    console.log(`❌ DELETE /rest/ticket/${req.params.id} - Ticket not found`);
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Mock Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, async () => {
  await loadDatabase();
  console.log(`🎯 Mock Express Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/rest`);
  console.log(`🔧 CORS enabled for development`);
});
```

### Development Dependencies
Add the following to `package.json`:

```json
{
  "devDependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "concurrently": "^8.2.2"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "node server/server.js",
    "dev:client": "vite",
    "server": "node server/server.js",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Environment Configuration
Create `.env.development` file:

```env
# Development Environment Variables
VITE_API_URL=http://localhost:3001/rest
VITE_API_KEY=68544b73bb5cccc333f6d956
VITE_CORS_API_KEY=68544b73bb5cccc333f6d956

# Webhook Configuration
VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events
VITE_WEBHOOK_ENABLED=true
```

### CORS Middleware Features
The development server should include:

1. **Flexible Origin Support**: Allow requests from common development ports (3000, 5173)
2. **Credential Support**: Enable credentials for authenticated requests
3. **Method Support**: Allow all necessary HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
4. **Header Support**: Allow custom headers including API keys
5. **Error Handling**: Proper error responses with CORS headers
6. **Request Logging**: Log all incoming requests for debugging

### Development Workflow
1. **Start Development**: Run `npm run dev` to start both mock server and React app
2. **Mock Server**: Runs on `http://localhost:3001` with API at `/rest`
3. **React App**: Runs on `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)
4. **API Endpoints**: All API calls go to mock server during development
5. **Hot Reload**: Both server and client support hot reloading

### Production vs Development
- **Development**: Uses custom Express server with CORS middleware
- **Production**: Uses actual REST API with proper CORS configuration
- **Environment Detection**: Automatically switches based on NODE_ENV

Generate a complete, working React TypeScript application that meets all these requirements.