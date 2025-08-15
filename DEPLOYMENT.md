# Deployment Guide

This guide covers deploying both the frontend and backend to Vercel.

## Production URLs

- **Frontend:** https://car-scout-india-main.vercel.app
- **Backend:** https://car-scout-india-main-izin.vercel.app

## Backend Deployment

### 1. Deploy to Vercel

The backend includes a `vercel.json` configuration file that handles routing for all API endpoints.

### 2. Environment Variables

Set these environment variables in your Vercel backend project:

```
NODE_ENV=production
CORS_ORIGIN=https://car-scout-india-main.vercel.app
FRONTEND_URL=https://car-scout-india-main.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_CREATION_KEY=your_admin_creation_key
```

### 3. Verify Backend Deployment

After deployment, test the backend:
- Health check: https://car-scout-india-main-izin.vercel.app/api/health
- Cars API: https://car-scout-india-main-izin.vercel.app/api/cars

## Frontend Deployment

### 1. Deploy to Vercel

The frontend includes a `vercel.json` configuration for client-side routing.

### 2. Environment Variables

Set these environment variables in your Vercel frontend project:

```
VITE_API_URL=https://car-scout-india-main-izin.vercel.app/api
VITE_FRONTEND_URL=https://car-scout-india-main.vercel.app
NODE_ENV=production
```

### 3. Verify Frontend Deployment

After deployment, the frontend will automatically use the production API URLs.

## Routes Configuration

### Frontend Routes (SPA with React Router)
- `/` - Homepage
- `/cars` - Car listing
- `/cars/:slug` - Car details
- `/cars/:slug/reviews` - Car reviews
- `/cars/:slug/gallery` - Car gallery
- `/compare` - Car comparison
- `/emi-calculator` - EMI calculator
- `/news` - News page
- `/loan-application` - Loan application
- `/login` - User login
- `/register` - User registration
- `/wishlist` - User wishlist
- `/admin/*` - Admin panel routes
- `/privacy-policy`, `/terms-conditions`, `/refund-policy`, `/disclaimer`, `/contact` - Legal pages

### Backend API Routes
All API routes are prefixed with `/api`:
- `/api/health` - Health check
- `/api/cars` - Cars CRUD operations
- `/api/cars/featured` - Featured cars
- `/api/cars/search` - Search cars
- `/api/cars/:id` - Single car
- `/api/leads` - Lead management
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User profile endpoints

## Deployment Checklist

### Before Deployment
- [ ] Update all environment variables
- [ ] Test API endpoints locally
- [ ] Verify CORS configuration
- [ ] Check Supabase connection

### After Backend Deployment
- [ ] Test health endpoint
- [ ] Verify API endpoints work
- [ ] Check CORS allows frontend domain
- [ ] Test authentication flow

### After Frontend Deployment
- [ ] Verify all pages load correctly
- [ ] Test API integration
- [ ] Check authentication flow
- [ ] Test admin panel access

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS_ORIGIN is set correctly in backend
   - Check frontend domain matches CORS setting

2. **API Not Found (404)**
   - Verify vercel.json routing configuration
   - Check API endpoint URLs are correct

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly

4. **Authentication Issues**
   - Verify Supabase configuration
   - Check redirect URLs in Supabase dashboard
