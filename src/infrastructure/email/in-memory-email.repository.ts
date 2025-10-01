import { Injectable } from '@nestjs/common';
import { EmailRepository } from '../../domain/email/repositories/email.repository';
import { Email, EmailId } from '../../domain/email/entities/email.entity';
import { EmailAddress } from '../../domain/email/value-objects/email-address';

@Injectable()
export class InMemoryEmailRepository implements EmailRepository {
  private emails: Map<string, Email> = new Map();

  save(email: Email): Promise<void> {
    this.emails.set(email.getId().value, email);
    return Promise.resolve();
  }

  findById(id: EmailId): Promise<Email | null> {
    return Promise.resolve(this.emails.get(id.value) || null);
  }

  findByRecipient(recipient: EmailAddress): Promise<Email[]> {
    const emails = Array.from(this.emails.values()).filter(
      (email) => email.getTo().getValue() === recipient.getValue(),
    );
    return Promise.resolve(emails);
  }

  findPendingEmails(): Promise<Email[]> {
    const emails = Array.from(this.emails.values()).filter((email) =>
      email.isPending(),
    );
    return Promise.resolve(emails);
  }

  findFailedEmails(): Promise<Email[]> {
    const emails = Array.from(this.emails.values()).filter((email) =>
      email.isFailed(),
    );
    return Promise.resolve(emails);
  }

  updateStatus(email: Email): Promise<void> {
    this.emails.set(email.getId().value, email);
    return Promise.resolve();
  }

  delete(id: EmailId): Promise<void> {
    this.emails.delete(id.value);
    return Promise.resolve();
  }
}
