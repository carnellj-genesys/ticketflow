# TicketFlow

A modern, responsive ticket management system built with React, TypeScript, and Express.js. TicketFlow provides an intuitive interface for creating, managing, and tracking support tickets with real-time updates, webhook integrations, and SQLite database persistence.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Real-time Updates**: Live ticket status updates and notifications
- **Webhook Integration**: Seamless integration with external systems
- **RESTful API**: Full CRUD operations for ticket management
- **SQLite Database**: Robust data persistence with automatic migration
- **Agent Notes**: Multi-line notes field for internal communication
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Testing**: Comprehensive test suite with Vitest and React Testing Library
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

## 🛠️ Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd ticketflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**Note**: The application automatically migrates existing JSON data to SQLite on first startup.

### Enhanced Logging Options
```bash
# Standard development
npm run dev                    # Both frontend and backend
npm run dev:server            # Backend only (INFO level)
npm run dev:client            # Frontend only

# Enhanced logging
npm run dev:debug             # DEBUG level logging
npm run dev:trace             # TRACE level logging
npm run dev:file              # DEBUG + file logging
npm run dev:performance       # Performance logging

# See LOGGING_GUIDE.md for detailed logging options
```

## 🔧 Node.js Version Compatibility

### Node.js 20+ (Recommended)
The application is optimized for Node.js 20+ and uses `better-sqlite3` for enhanced performance.

### Node.js 18+ (Compatible Version)
If you're running Node.js 18+ (like on Amazon Linux), use the compatible version:

```bash
# Install dependencies (will show warnings but will work)
npm install

# Run the compatible server
npm run dev:server-compatible

# Or run the full application with compatible backend
npm run dev:server-compatible & npm run dev:client
```

**Note**: The compatible version uses `sqlite3` instead of `better-sqlite3` and has the same functionality but slightly different performance characteristics.

## 🐳 Docker Development with Docker Compose

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+

### Quick Start

1. **Build the application**:
```bash
# Build the development environment
docker-compose --profile dev build

# Build with no cache (if you encounter issues)
docker-compose --profile dev build --no-cache
```

2. **Start the development server**:
```bash
# Start the development environment
docker-compose --profile dev up

# Start in detached mode (background)
docker-compose --profile dev up -d

# Start with logs
docker-compose --profile dev up --build
```

3. **Access the application**:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/rest
- **Health Check**: http://localhost:3001/echo

### Docker Compose Commands

#### **Building**
```bash
# Build development environment
docker-compose --profile dev build

# Build production environment
docker-compose --profile prod build

# Build with webhook enabled
docker-compose --profile prod-webhook build

# Force rebuild (no cache)
docker-compose --profile dev build --no-cache
```

#### **Starting Services**
```bash
# Start development environment
docker-compose --profile dev up

# Start in detached mode
docker-compose --profile dev up -d

# Start with rebuild
docker-compose --profile dev up --build

# Start production environment
docker-compose --profile prod up -d

# Start with webhook enabled
docker-compose --profile prod-webhook up -d
```

#### **Stopping Services**
```bash
# Stop all services
docker-compose --profile dev down

# Stop and remove volumes
docker-compose --profile dev down -v

# Stop and remove images
docker-compose --profile dev down --rmi all

# Stop all profiles
docker-compose down
```

#### **Monitoring and Logs**
```bash
# View logs
docker-compose --profile dev logs

# Follow logs in real-time
docker-compose --profile dev logs -f

# View logs for specific service
docker-compose --profile dev logs ticketflow-dev

# Check service status
docker-compose --profile dev ps
```

#### **Troubleshooting**
```bash
# Clean up Docker system
docker system prune -f

# Remove all containers and images
docker-compose down --rmi all --volumes --remove-orphans

# Rebuild from scratch
docker-compose --profile dev build --no-cache
docker-compose --profile dev up
```

### Docker Compose Profiles

The application supports multiple deployment profiles:

#### **Development Profile** (`--profile dev`)
- **Purpose**: Local development with hot reload
- **Ports**: 3001 (API), 5173 (Frontend)
- **Features**: 
  - Hot module replacement
  - Volume mounting for live code changes
  - Debug logging enabled
  - Webhook integration enabled
  - SQLite database with automatic migration

