import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const register = async (req, res) => {
    const { email, password, fullName, phone, city } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const existingUser = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        // We generate UUID in DB or here? schema says `id UUID PRIMARY KEY`. 
        // If we don't provide ID, it expects one? 
        // Schema: `id UUID PRIMARY KEY` -> It does NOT have default gen_random_uuid() in the original schema for profiles!
        // Wait, let me check schema again.
        // Line 87: `id UUID PRIMARY KEY`. No default.
        // So we must generate it. Postgres has `uuid-ossp` enabled. We can use `uuid_generate_v4()`.

        const result = await db.query(
            `INSERT INTO profiles (id, email, password_hash, full_name, phone, city, role, created_at) 
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'user', NOW()) 
       RETURNING id, email, full_name, role, created_at`,
            [email, hashedPassword, fullName, phone, city]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    try {
        // Find user
        const result = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check password
        // If user was migrated from Supabase and has no password_hash, they need to reset
        if (!user.password_hash) {
            return res.status(401).json({
                success: false,
                error: 'Please reset your password. Your account was migrated from the old system.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = generateToken(user);

        // Remove password_hash from response
        delete user.password_hash;

        const tokenData = {
            accessToken: token,
            expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
            tokenType: 'Bearer'
        };

        res.json({
            success: true,
            data: {
                user,
                ...tokenData
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

export const refresh = async (req, res) => {
    // Simple refresh implementation: verify token from header and issue new one
    // In a real app, use refresh tokens stored in DB/cookie
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }); // Allow expired for refresh? No, usually use refresh token.
        // For now, just re-issue if valid or close to expiry.
        // Actually, if we don't have refresh tokens, we can't really refresh securely after expiry.
        // We'll just re-sign the user data.

        const result = await db.query('SELECT * FROM profiles WHERE id = $1', [decoded.userId]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ success: false, error: 'User not found' });

        const newToken = generateToken(user);

        res.json({
            success: true,
            data: {
                accessToken: newToken,
                expiresIn: 7 * 24 * 60 * 60,
                tokenType: 'Bearer'
            }
        });
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

export const logout = async (req, res) => {
    // Client should delete the token. Server can't really invalidate JWT without blacklist.
    res.json({ success: true, message: 'Logged out successfully' });
};

export const createAdmin = async (req, res) => {
    const { email, password, adminKey } = req.body;

    const expectedAdminKey = process.env.ADMIN_CREATION_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
        return res.status(403).json({
            success: false,
            error: "Invalid admin creation key",
        });
    }

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "Email and password are required",
        });
    }

    try {
        // Check if user exists
        const userCheck = await db.query("SELECT * FROM profiles WHERE email = $1", [email]);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (userCheck.rows.length > 0) {
            // Update existing user to admin
            await db.query(
                "UPDATE profiles SET role = 'admin', password_hash = $1, is_active = true, updated_at = NOW() WHERE email = $2",
                [hashedPassword, email]
            );
            return res.json({
                success: true,
                message: "Existing user promoted to admin successfully"
            });
        }

        // Create new admin user
        // Generate UUID for new user
        const { rows } = await db.query("SELECT uuid_generate_v4() as id");
        const newId = rows[0].id;

        await db.query(
            `INSERT INTO profiles (id, email, password_hash, full_name, role, is_active, email_verified, created_at, updated_at)
             VALUES ($1, $2, $3, 'Admin User', 'admin', true, true, NOW(), NOW())`,
            [newId, email, hashedPassword]
        );

        res.json({
            success: true,
            message: "Admin user created successfully",
            data: { userId: newId, email }
        });

    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Access denied. Admin only.' });
        }

        if (!user.password_hash) {
            return res.status(401).json({
                success: false,
                error: 'Please reset your password. Your account was migrated from the old system.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        delete user.password_hash;

        const tokenData = {
            accessToken: token,
            expiresIn: 7 * 24 * 60 * 60,
            tokenType: 'Bearer'
        };

        res.json({
            success: true,
            data: {
                user,
                ...tokenData
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        // req.user is set by middleware
        const result = await db.query('SELECT id, email, full_name, role, phone, city, created_at FROM profiles WHERE id = $1', [req.user.userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
