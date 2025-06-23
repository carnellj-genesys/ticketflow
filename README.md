# TicketFlow

A modern, responsive ticket management system built with React, TypeScript, and Express.js. TicketFlow provides an intuitive interface for creating, managing, and tracking support tickets with real-time updates and webhook integrations.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Real-time Updates**: Live ticket status updates and notifications
- **Webhook Integration**: Seamless integration with external systems
- **RESTful API**: Full CRUD operations for ticket management
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Testing**: Comprehensive test suite with Vitest and React Testing Library
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

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

### Docker Development

1. Build and run with Docker:
```bash
docker build --target development -t ticketflow:dev .
docker run -p 3001:3001 -p 5173:5173 -v $(pwd):/app ticketflow:dev
```

### Docker Production

1. Build and run production container:
```bash
docker build --target production -t ticketflow:prod .
docker run -p 80:80 -p 3001:3001 ticketflow:prod
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
```

## 📚 API Documentation

### Endpoints

- `GET /rest/ticket` - Get all tickets
- `GET /rest/ticket/:id` - Get ticket by ID
- `POST /rest/ticket` - Create new ticket
- `PUT /rest/ticket/:id` - Update ticket
- `DELETE /rest/ticket/:id` - Delete ticket

### Ticket Schema

```typescript
interface Ticket {
  _id: string;
  issue_title: string;
  issue_description: string;
  status: 'Open' | 'In-progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  email: string;
  phone_number: string;
  created: string;
  changed: string;
}
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
├── public/                 # Static assets
├── scripts/                # Build and deployment scripts
└── test/                   # Test configuration
```

## 🚀 Deployment

### Docker Compose

1. Development environment:
```bash
docker build --target development -t ticketflow:dev .
docker run -p 3001:3001 -p 5173:5173 -v $(pwd):/app ticketflow:dev
```

2. Production environment:
```bash
docker build --target production -t ticketflow:prod .
docker run -p 80:80 -p 3001:3001 ticketflow:prod
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**TicketFlow** - Streamlining ticket management for modern teams.