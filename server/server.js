import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { databaseService } from './database.js';
import { logger } from './logger.js';

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
      description: 'A RESTful API for managing support tickets with SQLite persistence',
      contact: {
        name: 'TicketFlow Support',
        email: 'support@ticketflow.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server (localhost)'
      },
      {
        url: `https://xper.loca.lt`,
        description: 'Development server (tunnel)'
      }
    ],
    components: {
      schemas: {
        Ticket: {
          type: 'object',
          required: ['_id', 'issue_description', 'priority', 'email', 'phone_number', 'created', 'changed'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the ticket'
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
              description: 'ISO date string when ticket was created'
            },
            changed: {
              type: 'string',
              format: 'date-time',
              description: 'ISO date string when ticket was last modified'
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
  apis: ['./server/server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow tunnel domains (like loca.lt, ngrok.io, etc.)
    if (origin.includes('loca.lt') || origin.includes('ngrok.io') || origin.includes('tunnel')) {
      return callback(null, true);
    }
    
    // Allow all origins in development (you can restrict this in production)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-apikey', 'CORS-API-Key', 'Authorization']
}));

app.use(express.json());

// Add logging middleware
app.use(logger.requestLogger());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
/**
 * @swagger
 * /rest/ticket:
 *   get:
 *     summary: Get all tickets
 *     description: Retrieve all tickets from the database
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: List of all tickets
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
app.get('/rest/ticket', (req, res) => {
  try {
    const tickets = databaseService.getAllTickets();
    logger.info(`✅ GET /rest/ticket - Returning ${tickets.length} tickets`);
    res.json(tickets);
  } catch (error) {
    logger.logError(error, { endpoint: '/rest/ticket', method: 'GET' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /rest/ticket/{id}:
 *   get:
 *     summary: Get ticket by ID
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
app.get('/rest/ticket/:id', (req, res) => {
  try {
    const ticket = databaseService.getTicketById(req.params.id);
    if (ticket) {
      logger.info(`✅ GET /rest/ticket/${req.params.id} - Found ticket`);
      res.json(ticket);
    } else {
      logger.warn(`❌ GET /rest/ticket/${req.params.id} - Ticket not found`);
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    logger.logError(error, { endpoint: `/rest/ticket/${req.params.id}`, method: 'GET' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /rest/ticket:
 *   post:
 *     summary: Create a new ticket
 *     description: Create a new support ticket
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/rest/ticket', (req, res) => {
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
      _id: Date.now().toString(),
      ...req.body,
      issue_title: issueTitle,
      status: status,
      created: new Date().toISOString(),
      changed: new Date().toISOString()
    };
    
    const success = databaseService.createTicket(newTicket);
    if (success) {
      console.log(`✅ POST /rest/ticket - Created ticket ${newTicket._id}`);
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
 *     description: Update an existing ticket by ID
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
app.put('/rest/ticket/:id', (req, res) => {
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
    
    const success = databaseService.updateTicket(req.params.id, updateData);
    if (success) {
      const updatedTicket = databaseService.getTicketById(req.params.id);
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
 *       204:
 *         description: Ticket deleted successfully
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
app.delete('/rest/ticket/:id', (req, res) => {
  try {
    const success = databaseService.deleteTicket(req.params.id);
    if (success) {
      console.log(`✅ DELETE /rest/ticket/${req.params.id} - Deleted ticket`);
      res.status(204).send();
    } else {
      console.log(`❌ DELETE /rest/ticket/${req.params.id} - Ticket not found`);
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /echo:
 *   get:
 *     summary: Health check endpoint
 *     description: Simple health check that echoes back query parameters
 *     tags: [Health]
 *     parameters:
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Optional message to echo back
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
app.get('/echo', (req, res) => {
  res.json(req.query);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Mock Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  databaseService.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  databaseService.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Log configuration
    logger.logConfiguration();
    
    // Migrate data from JSON to SQLite on startup
    await databaseService.migrateFromJson();
    
    // Verify database state after migration
    logger.info('\n🔍 Verifying database state...');
    databaseService.verifyDatabaseState();
    
    app.listen(PORT, () => {
      logger.info(`\n🎯 Mock Express Server is running on http://localhost:${PORT}`);
      logger.info(`📊 API endpoints available at http://localhost:${PORT}/rest`);
      logger.info(`📚 Swagger documentation at http://localhost:${PORT}/api-docs`);
      logger.info(`🔧 CORS enabled for development`);
      logger.info(`💾 SQLite database: ${join(__dirname, 'tickets.db')}`);
    });
  } catch (error) {
    logger.logError(error, { context: 'Server startup' });
    process.exit(1);
  }
};

startServer().catch(console.error); 