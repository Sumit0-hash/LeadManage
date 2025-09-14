# Lead Management System

A comprehensive Lead Management System built with React, Express, and Supabase. Features JWT authentication with httpOnly cookies, full CRUD operations, server-side pagination and filtering, and professional UI components.

## 🚀 Features

### Authentication
- JWT authentication with httpOnly cookies (no localStorage)
- User registration and login
- Password hashing with bcrypt
- Protected routes with proper 401 responses
- Automatic token refresh and validation

### Lead Management
- Full CRUD operations for leads
- Server-side pagination (configurable page size, max 100)
- Advanced filtering with multiple operators:
  - String fields (email, company, city): equals, contains
  - Enums (status, source): equals, in
  - Numbers (score, lead_value): equals, gt, lt, between
  - Dates (created_at, last_activity_at): on, before, after, between
  - Boolean (is_qualified): equals

### User Interface
- Professional React frontend with TypeScript
- AG Grid integration for advanced table features
- Responsive design with Tailwind CSS
- Real-time form validation
- Export functionality (CSV)
- Modern, intuitive UI with proper loading states

### Technical Features
- TypeScript throughout the stack
- Proper HTTP status codes (200, 201, 401, 404, etc.)
- Row Level Security (RLS) with Supabase
- Production-ready error handling
- Comprehensive validation and sanitization

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- AG Grid for data tables
- Lucide React for icons
- Context API for state management

**Backend:**
- Express.js with TypeScript
- JWT for authentication
- bcrypt for password hashing
- Cookie-parser for httpOnly cookies
- CORS configuration for cross-origin requests

**Database:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Comprehensive indexing
- Automatic timestamps

## 📋 Database Schema

### Leads Table
- `id` (uuid, primary key)
- `first_name`, `last_name` (required)
- `email` (unique, required)
- `phone`, `company`, `city`, `state` (optional)
- `source` (enum: website, facebook_ads, google_ads, referral, events, other)
- `status` (enum: new, contacted, qualified, lost, won)
- `score` (0-100)
- `lead_value` (currency)
- `last_activity_at` (nullable datetime)
- `is_qualified` (boolean, default false)
- `created_at`, `updated_at` (auto-managed)
- `user_id` (foreign key, RLS enforced)

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials and JWT secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add your API URL and Supabase credentials
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup
1. Create a new Supabase project
2. Run the migration files in order:
   - `supabase/migrations/create_leads_schema.sql`
   - `supabase/migrations/create_seed_data.sql`

## 🔐 Authentication

The system uses JWT tokens stored in httpOnly cookies for security:
- Tokens expire after 7 days
- Automatic token validation on protected routes
- Secure cookie configuration for production
- No sensitive data in localStorage

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads (Protected)
- `POST /api/leads` - Create lead
- `GET /api/leads` - List leads with pagination & filters
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Example Filtering
```
GET /api/leads?page=1&limit=20&status=new&score_gt=50&company=*tech*
```

## 🧪 Test Account

**Email:** test@example.com  
**Password:** testpassword123

The system includes 100+ sample leads for testing purposes.

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Set PORT environment variable

### Frontend Deployment (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set VITE_API_URL to your backend URL

## 🔒 Security Features

- JWT tokens in httpOnly cookies
- Password hashing with bcrypt
- Row Level Security (RLS)
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📈 Performance Optimizations

- Database indexing on commonly queried fields
- Pagination to limit result sets
- Efficient filtering at database level
- Optimized React components with useCallback
- AG Grid virtual scrolling for large datasets

## 🎯 Production Considerations

- Comprehensive error handling
- Logging and monitoring ready
- Environment-specific configurations
- Health check endpoints
- Rate limiting ready for implementation
- Database connection pooling

## 📝 API Response Format

### Paginated Lists
```json
{
  "data": [...],
  "page": 1,
  "limit": 20,
  "total": 150,
  "totalPages": 8
}
```

### Error Responses
```json
{
  "error": "Error message"
}
```

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests  
npm test
```

### Code Quality
- ESLint configuration
- TypeScript strict mode
- Prettier formatting
- Git hooks for quality checks

---
