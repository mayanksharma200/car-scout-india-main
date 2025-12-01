# Forgot Password Feature - Setup Guide

This document explains how to set up and use the forgot password functionality with OTP verification via Gmail.

## Overview

The forgot password feature allows users and admins to reset their passwords through a secure 3-step OTP verification process:

1. **Request OTP** - User enters email, system sends 6-digit OTP to email
2. **Verify OTP** - User enters OTP code (valid for 10 minutes, max 5 attempts)
3. **Reset Password** - User creates new password after OTP verification

## Features

- ✅ Separate flows for Users and Admins
- ✅ 6-digit OTP codes sent via Gmail
- ✅ OTP expires in 10 minutes
- ✅ Maximum 5 verification attempts per OTP
- ✅ Beautiful email templates with branding
- ✅ Confirmation emails after successful password reset
- ✅ All existing user sessions invalidated after password reset
- ✅ Security: doesn't reveal if email exists in system
- ✅ Rate limiting on OTP requests

## Files Created/Modified

### Backend Files

1. **`backend/services/emailService.js`** - Email service using Nodemailer
   - Sends OTP emails with beautiful HTML templates
   - Sends password reset confirmation emails
   - Gmail integration with App Password support

2. **`backend/server.js`** - Updated with 3 new endpoints:
   - `POST /api/auth/forgot-password/send-otp` - Send OTP to email
   - `POST /api/auth/forgot-password/verify-otp` - Verify OTP code
   - `POST /api/auth/forgot-password/reset` - Reset password with verified token

3. **`backend/package.json`** - Added nodemailer dependency

4. **`backend/.env.example`** - Added Gmail configuration instructions

### Database Migration

5. **`supabase/migrations/20251111000000_add_password_reset_otp.sql`**
   - Creates `password_reset_otp` table
   - Stores OTP codes, expiration, attempts, and metadata
   - Includes cleanup function for expired OTPs

### Frontend Files

6. **`src/pages/ForgotPassword.tsx`** - User forgot password page
   - 3-step wizard: Email → OTP → Reset Password
   - Countdown timer for OTP resend
   - Clean UI with validation

7. **`src/pages/AdminForgotPassword.tsx`** - Admin forgot password page
   - Same functionality as user version but for admin role
   - Different branding and security notices

8. **`src/App.tsx`** - Updated routing:
   - Added `/forgot-password` route
   - Added `/admin/forgot-password` route

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

The `nodemailer` package should already be installed. If not:

```bash
npm install nodemailer
```

### Step 2: Configure Gmail App Password

To send emails through Gmail, you need to create an App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled
4. Go back to Security settings
5. Click **2-Step Verification** → Scroll down to **App passwords**
6. Click **Select app** → Choose **Mail**
7. Click **Select device** → Choose **Other (Custom name)**
8. Enter "Carlist360 OTP" as the name
9. Click **Generate**
10. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

**Important Notes:**
- App passwords only work if 2-Step Verification is enabled
- Each app password is unique and can be revoked independently
- Never share your app password publicly

### Step 3: Update Environment Variables

Edit `backend/.env` and add the following lines:

```env
# Gmail Configuration for OTP emails (Forgot Password)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**Example:**
```env
GMAIL_USER=noreply@carlist360.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Note:** Replace spaces with nothing in the app password or keep them (Nodemailer handles both formats).

### Step 4: Run Database Migration

You need to create the `password_reset_otp` table in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of `supabase/migrations/20251111000000_add_password_reset_otp.sql`
5. Click **Run** to execute the migration

**Option B: Using Supabase CLI (if authenticated)**

```bash
cd backend
npx supabase db push
```

**Option C: Using psql (if you have direct database access)**

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" < ../supabase/migrations/20251111000000_add_password_reset_otp.sql
```

### Step 5: Restart Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Email service is ready to send messages
```

If you see:
```
⚠️ Gmail credentials not configured. Email service disabled.
```

Then your `.env` file doesn't have the Gmail credentials properly set.

### Step 6: Test the Feature

1. **Start the frontend** (if not already running):
   ```bash
   npm run dev
   ```

2. **Test User Forgot Password:**
   - Navigate to http://localhost:8080/login
   - Click "Forgot password?" link
   - Enter a user email (must exist in `profiles` table with `role='user'`)
   - Check email for OTP
   - Enter OTP and create new password

3. **Test Admin Forgot Password:**
   - Navigate to http://localhost:8080/admin/login
   - Click "Forgot password?" link
   - Enter an admin email (must exist in `profiles` table with `role='admin'`)
   - Check email for OTP
   - Enter OTP and create new password

