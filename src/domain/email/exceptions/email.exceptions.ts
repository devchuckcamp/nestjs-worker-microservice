export class EmailDomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'EmailDomainException';
  }
}

export class InvalidEmailAddressException extends EmailDomainException {
  constructor(email: string) {
    super(`Invalid email address: ${email}`, 'INVALID_EMAIL_ADDRESS');
  }
}

export class EmailContentValidationException extends EmailDomainException {
  constructor(message: string) {
    super(message, 'EMAIL_CONTENT_VALIDATION');
  }
}

export class EmailDeliveryException extends EmailDomainException {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message, 'EMAIL_DELIVERY_FAILED');
  }
}

export class EmailNotFoundDomainException extends EmailDomainException {
  constructor(emailId: string) {
    super(`Email with ID ${emailId} not found`, 'EMAIL_NOT_FOUND');
  }
}
