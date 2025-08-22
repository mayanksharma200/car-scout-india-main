// src/services/smsService.ts
class SMSService {
  private baseUrl: string;

  constructor() {
    // Use the same logic as api.ts for consistency
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    
    // Log for debugging
    console.log('SMS Service Configuration:', {
      baseUrl: this.baseUrl,
      environment: import.meta.env.MODE,
      viteApiUrl: import.meta.env.VITE_API_URL
    });
  }

  async sendOTP(phoneNumber: string): Promise<{ success: boolean; otp?: string; error?: string; message?: string }> {
    try {
      // Use the proxy-compatible URL - this will route through Vite proxy to your backend
      const url = `${this.baseUrl}/sms/send-otp`;
      
      console.log('Sending OTP to URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          phoneNumber: phoneNumber
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return data;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error occurred while sending OTP'
      };
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      // Use the proxy-compatible URL - this will route through Vite proxy to your backend
      const url = `${this.baseUrl}/sms/verify-otp`;
      
      console.log('Verifying OTP to URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          otp: otp
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      return data;
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error occurred while verifying OTP'
      };
    }
  }

  // Helper method to format phone number
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned.substring(2); // Remove country code
    } else if (cleaned.length === 10) {
      return cleaned; // Already in correct format
    } else {
      throw new Error('Invalid phone number format. Please enter a 10-digit number.');
    }
  }

  // Helper method to validate phone number
  validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string } {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);
      
      if (!/^\d{10}$/.test(formatted)) {
        return { isValid: false, error: 'Phone number must be exactly 10 digits' };
      }
      
      if (!formatted.match(/^[6-9]\d{9}$/)) {
        return { isValid: false, error: 'Please enter a valid Indian mobile number' };
      }
      
      return { isValid: true };
    } catch (error: any) {
      return { isValid: false, error: error.message };
    }
  }
}

export const smsService = new SMSService();