#### **Production Profile** (`--profile prod`)
- **Purpose**: Production deployment
- **Ports**: 80 (Frontend), 3001 (API)
- **Features**:
  - Optimized build
  - Nginx serving static files
  - Production environment variables
  - Health checks enabled
  - SQLite database persistence

#### **Production with Webhook Profile** (`--profile prod-webhook`)
- **Purpose**: Production with webhook integration
- **Ports**: 8080 (Frontend), 3002 (API)
- **Features**:
  - All production features
  - Webhook integration enabled
  - Different ports to avoid conflicts
  - SQLite database with backup

### Environment Configuration

#### **Development Environment Variables**
```bash
NODE_ENV=development
VITE_WEBHOOK_ENABLED=true
VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/...
VITE_HOST=0.0.0.0
VITE_PORT=5173
```

#### **Production Environment Variables**
```bash
NODE_ENV=production
VITE_WEBHOOK_ENABLED=false
VITE_WEBHOOK_URL=https://api.genesys.com/webhook/tickets
```

### Common Issues and Solutions

#### **Port Already in Use**
```bash
# Check what's using the ports
lsof -i :5173
lsof -i :3001

# Stop conflicting services
docker-compose down
```

#### **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild with proper permissions
docker-compose --profile dev build --no-cache
```

#### **Vite Host Binding Issues**
If you see "use --host to expose" in logs:
- The `vite.config.ts` file should have `host: '0.0.0.0'`
- Rebuild the container: `docker-compose --profile dev build --no-cache`

#### **Rollup/Vite Native Module Issues**
If you encounter ARM64 compatibility issues:
- The Dockerfile uses `node:18-slim` for better compatibility
- Clean and rebuild: `docker system prune -f && docker-compose --profile dev build --no-cache`

### Development Workflow

1. **Initial Setup**:
```bash
# Clone and navigate to project
git clone <repository-url>
cd ticketflow

# Build and start development environment
docker-compose --profile dev build
docker-compose --profile dev up
```

2. **Daily Development**:
```bash
# Start development environment
docker-compose --profile dev up

# In another terminal, view logs
docker-compose --profile dev logs -f

# Stop when done
docker-compose --profile dev down
```

3. **Code Changes**:
- Edit files in your local directory
- Changes are automatically reflected due to volume mounting
- Vite hot reload will update the frontend
- Server will restart automatically for backend changes

4. **Testing Changes**:
```bash
# Run tests in container
docker-compose --profile dev exec ticketflow-dev npm test

# Run tests with coverage
docker-compose --profile dev exec ticketflow-dev npm run test:coverage
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run tests once
npm run test:run

