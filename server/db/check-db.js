const db = require('../config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tables = await db.query(tablesQuery);
    console.log('\n📋 Existing tables:');
    if (tables.rows.length === 0) {
      console.log('   No tables found');
    } else {
      tables.rows.forEach(row => {
        console.log(`   • ${row.table_name}`);
      });
    }
    
    // Check if extensions exist
    const extensionsQuery = `
      SELECT extname 
      FROM pg_extension;
    `;
    
    const extensions = await db.query(extensionsQuery);
    console.log('\n🔌 Existing extensions:');
    if (extensions.rows.length === 0) {
      console.log('   No extensions found');
    } else {
      extensions.rows.forEach(row => {
        console.log(`   • ${row.extname}`);
      });
    }
    
    // Check if indexes exist
    const indexesQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `;
    
    const indexes = await db.query(indexesQuery);
    console.log('\n📊 Existing indexes:');
    if (indexes.rows.length === 0) {
      console.log('   No indexes found');
    } else {
      indexes.rows.forEach(row => {
        console.log(`   • ${row.indexname}`);
      });
    }
    
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkDatabase();
