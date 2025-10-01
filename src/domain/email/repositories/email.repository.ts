import { Email, EmailId } from '../entities/email.entity';
import { EmailAddress } from '../value-objects/email-address';

export interface EmailRepository {
  save(email: Email): Promise<void>;
  findById(id: EmailId): Promise<Email | null>;
  findByRecipient(recipient: EmailAddress): Promise<Email[]>;
  findPendingEmails(): Promise<Email[]>;
  findFailedEmails(): Promise<Email[]>;
  updateStatus(email: Email): Promise<void>;
  delete(id: EmailId): Promise<void>;
}
