const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class Validation {
  static isValidEmail(email) {
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    return phoneRegex.test(phone);
  }

  static isValidUUID(uuid) {
    return uuidRegex.test(uuid);
  }

  static isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim();
  }

  static sanitizeEmail(email) {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim();
  }

  static isValidPaginationParams(offset, limit) {
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);
    
    return {
      isValid: !isNaN(offsetNum) && !isNaN(limitNum) && offsetNum >= 0 && limitNum > 0 && limitNum <= 100,
      offset: isNaN(offsetNum) ? 0 : offsetNum,
      limit: isNaN(limitNum) ? 20 : Math.min(limitNum, 100)
    };
  }

  static isValidSortParams(sortBy, sortOrder) {
    const validSortFields = [
      'created_at', 'updated_at', 'price', 'year', 'brand', 'model', 'city'
    ];
    const validSortOrders = ['asc', 'desc'];

    return {
      isValid: validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder),
      sortBy: validSortFields.includes(sortBy) ? sortBy : 'created_at',
      sortOrder: validSortOrders.includes(sortOrder) ? sortOrder : 'desc'
    };
  }

  static validateLeadData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.phone || !this.isValidPhone(data.phone)) {
      errors.push('Valid phone number is required');
    }

    if (data.budget_min && (isNaN(data.budget_min) || data.budget_min < 0)) {
      errors.push('Minimum budget must be a positive number');
    }

    if (data.budget_max && (isNaN(data.budget_max) || data.budget_max < 0)) {
      errors.push('Maximum budget must be a positive number');
    }

    if (data.budget_min && data.budget_max && data.budget_min > data.budget_max) {
      errors.push('Minimum budget cannot be greater than maximum budget');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUserData(data) {
    const errors = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || !this.isValidPassword(data.password)) {
      errors.push('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validation;