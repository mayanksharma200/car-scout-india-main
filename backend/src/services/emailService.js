// Email service for sending notifications
// This is a placeholder implementation - you can integrate with services like:
// - SendGrid, Mailgun, AWS SES, etc.

class EmailService {
  constructor() {
    this.isEnabled = process.env.EMAIL_ENABLED === 'true';
    this.provider = process.env.EMAIL_PROVIDER || 'console'; // console, sendgrid, mailgun, etc.
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    if (!this.isEnabled) {
      console.log('📧 Email service disabled. Email not sent.');
      return { success: false, message: 'Email service disabled' };
    }

    try {
      switch (this.provider) {
        case 'console':
          return this.sendConsoleEmail(to, subject, htmlContent);
        case 'sendgrid':
          return this.sendSendGridEmail(to, subject, htmlContent, textContent);
        // Add other providers as needed
        default:
          return this.sendConsoleEmail(to, subject, htmlContent);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendConsoleEmail(to, subject, htmlContent) {
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', htmlContent);
    console.log('---');
    
    return { success: true, provider: 'console' };
  }

  async sendSendGridEmail(to, subject, htmlContent, textContent) {
    // Placeholder for SendGrid implementation
    // You would implement actual SendGrid API calls here
    console.log('📧 SendGrid email placeholder - implement with @sendgrid/mail');
    return { success: true, provider: 'sendgrid' };
  }

  // Template methods for common emails
  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to AutoPulse Car Scout!';
    const htmlContent = `
      <html>
        <body>
          <h2>Welcome to AutoPulse Car Scout, ${userName}!</h2>
          <p>Thank you for joining our platform. We're excited to help you find your perfect car.</p>
          <p>You can now browse our extensive collection of cars and save your favorites to your wishlist.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Happy car hunting!</p>
          <p>The AutoPulse Team</p>
        </body>
      </html>
    `;
    
    return this.sendEmail(userEmail, subject, htmlContent);
  }

  async sendLeadNotificationEmail(leadData) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@autopulse.com';
    const subject = `New Lead: ${leadData.name}`;
    
    const htmlContent = `
      <html>
        <body>
          <h2>New Lead Received</h2>
          <table border="1" style="border-collapse: collapse;">
            <tr><td><strong>Name:</strong></td><td>${leadData.name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${leadData.email}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${leadData.phone}</td></tr>
            <tr><td><strong>Budget:</strong></td><td>₹${leadData.budget_min || 'N/A'} - ₹${leadData.budget_max || 'N/A'}</td></tr>
            <tr><td><strong>City:</strong></td><td>${leadData.city || 'N/A'}</td></tr>
            <tr><td><strong>Timeline:</strong></td><td>${leadData.timeline || 'N/A'}</td></tr>
            <tr><td><strong>Message:</strong></td><td>${leadData.message || 'N/A'}</td></tr>
            <tr><td><strong>Interested Car ID:</strong></td><td>${leadData.interested_car_id || 'N/A'}</td></tr>
            <tr><td><strong>Source:</strong></td><td>${leadData.source}</td></tr>
            <tr><td><strong>Submitted At:</strong></td><td>${new Date(leadData.created_at).toLocaleString()}</td></tr>
          </table>
          <p><strong>Follow up with this lead promptly!</strong></p>
        </body>
      </html>
    `;
    
    return this.sendEmail(adminEmail, subject, htmlContent);
  }

  async sendLeadConfirmationEmail(leadData) {
    const subject = 'Thank you for your interest - AutoPulse Car Scout';
    
    const htmlContent = `
      <html>
        <body>
          <h2>Thank you for your interest, ${leadData.name}!</h2>
          <p>We have received your inquiry and our team will contact you within 24 hours.</p>
          
          <h3>Your Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${leadData.name}</li>
            <li><strong>Email:</strong> ${leadData.email}</li>
            <li><strong>Phone:</strong> ${leadData.phone}</li>
            ${leadData.budget_min ? `<li><strong>Budget:</strong> ₹${leadData.budget_min} - ₹${leadData.budget_max || 'N/A'}</li>` : ''}
            ${leadData.city ? `<li><strong>City:</strong> ${leadData.city}</li>` : ''}
            ${leadData.timeline ? `<li><strong>Timeline:</strong> ${leadData.timeline}</li>` : ''}
          </ul>
          
          <p>In the meantime, feel free to browse our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">car collection</a>.</p>
          
          <p>Best regards,<br>The AutoPulse Car Scout Team</p>
          
          <hr>
          <small>This is an automated email. Please do not reply to this email.</small>
        </body>
      </html>
    `;
    
    return this.sendEmail(leadData.email, subject, htmlContent);
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset - AutoPulse Car Scout';
    
    const htmlContent = `
      <html>
        <body>
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password for AutoPulse Car Scout.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The AutoPulse Car Scout Team</p>
        </body>
      </html>
    `;
    
    return this.sendEmail(userEmail, subject, htmlContent);
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;