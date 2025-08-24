# Record Management System

A comprehensive business management system built with Next.js, Express.js, and PostgreSQL, designed to handle inventory, sales, expenses, debts, and financial reporting.

## 🚀 Features

### Core Functionality
- **Inventory Management**: Track items with wholesale and retail pricing
- **Sales Tracking**: Record sales transactions and generate receipts
- **Expense Management**: Categorize and track business expenses
- **Debt Management**: Monitor outstanding debts and payments
- **Financial Reporting**: Comprehensive analytics and reporting
- **User Authentication**: Secure JWT-based authentication system
- **Activity Logging**: Complete audit trail of all system activities

### Technical Features
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with dedicated mobile components
- **Real-time Updates**: Live data synchronization across components
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Form Validation**: Robust form handling with React Hook Form and Zod
- **Theme Support**: Dark/light mode with next-themes

## 🏗️ Architecture

```
record-sys/
├── client/                 # Next.js 15 Frontend Application
│   ├── app/               # App Router pages and components
│   ├── components/        # Reusable UI components
│   ├── config/           # Configuration files
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries and API clients
│   └── styles/           # Global styles and Tailwind config
├── server/                # Express.js Backend API
│   ├── config/           # Server configuration
│   ├── db/               # Database schema and migrations
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route handlers
│   └── utils/            # Utility functions
└── docs/                  # Project documentation
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **State Management**: React Context + Custom Hooks

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + bcrypt
- **Validation**: Built-in validation
- **CORS**: Configurable CORS support

### Database
- **Primary**: PostgreSQL
- **Hosting**: Neon (Serverless)
- **Features**: 
  - UUID primary keys
  - Foreign key constraints
  - Performance indexes
  - Activity logging
  - Payment history tracking

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **pnpm**: Package manager
- **PostgreSQL**: Database (local or cloud)
- **Git**: Version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd record-sys
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server Environment
Create `server/.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-here

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CLIENT_URL=https://your-client-domain.com
```

#### Client Environment
Create `client/.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-server-domain.com/api
NEXT_PUBLIC_BASE_URL=https://your-server-domain.com

# Client Configuration
NEXT_PUBLIC_CLIENT_URL=https://your-client-domain.com

# Environment
NODE_ENV=production
```

### 4. Database Setup

```bash
cd server

# Test database connection
npm run test-connection

# Initialize database schema
npm run init-db
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend client
cd client
npm run dev
```

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and profiles
- **items**: Inventory items with pricing
- **sales**: Sales transactions
- **sale_items**: Individual items in sales
- **expenses**: Business expenses with categories
- **debts**: Outstanding debts and obligations
- **payment_history**: Debt payment tracking
- **activity_log**: System activity audit trail

### Key Features
- **UUID Primary Keys**: Secure identifier generation
- **Foreign Key Constraints**: Data integrity enforcement
- **Performance Indexes**: Optimized query performance
- **Audit Logging**: Complete activity tracking
- **Soft Deletes**: Data preservation capabilities

## 🔧 Available Scripts

### Server Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run test-connection  # Test database connection
npm run init-db      # Initialize database schema
npm run migrate      # Run database migrations
npm run check-db     # Check database status
npm run clear-port   # Clear port conflicts
npm run safe-start   # Clear port and start server
```

### Client Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Inventory
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id` - Update sale

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Debts
- `GET /api/debts` - List all debts
- `POST /api/debts` - Create new debt
- `PUT /api/debts/:id` - Update debt
- `POST /api/debts/:id/pay` - Record debt payment

### Reports & Analytics
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/expenses` - Expense analytics
- `GET /api/analytics/inventory` - Inventory analytics
- `GET /api/analytics/debts` - Debt analytics

## 📱 Mobile-First Design

The system includes dedicated mobile components:
- **Mobile Navigation**: Touch-friendly navigation
- **Mobile Stats Grid**: Optimized mobile dashboard
- **Mobile Recent Activity**: Mobile-optimized activity feed
- **Responsive Forms**: Mobile-friendly input forms

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **CORS Protection**: Configurable cross-origin restrictions
- **Input Validation**: Server-side data validation
- **SQL Injection Protection**: Parameterized queries
- **Environment Variable Protection**: Secure configuration management

## 🚀 Deployment

### Production Environment Variables

#### Server
```env
DATABASE_URL=your-production-neon-url
JWT_SECRET=your-production-jwt-secret
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-production-domain.com
```

#### Client
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_CLIENT_URL=https://your-production-domain.com
NODE_ENV=production
```

### Deployment Steps
1. Set production environment variables
2. Build the client: `npm run build`
3. Start the server: `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates
6. Configure domain DNS

## 🧪 Testing

### Database Connection Test
```bash
cd server
npm run test-connection
```

### Database Initialization Test
```bash
cd server
npm run init-db
```

## 📊 Monitoring & Logging

- **Activity Logging**: Complete system activity tracking
- **Error Handling**: Comprehensive error logging
- **Performance Monitoring**: Database query optimization
- **Audit Trail**: User action tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the environment setup guide
- Check the troubleshooting section

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- Complete inventory management system
- Sales and expense tracking
- Debt management
- User authentication
- Mobile-responsive design
- Comprehensive reporting

---

**Built with ❤️ using modern web technologies**
