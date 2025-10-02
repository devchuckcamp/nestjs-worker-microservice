import { Email, EmailId } from '../entities/email.entity';
import { EmailAddress } from '../value-objects/email-address';

export interface EmailQueryRepository {
  findById(id: EmailId): Promise<Email | null>;
  findByRecipient(recipient: EmailAddress): Promise<Email[]>;
  findPendingEmails(): Promise<Email[]>;
  findFailedEmails(): Promise<Email[]>;
}
