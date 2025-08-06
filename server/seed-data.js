const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const sampleItems = [
  { name: 'Laptop', price: 999.99, stock: 10 },
  { name: 'Mouse', price: 25.50, stock: 50 },
  { name: 'Keyboard', price: 75.00, stock: 30 },
  { name: 'Monitor', price: 299.99, stock: 15 },
  { name: 'USB Cable', price: 5.99, stock: 100 },
  { name: 'Headphones', price: 89.99, stock: 25 },
  { name: 'Webcam', price: 45.00, stock: 20 },
  { name: 'Printer', price: 199.99, stock: 8 }
];

async function seedData() {
  try {
    console.log('Starting to seed sample data...');
    
    // Clear existing items
    await pool.query('DELETE FROM items');
    console.log('Cleared existing items');
    
    // Insert sample items
    for (const item of sampleItems) {
      await pool.query(
        'INSERT INTO items (name, price, stock) VALUES ($1, $2, $3)',
        [item.name, item.price, item.stock]
      );
      console.log(`Added item: ${item.name}`);
    }
    
    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 