# Run tests in Docker
docker-compose --profile dev exec ticketflow-dev npm test
```

## 📚 API Documentation

### Swagger Documentation

The application includes comprehensive Swagger/OpenAPI documentation that can be accessed at:

**Swagger UI**: http://localhost:3001/api-docs

This interactive documentation provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Example requests and responses
- Data validation rules

### Available Endpoints

#### **Ticket Management Endpoints**

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `GET` | `/rest/ticket` | Get all tickets | 200, 500 |
| `GET` | `/rest/ticket/:id` | Get ticket by ID | 200, 404, 500 |
| `POST` | `/rest/ticket` | Create new ticket | 201, 500 |
| `PUT` | `/rest/ticket/:id` | Update ticket | 200, 404, 500 |
| `DELETE` | `/rest/ticket/:id` | Delete ticket | 204, 404, 500 |

#### **Health Check Endpoints**

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `GET` | `/echo` | Health check (echoes query params) | 200 |

#### **Documentation Endpoints**

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `GET` | `/api-docs` | Swagger UI documentation | 200 |

### Endpoint Details

#### **GET /rest/ticket**
Retrieve all tickets from the database.

**Response (200):**
```json
[
  {
    "ticket_number": "1751053471201",
    "issue_title": "Mobile app crashes on startup",
    "issue_description": "The app is breaking",
    "status": "Open",
    "priority": "Critical",
    "email": "john.carnell@genesys.com",
    "phone_number": "+19202651560",
    "notes": "This is consistent problem",
    "created": "2025-06-27T19:44:31.201Z",
    "changed": "2025-07-22T16:54:01.213Z"
  }
]
```

#### **GET /rest/ticket/:id**
Retrieve a specific ticket by its ID.

**Parameters:**
- `id` (path, required): Ticket ID

**Response (200):**
```json
{
  "ticket_number": "1751053471201",
  "issue_title": "Mobile app crashes on startup",
  "issue_description": "The app is breaking",
  "status": "Open",
  "priority": "Critical",
  "email": "john.carnell@genesys.com",
  "phone_number": "+19202651560",
  "notes": "This is consistent problem",
  "created": "2025-06-27T19:44:31.201Z",
  "changed": "2025-07-22T16:54:01.213Z"
}
```

**Response (404):**
```json
{
  "error": "Ticket not found"
}
```

#### **POST /rest/ticket**
Create a new support ticket.

**Request Body:**
```json
{
  "issue_title": "Login page not loading",
  "issue_description": "Users cannot access the login page",
  "status": "Open",
  "priority": "High",
  "email": "user@example.com",
  "phone_number": "+15551234567",
  "notes": "Optional agent notes"
}
```

**Response (201):**
```json
{
  "ticket_number": "1751053471201",
  "issue_title": "Login page not loading",
  "issue_description": "Users cannot access the login page",
  "status": "Open",
  "priority": "High",
  "email": "user@example.com",
  "phone_number": "+15551234567",
  "notes": "Optional agent notes",
  "created": "2025-06-27T19:44:31.201Z",
  "changed": "2025-06-27T19:44:31.201Z"
}
```

#### **PUT /rest/ticket/:id**
Update an existing ticket by ID.

**Parameters:**
- `id` (path, required): Ticket ID

**Request Body (partial update):**
```json
{
  "status": "In-progress",
  "notes": "Working on the issue"
}
```

**Response (200):**
```json
{
  "ticket_number": "1751053471201",
  "issue_title": "Login page not loading",
  "issue_description": "Users cannot access the login page",
  "status": "In-progress",
  "priority": "High",
  "email": "user@example.com",
  "phone_number": "+15551234567",
  "notes": "Working on the issue",
  "created": "2025-06-27T19:44:31.201Z",
  "changed": "2025-06-27T20:30:15.123Z"
}
```

#### **DELETE /rest/ticket/:id**
Delete a ticket by ID.

**Parameters:**
- `id` (path, required): Ticket ID

**Response (204):** No content

**Response (404):**
```json
{
  "error": "Ticket not found"
}
```

#### **GET /echo**
Health check endpoint that echoes back query parameters.

**Parameters:**
- `message` (query, optional): Message to echo back

**Example Request:**
```
GET /echo?message=hello&status=ok
```

**Response (200):**
```json
{
  "message": "hello",
  "status": "ok"
}
```

### Data Validation

#### **Ticket Schema Validation**

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `issue_title` | string | Yes | Max 100 characters |
| `issue_description` | string | Yes | Max 500 characters |
| `status` | string | Yes | Must be: 'Open', 'In-progress', 'Closed' |
| `priority` | string | Yes | Must be: 'Critical', 'High', 'Medium', 'Low' |
| `email` | string | Yes | Valid email format |
| `phone_number` | string | Yes | US E.164 format (+1XXXXXXXXXX) |
| `notes` | string | No | Max 1000 characters |

#### **Request Headers**

The API supports the following headers:
- `Content-Type: application/json` (for POST/PUT requests)
- `x-apikey: <api-key>` (optional)
- `CORS-API-Key: <api-key>` (optional)

### Error Responses

All endpoints may return the following error responses:

#### **500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

#### **404 Not Found**
```json
{
  "error": "Ticket not found"
}
```

### Testing the API

#### **Using Swagger UI**
1. Start the application: `npm run dev`
2. Open http://localhost:3001/api-docs
3. Use the interactive interface to test endpoints

#### **Using curl**

**Get all tickets:**
```bash
curl -X GET http://localhost:3001/rest/ticket
```

**Get specific ticket:**
```bash
curl -X GET http://localhost:3001/rest/ticket/1751053471201
```

**Create new ticket:**
```bash
curl -X POST http://localhost:3001/rest/ticket \
  -H "Content-Type: application/json" \
  -d '{
    "issue_title": "New issue",
    "issue_description": "Description here",
    "status": "Open",
    "priority": "Medium",
    "email": "user@example.com",
    "phone_number": "+15551234567",
    "notes": "Optional notes"
  }'
```

**Update ticket:**
```bash
curl -X PUT http://localhost:3001/rest/ticket/1751053471201 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In-progress",
    "notes": "Updated notes"
  }'
