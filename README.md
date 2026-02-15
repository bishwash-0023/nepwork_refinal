# Freelancing Platform

A minimal, clean, and scalable freelancing marketplace built with Core PHP (Procedural) and Next.js.

## 🏗️ Architecture

### Backend
- **Language**: Core PHP (Procedural, NO OOP)
- **Database**: SQLite (Development) / MySQL/MariaDB (Production-ready)
- **Database Access**: PDO with prepared statements
- **Authentication**: JWT tokens
- **API**: RESTful JSON API

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (NO TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: SWR
- **Form Handling**: React Hook Form + Zod

## 📁 Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── config.php          # Main configuration
│   │   ├── database.php        # PDO database connection
│   │   └── cors.php            # CORS handling
│   ├── core/
│   │   ├── response.php        # API response helpers
│   │   ├── auth_middleware.php # JWT authentication
│   │   ├── helpers.php         # Utility functions
│   │   └── validator.php       # Input validation
│   ├── routes/
│   │   ├── auth.php            # Authentication routes
│   │   ├── jobs.php            # Job routes
│   │   ├── proposals.php       # Proposal routes
│   │   ├── messages.php        # Message routes
│   │   ├── reviews.php         # Review routes
│   │   └── admin.php           # Admin routes
│   ├── storage/
│   │   ├── database.sqlite     # SQLite database (created after migration)
│   │   ├── schema.sql          # Database schema
│   │   ├── seed.sql            # Sample data
│   │   └── migrate.php         # Migration script
│   ├── index.php               # Main API router
│   └── .env                    # Environment variables
│
└── frontend/
    ├── app/
    │   ├── page.js             # Homepage
    │   ├── login/
    │   ├── register/
    │   ├── dashboard/
    │   ├── jobs/
    │   └── admin/
    ├── components/
    │   ├── ui/                 # shadcn/ui components
    │   └── layout/             # Layout components
    ├── lib/
    │   ├── api.js              # API client
    │   ├── auth.js             # Auth utilities
    │   └── utils.js            # Utility functions
    └── middleware.js           # Next.js middleware
```

## 🚀 Setup Instructions

### Prerequisites
- PHP 7.4+ with PDO extensions (SQLite and MySQL)
- Node.js 18+ and npm
- Composer (optional, not required for this project)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**
   - Set `JWT_SECRET` to a long random string
   - Configure database settings (SQLite for development)

4. **Run database migration**
   ```bash
   php storage/migrate.php
   ```
   This will:
   - Create all database tables
   - Optionally seed sample data

5. **Start PHP built-in server**
   ```bash
   php -S localhost:8000 -t .
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` file**
   - Set `NEXT_PUBLIC_API_URL` to your backend URL (default: `http://localhost:8000`)

5. **Start development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## 📊 Database Schema

### Tables

- **users**: User accounts (client, freelancer, admin)
- **jobs**: Job postings
- **proposals**: Freelancer proposals for jobs
- **messages**: Messages between users
- **reviews**: Reviews and ratings

See `backend/storage/schema.sql` for full schema details.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List jobs (with filters)
- `POST /api/jobs` - Create job (client/admin)
- `GET /api/jobs/{id}` - Get job details
- `PUT /api/jobs/{id}/status` - Update job status

### Proposals
- `POST /api/proposals` - Submit proposal (freelancer)
- `GET /api/proposals/my` - Get my proposals
- `GET /api/jobs/{id}/proposals` - Get job proposals (client)
- `PUT /api/proposals/{id}/status` - Accept/reject proposal

### Messages
- `POST /api/messages` - Send message
- `GET /api/jobs/{id}/messages` - Get job messages

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/users/{id}/reviews` - Get user reviews

### Admin
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/jobs` - List all jobs
- `DELETE /api/admin/jobs/{id}` - Delete job

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. Register or login to get a token
2. Include token in requests: `Authorization: Bearer <token>`
3. Token expires after 24 hours (configurable)

## 👥 User Roles

- **client**: Can post jobs, view proposals, accept proposals, send messages
- **freelancer**: Can browse jobs, submit proposals, send messages
- **admin**: Full access, can manage users and jobs

## 💳 Mock Payment System

The platform includes a mock payment system:
- No real payment gateway integration
- "Mark as Paid" button updates job status to "completed"
- Triggers review flow after payment

## 🛠️ Development Workflow

### Backend Development
```bash
# Start PHP server
cd backend
php -S localhost:8000 -t .
```

### Frontend Development
```bash
# Start Next.js dev server
cd frontend
npm run dev
```

### Database Management
```bash
# Run migration
cd backend
php storage/migrate.php
```

## 📝 Example API Call

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "client"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Job (with auth token)
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Website Development",
    "description": "Need a modern responsive website",
    "budget": 500.00
  }'
```

## 🔒 Security Features

- JWT authentication
- Password hashing with `password_hash()`
- Prepared statements (SQL injection prevention)
- Input validation
- Output sanitization
- CORS handling
- Role-based access control

## 🎨 Frontend Features

- Responsive design (mobile-first)
- Role-based dashboards
- Real-time data fetching with SWR
- Form validation with Zod
- Toast notifications
- Protected routes

## 📦 Default Credentials

After seeding the database, you can use these test accounts:

- **Admin**: admin@example.com / password123
- **Client**: client@example.com / password123
- **Freelancer**: freelancer@example.com / password123

**⚠️ Change these in production!**

## 🚀 Production Deployment

### Backend
1. Switch to MySQL/MariaDB in `.env`
2. Set strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use a production web server (Apache/Nginx)
5. Enable HTTPS

### Frontend
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Or deploy to Vercel/Netlify

## 📚 Architecture Decisions

### Why Procedural PHP?
- Beginner-friendly
- No OOP complexity
- Easier to understand and maintain
- Still follows DRY principles with functions

### Why SQLite for Development?
- No setup required
- File-based database
- Easy to reset
- Perfect for development

### Why Next.js App Router?
- Modern React patterns
- Server components support
- Better performance
- Built-in routing

### Why JWT?
- Stateless authentication
- No server-side sessions
- Scalable
- Works well with REST APIs

## 🤝 Contributing

This is a minimal implementation. Feel free to extend:
- Add more features
- Improve UI/UX
- Add tests
- Enhance security
- Add real payment integration

## 📄 License

This project is open source and available for learning purposes.

---

**Built with ❤️ using Core PHP and Next.js**

