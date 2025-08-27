const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

function sanitizeCustomerInput(body) {
	const { name, phone, email, address, note } = body;
	return { name, phone, email, address, note };
}

// List/search customers
router.get('/', auth, async (req, res) => {
	try {
		const { q } = req.query;
		let sql = 'SELECT * FROM customers WHERE is_deleted = FALSE';
		const params = [];
		if (q) {
			params.push(`%${q}%`);
			sql += ` AND (LOWER(name) LIKE LOWER($${params.length}) OR LOWER(phone) LIKE LOWER($${params.length}))`;
		}
		sql += ' ORDER BY created_at DESC LIMIT 200';
		const result = await pool.query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error('List customers error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get by id
router.get('/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query('SELECT * FROM customers WHERE id = $1 AND is_deleted = FALSE', [id]);
		if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
		res.json(result.rows[0]);
	} catch (error) {
		console.error('Get customer error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Create
router.post('/', auth, async (req, res) => {
	try {
		const input = sanitizeCustomerInput(req.body);
		if (!input.name) return res.status(400).json({ error: 'Name is required' });
		const result = await pool.query(
			`INSERT INTO customers (name, phone, email, address, note)
			 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
			[input.name, input.phone || null, input.email || null, input.address || null, input.note || null]
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		if (error.code === '23505') {
			return res.status(409).json({ error: 'Phone already exists' });
		}
		console.error('Create customer error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Update
router.put('/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		const input = sanitizeCustomerInput(req.body);
		if (!input.name) return res.status(400).json({ error: 'Name is required' });
		const result = await pool.query(
			`UPDATE customers SET name = $1, phone = $2, email = $3, address = $4, note = $5, updated_at = NOW()
			 WHERE id = $6 RETURNING *`,
			[input.name, input.phone || null, input.email || null, input.address || null, input.note || null, id]
		);
		if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
		res.json(result.rows[0]);
	} catch (error) {
		if (error.code === '23505') {
			return res.status(409).json({ error: 'Phone already exists' });
		}
		console.error('Update customer error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Soft delete
router.delete('/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		// Prevent delete if has outstanding debts
		const outstanding = await pool.query(
			`SELECT COALESCE(SUM(amount - repaid_amount), 0) AS balance
			 FROM debts WHERE customer_id = $1`,
			[id]
		);
		if (Number(outstanding.rows[0].balance) > 0) {
			return res.status(400).json({ error: 'Cannot delete customer with outstanding debt' });
		}
		await pool.query('UPDATE customers SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1', [id]);
		res.json({ message: 'Customer deleted' });
	} catch (error) {
		console.error('Delete customer error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;
