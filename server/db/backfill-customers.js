const { pool } = require('../config/database');

async function backfill() {
	console.log('Starting backfill of customers for indebted buyers...');
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// 1) Create customers for buyers who have debts but no customer_id
		const debtBuyers = await client.query(`
			SELECT DISTINCT s.buyer_name
			FROM debts d
			JOIN sales s ON s.id = d.sale_id
			LEFT JOIN customers c ON c.id = s.customer_id
			WHERE (s.customer_id IS NULL) AND (COALESCE(d.amount,0) - COALESCE(d.repaid_amount,0)) > 0 AND s.buyer_name IS NOT NULL AND s.buyer_name <> ''
		`);

		let createdCount = 0;
		for (const row of debtBuyers.rows) {
			const name = row.buyer_name.trim();
			if (!name) continue;
			// Try find existing customer by exact name
			const existing = await client.query('SELECT id FROM customers WHERE LOWER(name) = LOWER($1) LIMIT 1', [name]);
			let customerId;
			if (existing.rows.length > 0) {
				customerId = existing.rows[0].id;
			} else {
				const created = await client.query('INSERT INTO customers (name) VALUES ($1) RETURNING id', [name]);
				customerId = created.rows[0].id;
				createdCount++;
			}
			// Assign this customer to all their sales with debts
			await client.query('UPDATE sales SET customer_id = $1 WHERE buyer_name = $2 AND customer_id IS NULL', [customerId, name]);
		}

		console.log(`Created ${createdCount} customers from indebted buyers.`);

		// 2) Backfill debts.customer_id from sales.customer_id
		await client.query(`
			UPDATE debts d
			SET customer_id = s.customer_id
			FROM sales s
			WHERE d.sale_id = s.id AND d.customer_id IS NULL AND s.customer_id IS NOT NULL
		`);

		// 3) Backfill payment_history.customer_id from debts
		await client.query(`
			UPDATE payment_history p
			SET customer_id = d.customer_id
			FROM debts d
			WHERE p.sale_id = d.sale_id AND p.customer_id IS NULL AND d.customer_id IS NOT NULL
		`);

		await client.query('COMMIT');
		console.log('Backfill completed successfully.');
	} catch (e) {
		await client.query('ROLLBACK');
		console.error('Backfill failed:', e);
		process.exitCode = 1;
	} finally {
		client.release();
		await pool.end();
	}
}

backfill();
