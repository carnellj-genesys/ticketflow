import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-apikey', 'CORS-API-Key', 'Authorization']
}));

app.use(express.json());

// Load data from db.json
let tickets = [];

const loadData = async () => {
  try {
    const data = await fs.readFile(join(__dirname, 'db.json'), 'utf8');
    const jsonData = JSON.parse(data);
    tickets = jsonData.ticket || [];
    console.log(`📊 Loaded ${tickets.length} tickets from database`);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    tickets = [];
  }
};

const saveData = async () => {
  try {
    const data = { ticket: tickets };
    await fs.writeFile(join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
    console.log('💾 Data saved successfully');
  } catch (error) {
    console.error('❌ Error saving data:', error);
  }
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`🚀 Mock Server Request: ${req.method} ${req.path}`);
  console.log('📤 Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📤 Request Body:', req.body);
  }
  next();
});

// Routes
app.get('/rest/ticket', (req, res) => {
  console.log(`✅ GET /rest/ticket - Returning ${tickets.length} tickets`);
  res.json(tickets);
});

app.get('/rest/ticket/:id', (req, res) => {
  const ticket = tickets.find(t => t._id === req.params.id);
  if (ticket) {
    console.log(`✅ GET /rest/ticket/${req.params.id} - Found ticket`);
    res.json(ticket);
  } else {
    console.log(`❌ GET /rest/ticket/${req.params.id} - Ticket not found`);
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.post('/rest/ticket', (req, res) => {
  const newTicket = {
    _id: Date.now().toString(),
    ...req.body,
    created: new Date().toISOString(),
    changed: new Date().toISOString()
  };
  
  tickets.push(newTicket);
  saveData();
  
  console.log(`✅ POST /rest/ticket - Created ticket ${newTicket._id}`);
  res.status(201).json(newTicket);
});

app.put('/rest/ticket/:id', (req, res) => {
  const index = tickets.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    tickets[index] = {
      ...tickets[index],
      ...req.body,
      changed: new Date().toISOString()
    };
    saveData();
    
    console.log(`✅ PUT /rest/ticket/${req.params.id} - Updated ticket`);
    res.json(tickets[index]);
  } else {
    console.log(`❌ PUT /rest/ticket/${req.params.id} - Ticket not found`);
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.delete('/rest/ticket/:id', (req, res) => {
  const index = tickets.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    const deletedTicket = tickets.splice(index, 1)[0];
    saveData();
    
    console.log(`✅ DELETE /rest/ticket/${req.params.id} - Deleted ticket`);
    res.status(204).send();
  } else {
    console.log(`❌ DELETE /rest/ticket/${req.params.id} - Ticket not found`);
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Health check
app.get('/echo', (req, res) => {
  res.json(req.query);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Mock Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const startServer = async () => {
  await loadData();
  
  app.listen(PORT, () => {
    console.log(`🎯 Mock Express Server is running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/rest`);
    console.log(`🔧 CORS enabled for development`);
  });
};

startServer().catch(console.error); 