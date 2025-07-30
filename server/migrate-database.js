import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateDatabase() {
  const dbPath = join(__dirname, 'tickets.db');
  console.log('🔄 Starting database migration from _id to ticket_number...');
  console.log('📁 Database path:', dbPath);

  try {
    // Open the existing database
    const db = new Database(dbPath);
    
    // Check if the old schema exists
    const tableInfo = db.prepare("PRAGMA table_info(tickets)").all();
    console.log('📋 Current table schema:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.pk ? '(PRIMARY KEY)' : ''}`);
    });

    // Check if we need to migrate
    const hasOldSchema = tableInfo.some(col => col.name === '_id');
    const hasNewSchema = tableInfo.some(col => col.name === 'ticket_number');

    if (hasNewSchema) {
      console.log('✅ Database already has ticket_number field, no migration needed');
      db.close();
      return;
    }

    if (!hasOldSchema) {
      console.log('❌ Database has neither _id nor ticket_number field');
      db.close();
      return;
    }

    console.log('🔄 Migrating database schema...');

    // Get all existing data
    const existingTickets = db.prepare('SELECT * FROM tickets').all();
    console.log(`📊 Found ${existingTickets.length} tickets to migrate`);

    // Create new table with correct schema
    db.exec(`
      CREATE TABLE tickets_new (
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
      )
    `);

    // Insert data with _id renamed to ticket_number
    const insertStmt = db.prepare(`
      INSERT INTO tickets_new (ticket_number, issue_title, issue_description, status, priority, email, phone_number, notes, created, changed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let migratedCount = 0;
    for (const ticket of existingTickets) {
      try {
        insertStmt.run(
          ticket._id, // Use the old _id as the new ticket_number
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
        migratedCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate ticket ${ticket._id}:`, error.message);
      }
    }

    // Drop old table and rename new table
    db.exec('DROP TABLE tickets');
    db.exec('ALTER TABLE tickets_new RENAME TO tickets');

    console.log(`✅ Successfully migrated ${migratedCount} tickets`);
    console.log('📊 Final ticket count:', db.prepare('SELECT COUNT(*) as count FROM tickets').get().count);

    // Verify the new schema
    const newTableInfo = db.prepare("PRAGMA table_info(tickets)").all();
    console.log('📋 New table schema:');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.pk ? '(PRIMARY KEY)' : ''}`);
    });

    // Show sample data
    const sampleTickets = db.prepare('SELECT * FROM tickets LIMIT 3').all();
    console.log('📋 Sample migrated tickets:');
    sampleTickets.forEach(ticket => {
      console.log(`  - Ticket Number: ${ticket.ticket_number}`);
      console.log(`    Title: ${ticket.issue_title}`);
      console.log(`    Status: ${ticket.status}`);
      console.log(`    Priority: ${ticket.priority}`);
      console.log('');
    });

    db.close();
    console.log('✅ Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during database migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateDatabase(); 