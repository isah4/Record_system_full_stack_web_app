# Environment Setup Guide

This guide explains how to set up environment variables for both the client and server applications.

## Server Environment Variables

### 1. Create `.env` file in the `server/` directory

Copy the contents from `server/env.example` and create a `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:challengeall@localhost:5432/record_sys

# JWT Configuration
JWT_SECRET=2ba7e7ef003c658b341e878a0288d52e

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### 2. Environment Variables Explained

- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT token signing
- **PORT**: Server port (default: 5000)
- **NODE_ENV**: Environment mode (development/production)
- **CLIENT_URL**: Allowed CORS origin for the client

## Client Environment Variables

### 1. Create `.env.local` file in the `client/` directory

Copy the contents from `client/env.example` and create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# Client Configuration
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

### 2. Environment Variables Explained

- **NEXT_PUBLIC_API_URL**: Full API endpoint URL
- **NEXT_PUBLIC_BASE_URL**: Base server URL
- **NEXT_PUBLIC_CLIENT_URL**: Client application URL

**Note**: All client environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

## Production Deployment

### Server Production Variables

```bash
# Database Configuration
DATABASE_URL=your-production-database-url

# JWT Configuration
JWT_SECRET=your-production-jwt-secret

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CLIENT_URL=https://your-production-domain.com
```

### Client Production Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_BASE_URL=https://your-api-domain.com

# Client Configuration
NEXT_PUBLIC_CLIENT_URL=https://your-production-domain.com
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong, unique JWT secrets** in production
3. **Restrict CORS origins** to only necessary domains
4. **Use environment-specific database URLs**
5. **Rotate secrets regularly** in production

## File Structure

```
record-sys/
├── server/
│   ├── .env                    # Server environment variables
│   ├── env.example            # Server environment template
│   └── config/
│       └── env.js             # Server environment configuration
├── client/
│   ├── .env.local             # Client environment variables
│   ├── env.example            # Client environment template
│   └── config/
│       ├── env.ts             # Client environment configuration
│       └── api.ts             # API configuration using env
└── ENVIRONMENT_SETUP.md       # This file
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Ensure `.env` files are in the correct directories
2. **CORS errors**: Check that `CLIENT_URL` matches your client's actual URL
3. **Database connection failures**: Verify `DATABASE_URL` format and credentials
4. **JWT errors**: Ensure `JWT_SECRET` is set and consistent

### Validation

The server automatically validates required environment variables in production mode. Check the console for any missing variable errors.

## Development vs Production

- **Development**: Uses localhost URLs and development database
- **Production**: Uses production URLs, production database, and stricter validation
- **Environment switching**: Controlled by `NODE_ENV` variable
