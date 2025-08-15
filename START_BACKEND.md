# Starting the Backend Server

The frontend is currently getting "Failed to fetch" errors because the backend API server is not running.

## Quick Fix
The app now has **automatic fallback to Supabase** when the backend is not available, so the car listings should work even without the backend running.

## To Start the Backend Server:

1. **Open a new terminal**
2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

## Expected Output:
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

## Verification:
Once the backend is running, you can test it by visiting:
- http://localhost:3001/api/health

The frontend will automatically switch to using the backend API instead of the Supabase fallback.

## Note:
The frontend has been updated with automatic fallback functionality, so even if the backend is not running, the car data will still load from Supabase directly.
