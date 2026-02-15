# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Backend (Terminal 1)

```bash
cd backend
cp .env.example .env
# Edit .env and set JWT_SECRET to a random string
php storage/migrate.php
# Type 'y' when asked to seed data
php -S localhost:8000 -t .
```

### Frontend (Terminal 2)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Test Login

After seeding:
- Email: `client@example.com`
- Password: `password123`

## 📋 What's Included

✅ User authentication (Register/Login)
✅ Job posting and browsing
✅ Proposal submission
✅ Messaging system
✅ Review system
✅ Admin dashboard
✅ Role-based access control

## 🎯 Next Steps

1. Explore the codebase
2. Customize the UI
3. Add your features
4. Deploy to production

Happy coding! 🎉

