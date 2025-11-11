// backend/services/emailService.js - Email service using Nodemailer with Gmail
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initTransporter();
  }

  initTransporter() {
    try {
      // Check if Gmail credentials are configured
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('⚠️ Gmail credentials not configured. Email service disabled.');
        console.warn('💡 Add GMAIL_USER and GMAIL_APP_PASSWORD to .env file');
        return;
      }

      // Create transporter using Gmail with App Password
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // For development
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service verification failed:', error);
          this.initialized = false;
        } else {
          console.log('✅ Email service is ready to send messages');
          this.initialized = true;
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.initialized = false;
    }
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP email for password reset
   */
  async sendPasswordResetOTP(email, otp, firstName = '') {
    if (!this.initialized || !this.transporter) {
      throw new Error('Email service is not configured. Please contact support.');
    }

    const mailOptions = {
      from: {
        name: 'Carlist360 India',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Password Reset OTP - Carlist360',
      html: this.getPasswordResetEmailTemplate(otp, firstName, email),
      text: `Your password reset OTP is: ${otp}. This code will expire in 10 minutes. If you didn't request this, please ignore this email.`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset OTP email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send password reset OTP email:', error);
      throw new Error('Failed to send OTP email. Please try again later.');
    }
  }

  /**
   * HTML email template for password reset OTP
   */
  getPasswordResetEmailTemplate(otp, firstName, email) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🚗 Carlist360 India
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                ${firstName ? `Hi ${firstName},` : 'Hello,'}
              </h2>

              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your account associated with <strong>${email}</strong>.
              </p>

              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Your One-Time Password (OTP) is:
              </p>

              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
                <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; display: inline-block;">
                  <span style="font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${otp}
                  </span>
                </div>
              </div>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 0 0 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                  ⏰ <strong>This OTP will expire in 10 minutes.</strong><br>
                  🔒 For security reasons, do not share this code with anyone.
                </p>
              </div>

              <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                This is an automated email from Carlist360 India
              </p>
              <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 12px;">
                © ${new Date().getFullYear()} Carlist360 India. All rights reserved.
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                Find Your Perfect Car | <a href="https://carlist360.com" style="color: #667eea; text-decoration: none;">carlist360.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmation(email, firstName = '') {
    if (!this.initialized || !this.transporter) {
      throw new Error('Email service is not configured. Please contact support.');
    }

    const mailOptions = {
      from: {
        name: 'Carlist360 India',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Password Reset Successful - Carlist360',
      html: this.getPasswordResetConfirmationTemplate(firstName, email),
      text: `Your password has been successfully reset. If you didn't make this change, please contact support immediately.`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset confirmation email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      // Don't throw error for confirmation emails - password is already reset
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * HTML email template for password reset confirmation
   */
  getPasswordResetConfirmationTemplate(firstName, email) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Password Reset Successful
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                ${firstName ? `Hi ${firstName},` : 'Hello,'}
              </h2>

              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Your password for <strong>${email}</strong> has been successfully reset.
              </p>

              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                You can now log in to your Carlist360 account using your new password.
              </p>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  ⚠️ <strong>Security Notice:</strong><br>
                  If you didn't make this change, please contact our support team immediately.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; color: #555555; font-size: 14px; line-height: 1.6;">
                Thank you for using Carlist360!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                This is an automated email from Carlist360 India
              </p>
              <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 12px;">
                © ${new Date().getFullYear()} Carlist360 India. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

// Export singleton instance
export default new EmailService();
