export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly DOMAIN_BLACKLIST = [
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com',
  ];

  static isValidFormat(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  static isAllowedDomain(email: string): boolean {
    if (!this.isValidFormat(email)) return false;

    const domain = email.split('@')[1].toLowerCase();
    return !this.DOMAIN_BLACKLIST.includes(domain);
  }

  static validateBusinessRules(email: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email cannot be empty');
    }

    if (!this.isValidFormat(email)) {
      errors.push('Invalid email format');
    }

    if (!this.isAllowedDomain(email)) {
      errors.push('Email domain is not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
