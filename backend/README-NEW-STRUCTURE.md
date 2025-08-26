# AutoPulse Car Scout - Organized Backend Structure

## 🏗️ New Organized Structure

The backend has been completely restructured for better maintainability, scalability, and developer experience.

### 📁 Directory Structure

```
backend/
├── src/
│   ├── controllers/        # Route handlers and business logic
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── userController.js
│   │   ├── leadController.js
│   │   ├── adminController.js
│   │   └── healthController.js
│   │
│   ├── models/            # Database models and data access layer
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Car.js
│   │   └── Lead.js
│   │
│   ├── routes/            # Route definitions
│   │   ├── index.js       # Main router
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── adminRoutes.js
│   │   └── healthRoutes.js
│   │
│   ├── middleware/        # Custom middleware functions
│   │   ├── auth.js        # Authentication middleware
│   │   ├── rateLimiting.js
│   │   └── errorHandler.js
│   │
│   ├── services/          # Business logic and external services
│   │   └── emailService.js
│   │
│   ├── utils/             # Utility functions and helpers
│   │   ├── validation.js
│   │   └── logger.js
│   │
│   ├── config/            # Configuration files
│   │   ├── database.js    # Database configuration
│   │   └── environment.js # Environment variables
│   │
│   └── server.js          # Main server file
│
├── logs/                  # Log files (created automatically)
├── server-new.js          # New server entry point
├── server.js              # Original server file (legacy)
└── README-NEW-STRUCTURE.md
```

## 🚀 Getting Started with New Structure

### 1. Using the New Server

```bash
# Start with the new organized structure
node server-new.js

# Or use nodemon for development
nodemon server-new.js
```

### 2. Environment Variables

Make sure your `.env` file includes:

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret

# Optional
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true
ENABLE_REQUEST_LOGGING=true
EMAIL_ENABLED=false
EMAIL_PROVIDER=console
```

## 📋 Key Features

### ✅ Improved Organization
- **Separation of Concerns**: Controllers, models, routes, and middleware are properly separated
- **Modular Design**: Each component is in its own file with clear responsibilities
- **Easy Navigation**: Logical folder structure makes finding code intuitive

### ✅ Enhanced Security
- **Rate Limiting**: Configurable rate limiting for different endpoints
- **Input Validation**: Comprehensive validation utilities
- **Error Handling**: Centralized error handling with proper logging

### ✅ Better Logging
- **Structured Logging**: JSON-formatted logs with metadata
- **Request Logging**: Automatic logging of all HTTP requests
- **File Logging**: Production logs are saved to files

### ✅ Configuration Management
- **Environment-based Config**: Easy configuration through environment variables
- **Validation**: Automatic validation of required configuration
- **Type Safety**: Better handling of configuration types

### ✅ Database Layer
- **Model Classes**: Clean abstraction over database operations
- **Query Builders**: Reusable query methods in models
- **Connection Management**: Proper database connection handling

## 🔄 Migration Guide

### From Old Structure to New Structure

1. **Start the new server**:
   ```bash
   node server-new.js
   ```

2. **Test all endpoints** to ensure they work correctly

3. **Update your package.json scripts**:
   ```json
   {
     "scripts": {
       "start": "node server-new.js",
       "dev": "nodemon server-new.js",
       "start:old": "node server.js"
     }
   }
   ```

4. **Once satisfied, you can remove the old server.js**

## 🛠️ Development Workflow

### Adding New Features

1. **Create Model** (if needed):
   ```javascript
   // src/models/NewModel.js
   class NewModel {
     static async findAll() { /* ... */ }
     static async create(data) { /* ... */ }
   }
   module.exports = NewModel;
   ```

2. **Create Controller**:
   ```javascript
   // src/controllers/newController.js
   const NewModel = require('../models/NewModel');
   
   class NewController {
     static async getAll(req, res) { /* ... */ }
     static async create(req, res) { /* ... */ }
   }
   module.exports = NewController;
   ```

3. **Create Routes**:
   ```javascript
   // src/routes/newRoutes.js
   const express = require('express');
   const router = express.Router();
   const newController = require('../controllers/newController');
   
   router.get('/', newController.getAll);
   router.post('/', newController.create);
   
   module.exports = router;
   ```

4. **Register Routes**:
   ```javascript
   // src/routes/index.js
   const newRoutes = require('./newRoutes');
   router.use('/new-feature', newRoutes);
   ```

## 📊 API Endpoints

All existing endpoints remain the same:

- `GET /api/health` - Health check
- `GET /api/cars` - Get cars
- `GET /api/cars/featured` - Get featured cars
- `GET /api/cars/search` - Search cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User signup
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/leads` - Create lead
- `GET /api/admin/stats` - Admin statistics

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - Ensure Supabase project is active

2. **Port Already in Use**:
   - Change `PORT` in your `.env` file
   - Or kill the process using the port

3. **CORS Issues**:
   - Update `CORS_ORIGIN` in your `.env`
   - Check allowed origins in `src/server.js`

4. **Module Not Found**:
   - Run `npm install` to ensure all dependencies are installed
   - Check file paths in require statements

## 📈 Performance Benefits

- **Faster Development**: Better code organization means faster feature development
- **Better Debugging**: Clear separation makes debugging easier
- **Scalability**: Modular structure supports easy scaling
- **Maintainability**: Each component has a single responsibility

## 🧪 Testing

The new structure is designed to be easily testable:

```javascript
// Example test structure
const request = require('supertest');
const { app } = require('../src/server');

describe('Car Endpoints', () => {
  test('GET /api/cars should return cars', async () => {
    const response = await request(app).get('/api/cars');
    expect(response.status).toBe(200);
  });
});
```

## 📝 Next Steps

1. **Add Unit Tests**: Create comprehensive tests for each module
2. **API Documentation**: Generate API docs using tools like Swagger
3. **Database Migrations**: Implement proper database migration system
4. **Monitoring**: Add application monitoring and metrics
5. **CI/CD Pipeline**: Set up automated deployment pipeline

---

**Note**: The old `server.js` file remains for backward compatibility. Once you've verified everything works with the new structure, you can safely remove it.