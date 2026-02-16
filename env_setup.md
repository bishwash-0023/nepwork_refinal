# Environment Setup Guide - NepWork

This guide provides a step-by-step process to set up the NepWork project correctly for development.

## Prerequisites
- **PHP 8.0 or higher** (Included in XAMPP)
- **Node.js 16.x or higher**
- **npm** (comes with Node.js)
- **SQLite3** (usually included with PHP)

---

## 1. Backend Setup (PHP)

### Configuration
1. Navigate to the `backend/` directory.
2. Ensure you have a `.env` file (copy from `.env.example` if available).
3. Set `DB_DRIVER=sqlite` and `DB_DATABASE=storage/database.sqlite`.

### Database Initialization
Run the unified migration script from the project root:
```bash
php backend/storage/migrate.php
```
*Note: This will create the database file and seed initial data.*

### Running the Server
You should run the PHP built-in server **specifically using `index.php` as a router**. This ensures all `/api/*` requests reach the entry point.

Run this from the `backend/` directory:
```bash
php -S localhost:5135 index.php
```
*Port `5135` is default for the frontend. If you change it, update `frontend/.env.local`.*

---

## 2. Frontend Setup (Next.js)

### Installation
Navigate to the `frontend/` directory and install dependencies:
```bash
npm install
```

### Configuration
Create/Update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5135
```

### Running the Server
Run the development server:
```bash
npm run dev
```
*Access the app at http://localhost:3000.*

---

## 3. Troubleshooting
- **Logs**: Backend logs are configured to print directly to your terminal window (where you run the `php -S` command). Always keep this window visible for debugging.
- **Paths**: The system is designed to resolve database paths relative to the `backend/` folder. Ensure you don't have a `database.sqlite` file in the root project folder.
- **CORS**: If you face CORS errors, check `backend/config/config.php` and ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL.
