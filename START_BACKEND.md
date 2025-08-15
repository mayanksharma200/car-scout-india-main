# Backend Setup Guide

This guide will help you run the backend server locally or deploy to production.

## Local Development

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory with your Supabase credentials:
   ```
   NODE_ENV=development
   PORT=3001
   CORS_ORIGIN=http://localhost:8080
   FRONTEND_URL=http://localhost:8080
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_CREATION_KEY=your_admin_creation_key
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   You should see output like:
   ```
   🚀 Server running on http://localhost:3001
   📍 Endpoints available:
     GET  http://localhost:3001/api/health
     GET  http://localhost:3001/api/cars
     GET  http://localhost:3001/api/cars/featured
     GET  http://localhost:3001/api/cars/search?q=query
     GET  http://localhost:3001/api/cars/:id
     POST http://localhost:3001/api/leads
     POST http://localhost:3001/api/auth/login
     POST http://localhost:3001/api/auth/signup
     POST http://localhost:3001/api/auth/logout
     GET  http://localhost:3001/api/auth/session
     GET  http://localhost:3001/api/auth/google
     GET  http://localhost:3001/api/auth/callback
   ```

5. **Test the backend:**
   Once the backend is running, you can test it by visiting:
   - http://localhost:3001/api/health

## Production Deployment

### Backend Deployment (Vercel)
- **Production URL:** https://car-scout-india-main-izin.vercel.app
- **Health Check:** https://car-scout-india-main-izin.vercel.app/api/health

### Frontend Deployment (Vercel)
- **Production URL:** https://car-scout-india-main.vercel.app

### Environment Variables for Production

For the backend deployment on Vercel, set these environment variables:
```
NODE_ENV=production
CORS_ORIGIN=https://car-scout-india-main.vercel.app
FRONTEND_URL=https://car-scout-india-main.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_CREATION_KEY=your_admin_creation_key
```

For the frontend deployment on Vercel, set these environment variables:
```
VITE_API_URL=https://car-scout-india-main-izin.vercel.app/api
VITE_FRONTEND_URL=https://car-scout-india-main.vercel.app
NODE_ENV=production
```

### Available API Endpoints

All endpoints are prefixed with `/api`:

- `GET /api/health` - Health check
- `GET /api/cars` - Get all cars with optional filters
- `GET /api/cars/featured` - Get featured cars for homepage
- `GET /api/cars/search?q=query` - Search cars
- `GET /api/cars/:id` - Get single car by ID
- `POST /api/leads` - Create a new lead
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User signup
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/callback` - OAuth callback
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `POST /api/auth/create-admin` - Create admin user (requires admin key)

### Notes
- The backend uses Supabase for database and authentication
- CORS is configured to allow requests from the frontend domain
- All API endpoints return JSON responses
- Authentication uses JWT tokens from Supabase
