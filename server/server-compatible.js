import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { databaseService } from './database-compatible.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TicketFlow API',
      version: '1.0.0',
      description: 'A comprehensive ticket management system API with auto-generation features',
      contact: {
        name: 'API Support',
        email: 'support@ticketflow.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Ticket: {
          type: 'object',
          required: ['ticket_number', 'issue_description', 'priority', 'email', 'phone_number', 'created', 'changed'],
          properties: {
            ticket_number: {
              type: 'string',
              description: 'Unique ticket number for the ticket'
            },
            issue_title: {
              type: 'string',
              maxLength: 100,
              description: 'Brief description of the issue (auto-generated from description if not provided)'
            },
            issue_description: {
              type: 'string',
              maxLength: 500,
              description: 'Detailed description of the issue'
            },
            status: {
              type: 'string',
              enum: ['Open', 'In-progress', 'Closed'],
              description: 'Current status of the ticket (auto-set to "Open" if not provided)'
            },
            priority: {
              type: 'string',
              enum: ['Critical', 'High', 'Medium', 'Low'],
              description: 'Priority level of the ticket'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address'
            },
            phone_number: {
              type: 'string',
              pattern: '^\\+1[0-9]{10}$',
              description: 'US E.164 phone number format (+1XXXXXXXXXX)'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Agent notes for internal communication (optional)'
            },
            created: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            changed: {
              type: 'string',
              format: 'date-time',
              description: 'Last modification timestamp'
            }
          }
        },
        CreateTicketRequest: {
          type: 'object',
          required: ['issue_description', 'priority', 'email', 'phone_number'],
          properties: {
            issue_title: {
              type: 'string',
              maxLength: 100,
              description: 'Brief description of the issue (auto-generated from description if not provided)'
            },
            issue_description: {
              type: 'string',
              maxLength: 500,
              description: 'Detailed description of the issue'
            },
            status: {
              type: 'string',
              enum: ['Open', 'In-progress', 'Closed'],
              description: 'Current status of the ticket (auto-set to "Open" if not provided)'
            },
            priority: {
              type: 'string',
              enum: ['Critical', 'High', 'Medium', 'Low'],
              description: 'Priority level of the ticket'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address'
            },
            phone_number: {
              type: 'string',
              pattern: '^\\+1[0-9]{10}$',
              description: 'US E.164 phone number format (+1XXXXXXXXXX)'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Agent notes for internal communication (optional)'
            }
          }
        },
        UpdateTicketRequest: {
          type: 'object',
          properties: {
            issue_title: {
              type: 'string',
              maxLength: 100,
              description: 'Brief description of the issue (auto-generated from description if not provided)'
            },
            issue_description: {
              type: 'string',
              maxLength: 500,
              description: 'Detailed description of the issue'
            },
            status: {
              type: 'string',
              enum: ['Open', 'In-progress', 'Closed'],
              description: 'Current status of the ticket (auto-set to "Open" if not provided)'
            },
            priority: {
              type: 'string',
              enum: ['Critical', 'High', 'Medium', 'Low'],
              description: 'Priority level of the ticket'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address'
            },
            phone_number: {
              type: 'string',
              pattern: '^\\+1[0-9]{10}$',
              description: 'US E.164 phone number format (+1XXXXXXXXXX)'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Agent notes for internal communication'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./server/server-compatible.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-apikey', 'CORS-API-Key', 'Authorization']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`🚀 Mock Server Request: ${req.method} ${req.path}`);
  console.log('📤 Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📤 Request Body:', req.body);
  }
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /rest/ticket:
 *   get:
 *     summary: Get all tickets
 *     description: Retrieve all tickets from the database
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/rest/ticket', async (req, res) => {
  try {
    const tickets = await databaseService.getAllTickets();
    console.log(`✅ GET /rest/ticket - Returning ${tickets.length} tickets`);
    res.json(tickets);
  } catch (error) {
    console.error('❌ Error getting tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /rest/ticket/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     description: Retrieve a specific ticket by its ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/rest/ticket/:id', async (req, res) => {
  try {
    const ticket = await databaseService.getTicketById(req.params.id);
    if (ticket) {
      console.log(`✅ GET /rest/ticket/${req.params.id} - Found ticket`);
      res.json(ticket);
    } else {
      console.log(`❌ GET /rest/ticket/${req.params.id} - Ticket not found`);
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('❌ Error getting ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /rest/ticket:
 *   post:
 *     summary: Create a new ticket
 *     description: Create a new ticket with auto-generation features for title and status
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/rest/ticket', async (req, res) => {
  try {
    // Generate title from description if no title is provided
    let issueTitle = req.body.issue_title;
    if (!issueTitle && req.body.issue_description) {
      issueTitle = req.body.issue_description.substring(0, 100);
      if (req.body.issue_description.length > 100) {
        issueTitle += '...';
      }
      console.log(`📝 Auto-generated title from description: "${issueTitle}"`);
    }
    
    // Set status to "Open" if no status is provided
    let status = req.body.status;
    if (!status) {
      status = 'Open';
      console.log(`📋 Auto-setting status to "Open"`);
    }
    
    const newTicket = {
      ticket_number: Date.now().toString(),
      ...req.body,
      issue_title: issueTitle,
      status: status,
      created: new Date().toISOString(),
      changed: new Date().toISOString()
    };
    
    const success = await databaseService.createTicket(newTicket);
    if (success) {
      console.log(`✅ POST /rest/ticket - Created ticket ${newTicket.ticket_number}`);
      res.status(201).json(newTicket);
    } else {
      console.log(`❌ POST /rest/ticket - Failed to create ticket`);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /rest/ticket/{id}:
 *   put:
 *     summary: Update a ticket
 *     description: Update an existing ticket by ID with auto-generation features
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicketRequest'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/rest/ticket/:id', async (req, res) => {
  try {
    // Generate title from description if no title is provided in update
    let updateData = { ...req.body };
    if (!updateData.issue_title && updateData.issue_description) {
      updateData.issue_title = updateData.issue_description.substring(0, 100);
      if (updateData.issue_description.length > 100) {
        updateData.issue_title += '...';
      }
      console.log(`📝 Auto-generated title from description in update: "${updateData.issue_title}"`);
    }
    
    // Set status to "Open" if no status is provided in update
    if (!updateData.status) {
      updateData.status = 'Open';
      console.log(`📋 Auto-setting status to "Open" in update`);
    }
    
    const success = await databaseService.updateTicket(req.params.id, updateData);
    if (success) {
      const updatedTicket = await databaseService.getTicketById(req.params.id);
      console.log(`✅ PUT /rest/ticket/${req.params.id} - Updated ticket`);
      res.json(updatedTicket);
    } else {
      console.log(`❌ PUT /rest/ticket/${req.params.id} - Ticket not found or update failed`);
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('❌ Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /rest/ticket/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     description: Delete a ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket deleted successfully"
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/rest/ticket/:id', async (req, res) => {
  try {
    const success = await databaseService.deleteTicket(req.params.id);
    if (success) {
      console.log(`✅ DELETE /rest/ticket/${req.params.id} - Deleted ticket`);
      res.json({ message: 'Ticket deleted successfully' });
    } else {
      console.log(`❌ DELETE /rest/ticket/${req.params.id} - Ticket not found`);
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await databaseService.close();
  process.exit(0);
});

const startServer = async () => {
  try {
    // Initialize database
    await databaseService.initDatabase();
    
    // Migrate data from JSON if needed
    await databaseService.migrateFromJson();
    
    // Verify database state
    await databaseService.verifyDatabaseState();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🎯 Mock Express Server is running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/rest`);
      console.log(`📚 Swagger documentation at http://localhost:${PORT}/api-docs`);
      console.log(`🔧 CORS enabled for development`);
      console.log(`💾 SQLite database: ${databaseService.dbPath}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 