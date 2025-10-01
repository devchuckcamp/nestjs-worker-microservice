import { Email } from '../../../domain/email/entities/email.entity';

export interface EmailDeliveryService {
  send(email: Email): Promise<void>;
}
