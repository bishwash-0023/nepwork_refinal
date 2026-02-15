# Quick Setup Guide

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and set JWT_SECRET (use a long random string)
# Example: JWT_SECRET=your-super-secret-key-here-minimum-32-characters

# Run database migration
php storage/migrate.php
# When prompted, type 'y' to seed sample data

# Start PHP server
php -S localhost:8000 -t .
```

Backend is now running at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local if needed (default should work)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend is now running at `http://localhost:3000`

### 3. Test the Application

1. Open `http://localhost:3000` in your browser
2. Click "Register" to create an account
3. Or use test credentials (if you seeded data):
   - Email: `client@example.com`
   - Password: `password123`

## Troubleshooting

### Backend Issues

**Problem**: "Database connection failed"
- **Solution**: Make sure `storage/` directory exists and is writable
- Run: `chmod 755 backend/storage` (Linux/Mac)

**Problem**: "JWT secret not set"
- **Solution**: Edit `backend/.env` and set `JWT_SECRET` to a long random string

**Problem**: "CORS error"
- **Solution**: Check `CORS_ALLOWED_ORIGINS` in `backend/.env` matches your frontend URL

### Frontend Issues

**Problem**: "Cannot connect to API"
- **Solution**: Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

**Problem**: "Module not found"
- **Solution**: Run `npm install` again in the frontend directory

## Switching to MySQL

1. Edit `backend/.env`:
   ```env
   DB_DRIVER=mysql
   DB_HOST=localhost
   DB_NAME=freelance
   DB_USER=your_username
   DB_PASS=your_password
   ```

2. Create the database:
   ```sql
   CREATE DATABASE freelance;
   ```

3. Run migration (it will work with MySQL too)

## Next Steps

- Explore the codebase
- Customize the UI
- Add more features
- Deploy to production

Happy coding! 🚀

