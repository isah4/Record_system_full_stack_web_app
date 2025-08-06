# Record Management System - Backend

## Authentication System Setup

This Express.js server provides JWT-based authentication with PostgreSQL database integration.

### Features
- ✅ User registration with email/password
- ✅ Secure password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ Protected routes middleware
- ✅ PostgreSQL database integration
- ✅ CORS enabled for frontend communication

### Setup Instructions

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Database Setup
1. Install PostgreSQL on your system
2. Create a database named `record_system`
3. Run the schema file:
```bash
psql -d record_system -f db/schema.sql
```

#### 3. Environment Configuration
1. Copy the environment example file:
```bash
cp env.example .env
```

2. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/record_system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

#### 4. Start the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

#### Health Check
- `GET /api/health` - Server health check

### Request Examples

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 24-hour expiration
- Input validation and sanitization
- CORS configuration for frontend integration
- Error handling and logging

### Database Schema
The system uses the following tables:
- `users` - User accounts and authentication
- `items` - Product catalog
- `sales` - Sales records
- `expenses` - Expense tracking
- `debts` - Debt management

### Next Steps
1. Implement business logic endpoints (sales, expenses, etc.)
2. Add input validation middleware
3. Implement rate limiting
4. Add comprehensive error handling
5. Set up testing framework 