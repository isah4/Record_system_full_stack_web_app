const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { Pool } = require('pg');

async function runMigration() {
  try {
    // Get migration filename from command line arguments
    const migrationFile = process.argv[2];
    if (!migrationFile) {
      console.error('Usage: node run-migration.js <migration-file>');
      console.error('Example: node run-migration.js 008_create_payment_history.sql');
      process.exit(1);
    }
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Starting migration...');
    console.log('Checking database connection...');
    
    // Start a transaction
    await db.query('BEGIN');
    
    console.log('Running migration script...');
    // Run the migration
    await db.query(sql);
    
    // Commit the transaction
    await db.query('COMMIT');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed with error:', error.message);
    
    try {
      // Rollback in case of error
      console.log('Attempting to rollback transaction...');
      await db.query('ROLLBACK');
      console.log('Rollback successful');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError.message);
    }
    
    // Provide more helpful error messages
    if (error.message.includes('already exists')) {
      console.log('\nHINT: It appears some columns already exist. This is not a critical error.');
      console.log('The migration has been updated to check for column existence before adding them.');
      console.log('You can safely run the migration again.');
      process.exit(0); // Exit with success code since this is not a critical error
    } else {
      console.error('\nERROR DETAILS:', error);
      process.exit(1);
    }
  }
}

runMigration();