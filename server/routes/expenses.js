const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get all expenses
router.get('/', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                e.id,
                e.amount,
                e.description,
                e.category,
                e.subcategory,
                e.date,
                e.recurring,
                e.created_at,
                e.updated_at,
                e.created_by,
                COALESCE(u.email, 'System') as created_by_user
             FROM expenses e 
             LEFT JOIN users u ON e.created_by = u.id 
             ORDER BY e.date DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get expense by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT 
                e.id,
                e.amount,
                e.description,
                e.category,
                e.subcategory,
                e.date,
                e.recurring,
                e.created_at,
                e.updated_at,
                e.created_by,
                COALESCE(u.email, 'System') as created_by_user
             FROM expenses e 
             LEFT JOIN users u ON e.created_by = u.id 
             WHERE e.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new expense
router.post('/', auth, async (req, res) => {
    try {
        const { amount, description, category, subcategory, date, recurring } = req.body;
        
        // Validation
        if (!amount || !description || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!['internal', 'external'].includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const result = await db.query(
            `INSERT INTO expenses (
                amount, 
                description, 
                category, 
                subcategory,
                date,
                recurring,
                created_by
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                amount, 
                description, 
                category, 
                subcategory || null,
                date ? new Date(date) : new Date(),
                recurring || false,
                req.user.userId
            ]
        );
        
        res.status(201).json(result.rows[0]);

        // Log expense activity in activity_log
        await db.query(
            `INSERT INTO activity_log (activity_type, reference_id, description, amount, status, activity_date, details, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                'expense',
                result.rows[0].id,
                description,
                amount,
                category,
                result.rows[0].created_at,
                JSON.stringify({ subcategory: subcategory || null, recurring: recurring || false }),
                req.user.userId
            ]
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, category, subcategory, date, recurring } = req.body;
        
        // Validation
        if (!amount || !description || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!['internal', 'external'].includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const result = await db.query(
            `UPDATE expenses 
             SET amount = $1, 
                 description = $2, 
                 category = $3, 
                 subcategory = $4,
                 date = $5,
                 recurring = $6,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND created_by = $8
             RETURNING *`,
            [amount, description, category, subcategory || null, date ? new Date(date) : new Date(), recurring || false, id, req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'DELETE FROM expenses WHERE id = $1 AND created_by = $2 RETURNING *',
            [id, req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }
        
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
