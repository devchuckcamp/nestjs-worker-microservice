import { Email, EmailId } from '../entities/email.entity';

export interface EmailWriteRepository {
  save(email: Email): Promise<void>;
  updateStatus(email: Email): Promise<void>;
  delete(id: EmailId): Promise<void>;
}
