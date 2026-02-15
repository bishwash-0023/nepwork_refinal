# Port Configuration Guide

## Backend (PHP) - Port 5135

The backend API is configured to run on **port 5135**.

### Starting the Backend Server

```bash
cd backend
php -S localhost:5135 -t .
```

### Updating Backend Port

If you need to change the backend port:

1. Update the server command:
   ```bash
   php -S localhost:YOUR_PORT -t .
   ```

2. Update `backend/.env`:
   ```
   API_URL=http://localhost:YOUR_PORT
   ```

3. Update `backend/config/config.php` if you hardcoded the port

## Frontend (Next.js) - Port 3000

The frontend is configured to connect to the backend on port 5135.

### Configuration Files

1. **`frontend/lib/api.js`**
   ```javascript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135';
   ```

2. **`frontend/next.config.js`**
   ```javascript
   destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135'}/api/:path*`
   ```

3. **`frontend/.env.local`** (create this file)
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5135
   ```

### Updating Frontend Port Configuration

To change the backend URL the frontend connects to:

1. Create/update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:YOUR_BACKEND_PORT
   ```

2. Or update the default in `frontend/lib/api.js` and `frontend/next.config.js`

## CORS Configuration

Make sure `backend/.env` has the correct CORS origin:

```
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

This allows the frontend (running on port 3000) to make requests to the backend.

## Quick Start

### Terminal 1 - Backend
```bash
cd backend
php -S localhost:5135 -t .
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5135

## Testing the Connection

You can test if the backend is accessible:

```bash
curl http://localhost:5135/api/jobs
```

Or open in browser:
```
http://localhost:5135/api/jobs
```

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check `backend/.env` has `CORS_ALLOWED_ORIGINS=http://localhost:3000`
2. Restart the PHP server
3. Clear browser cache

### Connection Refused

If frontend can't connect to backend:
1. Verify backend is running: `curl http://localhost:5135/api/jobs`
2. Check `.env.local` has correct URL
3. Restart Next.js dev server

### Port Already in Use

If port 5135 is already in use:
1. Find what's using it: `netstat -ano | findstr :5135` (Windows)
2. Kill the process or use a different port
3. Update all configuration files with new port

