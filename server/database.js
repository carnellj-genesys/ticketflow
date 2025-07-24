import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseService {
  constructor() {
    this.db = new Database(join(__dirname, 'tickets.db'));
    this.initDatabase();
  }

  initDatabase() {
    // Create tickets table if it doesn't exist
    const createTable = `
      CREATE TABLE IF NOT EXISTS tickets (
        _id TEXT PRIMARY KEY,
        issue_title TEXT NOT NULL,
        issue_description TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Open', 'In-progress', 'Closed')),
        priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
        email TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        notes TEXT DEFAULT '',
        created TEXT NOT NULL,
        changed TEXT NOT NULL
      )
    `;
    
    this.db.exec(createTable);
    console.log('📊 SQLite database initialized');
  }

  getAllTickets() {
    const stmt = this.db.prepare('SELECT * FROM tickets ORDER BY created DESC');
    return stmt.all();
  }

  getTicketById(id) {
    const stmt = this.db.prepare('SELECT * FROM tickets WHERE _id = ?');
    return stmt.get(id);
  }

  createTicket(ticket) {
    const stmt = this.db.prepare(`
      INSERT INTO tickets (_id, issue_title, issue_description, status, priority, email, phone_number, notes, created, changed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      ticket._id,
      ticket.issue_title,
      ticket.issue_description,
      ticket.status,
      ticket.priority,
      ticket.email,
      ticket.phone_number,
      ticket.notes || '',
      ticket.created,
      ticket.changed
    );
    
    return result.changes > 0;
  }

  updateTicket(id, ticketData) {
    const fields = [];
    const values = [];
    
    // Build dynamic update query based on provided fields
    Object.keys(ticketData).forEach(key => {
      if (key !== '_id' && key !== 'created') { // Don't allow updating ID or created date
        fields.push(`${key} = ?`);
        values.push(ticketData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    // Add changed timestamp
    fields.push('changed = ?');
    values.push(new Date().toISOString());
    
    // Add ID for WHERE clause
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE tickets SET ${fields.join(', ')} WHERE _id = ?`);
    const result = stmt.run(...values);
    
    return result.changes > 0;
  }

  deleteTicket(id) {
    const stmt = this.db.prepare('DELETE FROM tickets WHERE _id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  verifyDatabaseState() {
    const tickets = this.getAllTickets();
    console.log(`📊 Database verification: ${tickets.length} tickets found`);
    
    if (tickets.length === 0) {
      console.log('⚠️  Warning: No tickets found in database');
      return false;
    }
    
    // Check for required fields
    const requiredFields = ['_id', 'issue_title', 'issue_description', 'status', 'priority', 'email', 'phone_number', 'notes', 'created', 'changed'];
    const sampleTicket = tickets[0];
    
    console.log('📋 Database schema verification:');
    requiredFields.forEach(field => {
      const hasField = field in sampleTicket;
      const status = hasField ? '✅' : '❌';
      console.log(`  ${status} ${field}: ${hasField ? 'Present' : 'Missing'}`);
    });
    
    // Show sample data
    console.log('📋 Sample tickets in database:');
    tickets.slice(0, 3).forEach(ticket => {
      console.log(`  - ID: ${ticket._id}`);
      console.log(`    Title: ${ticket.issue_title}`);
      console.log(`    Status: ${ticket.status}`);
      console.log(`    Priority: ${ticket.priority}`);
      console.log(`    Notes: "${ticket.notes}"`);
      console.log(`    Created: ${ticket.created}`);
      console.log('');
    });
    
    return true;
  }

  async migrateFromJson() {
    try {
      const fs = await import('fs/promises');
      const jsonPath = join(__dirname, 'db.json');
      
      // Check if JSON file exists
      try {
        await fs.access(jsonPath);
      } catch {
        console.log('📊 No existing db.json file found, skipping migration');
        return;
      }
      
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(jsonData);
      const tickets = data.ticket || [];
      
      if (tickets.length === 0) {
        console.log('📊 No tickets to migrate from JSON');
        return;
      }
      
      console.log(`📊 Starting migration of ${tickets.length} tickets from JSON to SQLite...`);
      
      // Check if we already have data in SQLite
      const existingTickets = this.getAllTickets();
      if (existingTickets.length > 0) {
        console.log(`📊 SQLite database already contains ${existingTickets.length} tickets`);
        console.log('📊 Skipping migration to avoid duplicate data');
        return;
      }
      
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO tickets (_id, issue_title, issue_description, status, priority, email, phone_number, notes, created, changed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let migratedCount = 0;
      const insertMany = this.db.transaction((tickets) => {
        for (const ticket of tickets) {
          try {
            const result = insertStmt.run(
              ticket._id,
              ticket.issue_title,
              ticket.issue_description,
              ticket.status,
              ticket.priority,
              ticket.email,
              ticket.phone_number,
              ticket.notes || '',
              ticket.created,
              ticket.changed
            );
            if (result.changes > 0) {
              migratedCount++;
            }
          } catch (error) {
            console.error(`❌ Failed to migrate ticket ${ticket._id}:`, error.message);
          }
        }
      });
      
      insertMany(tickets);
      console.log(`✅ Successfully migrated ${migratedCount} tickets to SQLite`);
      
      // Verify migration
      const finalCount = this.getAllTickets().length;
      console.log(`📊 Final ticket count in SQLite: ${finalCount}`);
      
      if (migratedCount !== tickets.length) {
        console.warn(`⚠️  Warning: Expected ${tickets.length} tickets, but migrated ${migratedCount}`);
      }
      
      // Backup the old JSON file
      const backupPath = join(__dirname, 'db.json.backup');
      await fs.copyFile(jsonPath, backupPath);
      console.log('📁 Created backup of db.json as db.json.backup');
      
      // Log some sample data for verification
      const sampleTickets = this.getAllTickets().slice(0, 3);
      console.log('📋 Sample migrated tickets:');
      sampleTickets.forEach(ticket => {
        console.log(`  - ID: ${ticket._id}, Title: ${ticket.issue_title}, Notes: "${ticket.notes}"`);
      });
      
    } catch (error) {
      console.error('❌ Error during migration:', error);
    }
  }

  close() {
    this.db.close();
  }
}

export const databaseService = new DatabaseService(); 