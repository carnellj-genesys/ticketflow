import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

class DatabaseService {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.dbPath = join(__dirname, 'tickets.db');
    this.db = null;
  }

  initDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err);
          reject(err);
          return;
        }

        console.log('📊 SQLite database initialized');

        // Create table if it doesn't exist
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS tickets (
            _id TEXT PRIMARY KEY,
            issue_title TEXT NOT NULL,
            issue_description TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            email TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            notes TEXT DEFAULT '',
            created TEXT NOT NULL,
            changed TEXT NOT NULL
          )
        `;

        this.db.run(createTableSQL, (err) => {
          if (err) {
            console.error('❌ Error creating table:', err);
            reject(err);
          } else {
            console.log('✅ Database table ready');
            resolve();
          }
        });
      });
    });
  }

  getAllTickets() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM tickets ORDER BY created DESC';
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('❌ Error getting tickets:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  getTicketById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM tickets WHERE _id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          console.error('❌ Error getting ticket:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  createTicket(ticket) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO tickets (_id, issue_title, issue_description, status, priority, email, phone_number, notes, created, changed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
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
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Error creating ticket:', err);
          reject(err);
        } else {
          console.log(`✅ Created ticket with ID: ${ticket._id}`);
          resolve(true);
        }
      });
    });
  }

  updateTicket(id, ticketData) {
    return new Promise((resolve, reject) => {
      // Build dynamic update query
      const fields = [];
      const values = [];
      
      Object.keys(ticketData).forEach(key => {
        if (key !== '_id') {
          fields.push(`${key} = ?`);
          values.push(ticketData[key]);
        }
      });
      
      values.push(new Date().toISOString()); // changed timestamp
      values.push(id); // WHERE clause parameter
      
      const sql = `
        UPDATE tickets 
        SET ${fields.join(', ')}, changed = ?
        WHERE _id = ?
      `;

      this.db.run(sql, values, function(err) {
        if (err) {
          console.error('❌ Error updating ticket:', err);
          reject(err);
        } else if (this.changes === 0) {
          console.log(`❌ No ticket found with ID: ${id}`);
          resolve(false);
        } else {
          console.log(`✅ Updated ticket with ID: ${id}`);
          resolve(true);
        }
      });
    });
  }

  deleteTicket(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM tickets WHERE _id = ?';
      this.db.run(sql, [id], function(err) {
        if (err) {
          console.error('❌ Error deleting ticket:', err);
          reject(err);
        } else if (this.changes === 0) {
          console.log(`❌ No ticket found with ID: ${id}`);
          resolve(false);
        } else {
          console.log(`✅ Deleted ticket with ID: ${id}`);
          resolve(true);
        }
      });
    });
  }

  async migrateFromJson() {
    try {
      const fs = await import('fs/promises');
      const jsonPath = join(dirname(fileURLToPath(import.meta.url)), 'db.json');
      
      // Check if JSON file exists
      try {
        await fs.access(jsonPath);
      } catch (error) {
        console.log('📊 No db.json file found, skipping migration');
        return;
      }

      // Read JSON data
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      const tickets = JSON.parse(jsonData).tickets || [];

      if (tickets.length === 0) {
        console.log('📊 No tickets found in db.json');
        return;
      }

      // Check if SQLite already has data
      const existingTickets = await this.getAllTickets();
      if (existingTickets.length > 0) {
        console.log(`📊 SQLite database already contains ${existingTickets.length} tickets`);
        console.log('📊 Skipping migration to avoid duplicate data');
        return;
      }

      console.log(`📊 Starting migration of ${tickets.length} tickets from JSON to SQLite...`);

      // Insert tickets one by one
      let migratedCount = 0;
      for (const ticket of tickets) {
        try {
          await this.createTicket(ticket);
          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrating ticket ${ticket._id}:`, error);
        }
      }

      const finalCount = (await this.getAllTickets()).length;
      console.log(`✅ Successfully migrated ${migratedCount} tickets to SQLite`);
      console.log(`📊 Final ticket count in SQLite: ${finalCount}`);

      // Create backup of original JSON
      const backupPath = jsonPath + '.backup';
      await fs.copyFile(jsonPath, backupPath);
      console.log(`📁 Created backup of db.json as db.json.backup`);

      // Log sample migrated tickets
      const sampleTickets = (await this.getAllTickets()).slice(0, 3);
      console.log('📋 Sample migrated tickets:');
      sampleTickets.forEach(ticket => {
        console.log(`  - ID: ${ticket._id}`);
        console.log(`    Title: ${ticket.issue_title}`);
        console.log(`    Status: ${ticket.status}`);
        console.log(`    Priority: ${ticket.priority}`);
        console.log(`    Notes: "${ticket.notes}"`);
        console.log(`    Created: ${ticket.created}`);
        console.log('');
      });

    } catch (error) {
      console.error('❌ Error during migration:', error);
    }
  }

  async verifyDatabaseState() {
    try {
      console.log('🔍 Verifying database state...');
      const tickets = await this.getAllTickets();
      console.log(`📊 Database verification: ${tickets.length} tickets found`);

      if (tickets.length > 0) {
        console.log('📋 Database schema verification:');
        const sampleTicket = tickets[0];
        const requiredFields = ['_id', 'issue_title', 'issue_description', 'status', 'priority', 'email', 'phone_number', 'notes', 'created', 'changed'];
        
        requiredFields.forEach(field => {
          if (sampleTicket.hasOwnProperty(field)) {
            console.log(`  ✅ ${field}: Present`);
          } else {
            console.log(`  ❌ ${field}: Missing`);
          }
        });

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
      }
    } catch (error) {
      console.error('❌ Error verifying database state:', error);
    }
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err);
          } else {
            console.log('🔒 Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export const databaseService = new DatabaseService(); 