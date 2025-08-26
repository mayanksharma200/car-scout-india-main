const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, password, rememberMe = false } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Validate password
      const isValidPassword = await User.validatePassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Generate tokens
      const tokens = await generateTokens(user);

      // Update last login
      await User.update(user.id, {
        last_login: new Date().toISOString(),
      });

      console.log(`Successful login for user: ${user.id}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            emailVerified: user.email_verified || false,
          },
          ...tokens,
        },
        message: "Login successful",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed",
      });
    }
  }

  // Signup
  static async signup(req, res) {
    try {
      const { email, password, userData = {} } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "User already exists with this email",
          code: "USER_EXISTS",
        });
      }

      // Create user
      const newUser = await User.create({
        email,
        password,
        email_verified: false,
        created_at: new Date().toISOString(),
        ...userData
      });

      // Generate tokens
      const tokens = await generateTokens(newUser);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            emailVerified: newUser.email_verified || false,
          },
          ...tokens,
        },
        message: "Account created successfully",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create account",
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: "Refresh token is required",
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Find user by refresh token
      const user = await User.findByRefreshToken(refreshToken);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired refresh token",
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      // Generate new tokens
      const tokens = await generateTokens(user);

      // Clear old refresh token
      await User.clearRefreshToken(user.id);

      res.json({
        success: true,
        data: tokens,
        message: "Tokens refreshed successfully",
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(401).json({
        success: false,
        error: "Failed to refresh token",
        code: "REFRESH_FAILED",
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const userId = req.user?.id;
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (userId) {
        await User.clearRefreshToken(userId);
      }

      // Clear cookies
      res.clearCookie('refreshToken');
      res.clearCookie('hasRefreshToken');

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Logout failed",
      });
    }
  }

  // Supabase logout
  static async supabaseLogout(req, res) {
    try {
      // Clear cookies
      res.clearCookie('refreshToken');
      res.clearCookie('hasRefreshToken');

      res.json({
        success: true,
        message: "Supabase logout successful",
      });
    } catch (error) {
      console.error("Supabase logout error:", error);
      res.status(500).json({
        success: false,
        error: "Supabase logout failed",
      });
    }
  }

  // Verify token
  static async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user,
          valid: true,
        },
        message: "Token is valid",
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({
        success: false,
        error: "Token verification failed",
      });
    }
  }

  // Google OAuth
  static async googleOAuth(req, res) {
    try {
      const { supabaseUserId, email, userData } = req.body;

      // Implementation for Google OAuth
      // This would handle the Google OAuth flow
      
      res.json({
        success: true,
        message: "Google OAuth not fully implemented yet",
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({
        success: false,
        error: "Google OAuth failed",
      });
    }
  }

  // Create test user (development only)
  static async createTestUser(req, res) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: "Not available in production",
        });
      }

      const testUser = await User.create({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        email_verified: true,
        created_at: new Date().toISOString(),
      });

      res.json({
        success: true,
        data: testUser,
        message: "Test user created",
      });
    } catch (error) {
      console.error("Create test user error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create test user",
      });
    }
  }

  // Create admin user
  static async createAdmin(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Create admin user
      const adminUser = await User.create({
        email,
        password,
        email_verified: true,
        created_at: new Date().toISOString(),
      });

      // Create admin profile
      const Profile = require('../models/Profile');
      await Profile.create({
        id: adminUser.id,
        role: 'admin',
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        email_verified: true,
      });

      res.json({
        success: true,
        data: {
          id: adminUser.id,
          email: adminUser.email,
          role: 'admin'
        },
        message: "Admin user created successfully",
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create admin user",
      });
    }
  }
}

module.exports = AuthController;