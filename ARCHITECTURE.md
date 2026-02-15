# Architecture Overview

## Design Principles

### Backend (PHP)

1. **Procedural Approach**
   - No classes or objects
   - Functions organized by concern
   - Easy to understand and maintain
   - Follows DRY (Don't Repeat Yourself)

2. **Modular Structure**
   - Configuration separated from logic
   - Core utilities reusable across routes
   - Route handlers are self-contained
   - Clear separation of concerns

3. **Database Abstraction**
   - PDO for database access
   - Prepared statements only (SQL injection prevention)
   - Easy switch between SQLite and MySQL
   - Environment-based configuration

4. **Security First**
   - JWT authentication
   - Password hashing with `password_hash()`
   - Input validation
   - Output sanitization
   - Role-based access control

### Frontend (Next.js)

1. **Component-Based Architecture**
   - Reusable UI components (shadcn/ui)
   - Layout components for consistency
   - Page components for routes

2. **State Management**
   - SWR for server state
   - React hooks for local state
   - JWT stored in localStorage

3. **Form Handling**
   - React Hook Form for form state
   - Zod for schema validation
   - Client-side and server-side validation

4. **API Communication**
   - Axios with interceptors
   - Automatic token injection
   - Error handling
   - Automatic redirect on 401

## Data Flow

### Authentication Flow

1. User registers/logs in
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Token included in all subsequent requests
6. Backend validates token on protected routes

### Job Posting Flow

1. Client creates job (POST /api/jobs)
2. Job stored with status "open"
3. Freelancers can browse open jobs
4. Freelancer submits proposal
5. Client reviews proposals
6. Client accepts proposal
7. Job status changes to "in_progress"
8. Other proposals automatically rejected

### Messaging Flow

1. User sends message (POST /api/messages)
2. Backend validates user is part of job
3. Message stored with job_id, sender_id, receiver_id
4. Messages retrieved by job_id
5. Frontend polls for new messages (basic implementation)

### Review Flow

1. Job must be "completed"
2. Client or Freelancer can review the other party
3. Review includes rating (1-5) and comment
4. Reviews displayed on user profile
5. Average rating calculated

## Security Layers

1. **Authentication Layer**
   - JWT token validation
   - Token expiration check
   - Token signature verification

2. **Authorization Layer**
   - Role-based access control
   - Resource ownership checks
   - Admin-only endpoints

3. **Input Validation Layer**
   - Schema validation (Zod on frontend)
   - PHP validation functions
   - Type checking
   - Length validation

4. **Database Layer**
   - Prepared statements
   - Parameter binding
   - No raw SQL concatenation

5. **Output Layer**
   - HTML entity encoding
   - JSON encoding
   - No XSS vulnerabilities

## API Design Patterns

### RESTful Conventions

- GET for retrieval
- POST for creation
- PUT for updates
- DELETE for deletion

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error message",
  "data": {
    "errors": { ... }
  }
}
```

## Database Design

### Relationships

- Users → Jobs (one-to-many)
- Jobs → Proposals (one-to-many)
- Jobs → Messages (one-to-many)
- Jobs → Reviews (one-to-many)
- Users → Proposals (one-to-many)
- Users → Reviews (one-to-many as reviewer and reviewed)

### Indexes

- Foreign keys indexed for performance
- Status fields indexed for filtering
- Created_at fields for sorting

## Frontend Patterns

### Route Protection

- Client-side check with `isAuthenticated()`
- Redirect to login if not authenticated
- Role-based route access

### Data Fetching

- SWR for automatic revalidation
- Optimistic updates
- Error handling
- Loading states

### Component Structure

```
Page Component
  ├── Layout (Navbar)
  ├── Data Fetching (SWR)
  ├── UI Components
  └── Event Handlers
```

## Scalability Considerations

### Backend

- Stateless API (JWT)
- Easy to add more routes
- Database-agnostic (SQLite/MySQL)
- Can add caching layer
- Can add rate limiting

### Frontend

- Component reusability
- Code splitting (Next.js automatic)
- Image optimization (Next.js)
- Server-side rendering ready

## Future Enhancements

1. **Real-time Features**
   - WebSocket for messages
   - Real-time notifications

2. **Payment Integration**
   - Stripe/PayPal integration
   - Escrow system
   - Payment history

3. **Advanced Features**
   - File uploads
   - Portfolio for freelancers
   - Advanced search/filters
   - Email notifications

4. **Performance**
   - Redis caching
   - Database query optimization
   - CDN for static assets

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## Code Organization

### Backend Functions

Functions are organized by:
- **Core**: Reusable utilities
- **Routes**: Request handlers
- **Config**: Configuration and setup

### Frontend Components

Components organized by:
- **UI**: Reusable UI elements
- **Layout**: Page structure
- **Feature**: Feature-specific components

## Best Practices Followed

1. ✅ DRY (Don't Repeat Yourself)
2. ✅ Separation of Concerns
3. ✅ Single Responsibility Principle
4. ✅ Input Validation
5. ✅ Error Handling
6. ✅ Security First
7. ✅ Clean Code
8. ✅ Documentation

---

This architecture is designed to be:
- **Beginner-friendly**: Easy to understand
- **Scalable**: Can grow with needs
- **Maintainable**: Clean and organized
- **Secure**: Multiple security layers
- **Production-ready**: With proper configuration

