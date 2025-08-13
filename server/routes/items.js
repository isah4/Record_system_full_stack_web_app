const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const { pool } = require('../config/database');

// Get all items
router.get('/', auth, async (req, res) => {
  try {
    const items = await pool.query('SELECT * FROM items ORDER BY name');
    res.json(items.rows);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new item
router.post('/', auth, async (req, res) => {
  try {
    const { name, price, stock, wholesale_price } = req.body;

    // Validate input
    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock are required' });
    }

    if (price <= 0 || stock < 0) {
      return res.status(400).json({ error: 'Price must be positive and stock must be non-negative' });
    }

    if (wholesale_price !== undefined && wholesale_price < 0) {
      return res.status(400).json({ error: 'Wholesale price must be non-negative' });
    }

    const wholesalePrice = wholesale_price || 0;

    const newItem = await pool.query(`
      INSERT INTO items (name, price, stock, wholesale_price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, price, stock, wholesalePrice]);

    res.status(201).json(newItem.rows[0]);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update item
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, wholesale_price } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock are required' });
    }

    if (wholesale_price !== undefined && wholesale_price < 0) {
      return res.status(400).json({ error: 'Wholesale price must be non-negative' });
    }

    const wholesalePrice = wholesale_price !== undefined ? wholesale_price : 0;

    const updatedItem = await pool.query(`
      UPDATE items 
      SET name = $1, price = $2, stock = $3, wholesale_price = $4
      WHERE id = $5
      RETURNING *
    `, [name, price, stock, wholesalePrice, id]);

    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(updatedItem.rows[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await pool.query(`
      DELETE FROM items 
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get low stock items (less than 5 units)
router.get('/low-stock', auth, async (req, res) => {
  try {
    const lowStockItems = await pool.query(`
      SELECT * FROM items 
      WHERE stock < 5 
      ORDER BY stock ASC
    `);
    res.json(lowStockItems.rows);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 