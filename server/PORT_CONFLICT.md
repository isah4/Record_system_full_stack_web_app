# Handling Port Conflicts

## Problem

The server may fail to start with an `EADDRINUSE` error, which indicates that port 5000 is already in use by another process.

## Solutions

This project has been updated with multiple solutions to handle port conflicts:

### 1. Automatic Port Fallback

The server will automatically try to use port 5001 if port 5000 is unavailable. The client has also been updated to automatically retry requests on port 5001 if port 5000 is unreachable.

### 2. Port Management Utility

A port management utility has been added that can check if a port is in use and optionally kill the process using it. This is integrated into the server startup process.

### 3. Manual Port Clearing

You can manually clear the port before starting the server using the following command:

```bash
npm run clear-port
```

### 4. Safe Start Command

A new script has been added to clear the port and then start the server:

```bash
npm run safe-start
```

## Changing the Default Port

If you want to use a different port, you can:

1. Set the `PORT` environment variable in your `.env` file
2. Update the client's `NEXT_PUBLIC_API_URL` environment variable to match

## Troubleshooting

If you continue to experience port conflicts:

1. Check what process is using port 5000:
   - On Windows: `netstat -ano | findstr :5000`
   - On Unix/Mac: `lsof -i :5000`

2. Manually kill the process:
   - On Windows: `taskkill /F /PID <PID>`
   - On Unix/Mac: `kill -9 <PID>`

3. Consider using a different port by setting the `PORT` environment variable