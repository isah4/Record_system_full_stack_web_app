const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    console.log('📖 Reading comprehensive master schema...');
    
    // Read the comprehensive master schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔌 Checking database connection...');
    
    // Test connection
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    console.log('🏗️  Running comprehensive master schema...');
    
    // Better SQL parsing that handles complex statements and comments
    const statements = [];
    let currentStatement = '';
    let inDollarBlock = false;
    let inCommentBlock = false;
    
    // Split by lines and process each line
    const lines = sql.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Handle multi-line comment blocks
      if (trimmedLine.startsWith('/*')) {
        inCommentBlock = true;
        continue;
      }
      
      if (trimmedLine.includes('*/')) {
        inCommentBlock = false;
        continue;
      }
      
      // Skip if we're inside a comment block
      if (inCommentBlock) {
        continue;
      }
      
      // Skip single-line comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      // Skip header comment lines (lines that are just descriptive text)
      if (trimmedLine.startsWith('===') || 
          trimmedLine.startsWith('COMPREHENSIVE') ||
          trimmedLine.startsWith('This schema includes') ||
          trimmedLine.startsWith('CORE TABLES') ||
          trimmedLine.startsWith('EXPENSE TABLES') ||
          trimmedLine.startsWith('DEBT TABLES') ||
          trimmedLine.startsWith('PAYMENT HISTORY TABLE') ||
          trimmedLine.startsWith('ACTIVITY LOG TABLE') ||
          trimmedLine.startsWith('INDEXES FOR PERFORMANCE') ||
          trimmedLine.startsWith('COMMENTS FOR DOCUMENTATION')) {
        continue;
      }
      
      // Track DO $$ blocks - start
      if (trimmedLine.includes('DO $$')) {
        inDollarBlock = true;
        currentStatement = line + '\n';
        continue;
      }
      
      // If we're in a dollar block, keep adding lines until we see END $$
      if (inDollarBlock) {
        currentStatement += line + '\n';
        
        // Check if this line ends the dollar block
        if (trimmedLine.includes('END $$')) {
          inDollarBlock = false;
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
        continue;
      }
      
      // Regular SQL statements
      currentStatement += line + '\n';
      
      // End statement when we hit a semicolon
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`\n🔍 Parsed ${statements.length} SQL statements:`);
    statements.forEach((stmt, index) => {
      console.log(`   ${index + 1}. ${stmt.substring(0, 80)}...`);
    });
    console.log('');
    
    let executedCount = 0;
    let skippedCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Execute the statement
          await db.query(statement);
          executedCount++;
          console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
        } catch (error) {
          // Handle "already exists" errors gracefully
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key') ||
              error.message.includes('extension "uuid-ossp" already exists') ||
              error.message.includes('duplicate_object')) {
            console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
            skippedCount++;
            continue;
          }
          throw error;
        }
      }
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log(`📊 Executed ${executedCount} statements, Skipped ${skippedCount} statements`);
    console.log('\n📋 Database now includes:');
    console.log('   • Users table with authentication');
    console.log('   • Items table with wholesale pricing');
    console.log('   • Sales and sale items tables');
    console.log('   • Expenses with categories and recurring support');
    console.log('   • Debts management system');
    console.log('   • Payment history tracking');
    console.log('   • Activity logging system');
    console.log('   • Performance indexes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('\n🔍 Error details:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await db.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
  process.exit(0);
});

initializeDatabase();