```

**Delete ticket:**
```bash
curl -X DELETE http://localhost:3001/rest/ticket/1751053471201
```

### Ticket Schema

```typescript
interface Ticket {
  ticket_number: string;
  issue_title: string;  // Auto-generated from description if not provided
  issue_description: string;
  status: 'Open' | 'In-progress' | 'Closed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  email: string;
  phone_number: string;
  notes: string;  // Agent notes for internal communication
  created: string;
  changed: string;
}
```

### Database Schema

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

## 🔧 Configuration

### Environment Variables

- `VITE_WEBHOOK_ENABLED` - Enable/disable webhook notifications
- `VITE_WEBHOOK_URL` - Webhook endpoint URL
- `VITE_API_BASE_URL` - API base URL (default: http://localhost:3001)

### Webhook Configuration

To enable webhook notifications, set the following environment variables:

```bash
VITE_WEBHOOK_ENABLED=true
VITE_WEBHOOK_URL=https://your-webhook-endpoint.com/events
```

### Database Configuration

The application uses SQLite for data persistence:

- **Automatic Migration**: Existing JSON data is automatically migrated to SQLite
- **Backup Creation**: Original JSON file is backed up as `db.json.backup`
- **Data Integrity**: Comprehensive verification and error handling
- **Transaction Safety**: ACID compliance with SQLite transactions

### Auto-Generation Features

The application automatically generates missing fields when creating or updating tickets:

#### **Auto-Title Generation**
- **Smart Generation**: Uses the first 100 characters of the description as the title
- **Truncation**: Adds "..." if the description exceeds 100 characters
- **Works for**: Both ticket creation (POST) and updates (PUT)
- **Fallback**: Ensures all tickets have meaningful titles for better organization

#### **Auto-Status Generation**
- **Default Status**: Automatically sets status to "Open" when no status is provided
- **Works for**: Both ticket creation (POST) and updates (PUT)
- **Ensures**: All tickets have a valid status for proper workflow management

## 🏗️ Project Structure

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
│   ├── server.js           # Main server file
│   ├── database.js         # SQLite database service
│   └── tickets.db          # SQLite database file
├── public/                 # Static assets
├── scripts/                # Build and deployment scripts
├── tofu/                   # Terraform infrastructure
└── test/                   # Test configuration
```

## 🚀 Deployment

### Docker Compose Deployment

#### **Development Deployment**
```bash
# Build and start development environment
docker-compose --profile dev build
docker-compose --profile dev up -d

# Access at http://localhost:5173
```

#### **Production Deployment**
```bash
# Build and start production environment
docker-compose --profile prod build
docker-compose --profile prod up -d

# Access at http://localhost:80
```

#### **Production with Webhook**
```bash
# Build and start with webhook integration
docker-compose --profile prod-webhook build
docker-compose --profile prod-webhook up -d

# Access at http://localhost:8080
```

### Docker Hub Deployment

This section explains how to build and push Docker images to Docker Hub for distribution and deployment.

#### **Prerequisites**

1. **Docker Hub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **Docker CLI**: Ensure Docker is installed and running
3. **Repository**: Create a repository on Docker Hub (optional, can be created during push)

#### **Authentication**

1. **Login to Docker Hub**:
```bash
docker login
# Enter your Docker Hub username and password/token
```

2. **Using Access Token** (Recommended):
   - Go to Docker Hub → Account Settings → Security
   - Create a new access token
   - Use the token instead of your password:
```bash
docker login -u your-username
# Enter your access token when prompted for password
```

#### **Building Images**

1. **Build Production Image**:
```bash
# Build the production image
docker build -t your-username/ticketflow:latest .

# Build with specific tag
docker build -t your-username/ticketflow:v1.0.0 .

# Build with no cache (force rebuild)
docker build --no-cache -t your-username/ticketflow:latest .
```

2. **Build Development Image**:
```bash
# Build development image using alternative Dockerfile
docker build -f Dockerfile.alternative -t your-username/ticketflow:dev .

# Build with specific tag
docker build -f Dockerfile.alternative -t your-username/ticketflow:dev-v1.0.0 .
```

3. **Multi-architecture Build** (Advanced):
```bash
# Build for multiple platforms
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t your-username/ticketflow:latest --push .
```