## API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/auth/forgot-password/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "user"  // or "admin"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP has been sent to your email address.",
  "expiresIn": 600
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Email service is not configured. Please contact support."
}
```

### 2. Verify OTP

**Endpoint:** `POST /api/auth/forgot-password/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "role": "user"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "uuid-of-otp-record"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid OTP. 3 attempts remaining."
}
```

### 3. Reset Password

**Endpoint:** `POST /api/auth/forgot-password/reset`

**Request Body:**
```json
{
  "email": "user@example.com",
  "resetToken": "uuid-from-verify-step",
  "newPassword": "newSecurePassword123",
  "role": "user"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

## Security Features

1. **Rate Limiting**
   - Uses Express rate limiting middleware
   - Production: Limited to prevent abuse
   - Development: More lenient for testing

2. **OTP Expiration**
   - OTP valid for 10 minutes from generation
   - Expired OTPs are automatically deleted

3. **Attempt Limiting**
   - Maximum 5 verification attempts per OTP
   - After 5 failed attempts, OTP is deleted and user must request new one

4. **Session Invalidation**
   - All existing sessions are invalidated after password reset
   - Forces user to log in again with new password

5. **Email Enumeration Protection**
   - System doesn't reveal if email exists or not
   - Always returns success message when sending OTP

6. **Role-Based Access**
   - Separate flows for users and admins
   - OTPs are tied to specific role
   - Admin OTP cannot be used for user account and vice versa

## Database Schema

The `password_reset_otp` table structure:

```sql
CREATE TABLE password_reset_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);
```

## Troubleshooting

### Issue: Email service not configured

**Error:** `⚠️ Gmail credentials not configured. Email service disabled.`

**Solution:**
1. Check that `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in `backend/.env`
2. Make sure there are no extra spaces in the variables
3. Restart the backend server

### Issue: Authentication failed

**Error:** `❌ Email service verification failed: Invalid login`

**Solution:**
1. Verify you're using an App Password, not your regular Gmail password
2. Make sure 2-Step Verification is enabled on your Google Account
3. Try generating a new App Password
4. Check that the email address is correct

### Issue: OTP not received

**Possible causes:**
1. Email might be in spam folder - check spam/junk
2. Gmail credentials are incorrect
3. Email doesn't exist in the database with correct role
4. Network/firewall blocking SMTP connection

**Debug steps:**
1. Check backend logs for error messages
2. Test backend connection: `curl http://localhost:3001/api/health`
3. Verify the user exists: Check Supabase `profiles` table

### Issue: OTP verification failed

**Possible causes:**
1. OTP has expired (>10 minutes old)
2. Too many failed attempts (>5 attempts)
3. OTP code is incorrect
4. Wrong role specified (user vs admin)

### Issue: Table does not exist

**Error:** `relation "password_reset_otp" does not exist`

**Solution:**
Run the database migration as described in Step 4 above.

## Email Templates

The system sends two types of emails:

### 1. Password Reset OTP Email
- Professional gradient design
- Large, easy-to-read OTP code
- Expiration warning (10 minutes)
- Security notice
- Carlist360 branding

### 2. Password Reset Confirmation Email
- Success message with checkmark
- Security alert if user didn't make the change
- Carlist360 branding

Both emails are responsive and work on all email clients.

## Maintenance

### Cleanup Old OTPs

The migration includes a cleanup function. To run it manually:

```sql
SELECT cleanup_expired_password_reset_otps();
```

You can also set up a cron job to run this periodically:

```sql
-- Run every hour
SELECT cron.schedule(
  'cleanup-expired-otps',
  '0 * * * *',
  $$SELECT cleanup_expired_password_reset_otps();$$
);
```

## Production Checklist

Before deploying to production:

- [ ] Set up production Gmail account (e.g., noreply@carlist360.com)
- [ ] Generate production App Password
- [ ] Update `backend/.env.production` with Gmail credentials
- [ ] Test forgot password flow end-to-end
- [ ] Verify emails are not going to spam
- [ ] Set up email monitoring/logging
- [ ] Configure rate limiting appropriately
- [ ] Set up database backup for OTP table
- [ ] Test with multiple email providers (Gmail, Outlook, Yahoo, etc.)
- [ ] Verify mobile email rendering
- [ ] Document support process for password reset issues

## Support

If users report issues:

1. **Check email in spam folder**
2. **Verify account exists** - Check Supabase `profiles` table
3. **Check account status** - Ensure `is_active = true`
4. **Check backend logs** - Look for OTP generation errors
5. **Manually reset** - Use Supabase dashboard if needed

## Future Enhancements

Possible improvements:

- [ ] SMS OTP as alternative to email
- [ ] Remember device to skip OTP for trusted devices
- [ ] Password strength meter
- [ ] Breach password checking (HaveIBeenPwned API)
- [ ] Multi-language email templates
- [ ] Custom email templates per brand
- [ ] OTP analytics and monitoring dashboard
- [ ] Automated testing suite for password reset flow

---

**Last Updated:** November 11, 2025
**Version:** 1.0.0
**Author:** Carlist360 Development Team
