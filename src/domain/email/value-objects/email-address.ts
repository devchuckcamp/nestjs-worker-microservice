import { EmailValidator } from '../../../shared/validators/email.validator';
import { InvalidEmailAddressException } from '../exceptions/email.exceptions';

export class EmailAddress {
  private readonly value: string;

  constructor(email: string) {
    const validation = EmailValidator.validateBusinessRules(email);
    if (!validation.isValid) {
      throw new InvalidEmailAddressException(email);
    }
    this.value = email;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
