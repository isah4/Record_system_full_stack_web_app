# Record Management System
## Overview
- Purpose: A mobile-first web app for small businesses to track sales, inventory, debts, expenses, and generate profit/loss reports.
- Target Audience: Small business owners with minimal tech experience.
## Core Features
1. **Sales Recording**:
   - Record buyer name, select items from catalog, input quantities, compute totals.
   - Payment status: Fully paid, partially paid (track balance), full debt.
2. **Expense Tracking**:
   - Categories: Internal (e.g., cleaning), External (e.g., transport).
   - Fields: Amount, description, date.
3. **Debt Management**:
   - View outstanding debts, record repayments, update balances.
4. **Reports**:
   - Summaries by day, week, month (sales, expenses, profit/loss).
   - Recent activity log.
5. **Inventory Monitoring**:
   - Track stock levels, auto-decrement on sale, low-stock alerts.
6. **Authentication**:
   - JWT-based login, secure data access.
## Design
- Mobile-first, responsive UI with Tailwind CSS.
- Simple, intuitive navigation (data entry vs. reporting tabs).
## Tech Stack
- Frontend: React, Tailwind CSS
- Backend: Express.js, PostgreSQL
- Authentication: JWT, bcrypt
- Deployment: Vercel (frontend), Render (backend)
## Acceptance Criteria
- Sales: Users can record sales with accurate totals and payment status.
- Expenses: Internal/external expenses are logged and categorized.
- Debts: Balances update automatically on repayment.
- Reports: Accurate daily/weekly/monthly summaries.
- Inventory: Stock decrements on sale; alerts for low stock (<5 units).
- Auth: Secure login/logout, protected routes.