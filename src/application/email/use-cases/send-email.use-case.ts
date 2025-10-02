import { Injectable, Inject } from '@nestjs/common';
import type { EmailRepository } from '../../../domain/email/repositories/email.repository';
import { Email, EmailId } from '../../../domain/email/entities/email.entity';
import { EmailAddress } from '../../../domain/email/value-objects/email-address';
import { EmailContent } from '../../../domain/email/value-objects/email-content';
import type { EmailDeliveryService } from '../services/email-delivery.service';
import { IdGenerator } from '../../../shared/helpers/id-generator.helper';

export interface SendEmailCommand {
  from: string;
  to: string;
  subject: string;
  textContent: string;
  htmlContent?: string;
}

@Injectable()
export class SendEmailUseCase {
  constructor(
    @Inject('EmailRepository')
    private readonly emailRepository: EmailRepository,
    @Inject('EmailDeliveryService')
    private readonly emailDeliveryService: EmailDeliveryService,
  ) {}

  async execute(command: SendEmailCommand): Promise<EmailId> {
    const emailId: EmailId = { value: IdGenerator.generateEmailId() };
    const from = new EmailAddress(command.from);
    const to = new EmailAddress(command.to);
    const content = new EmailContent(
      command.subject,
      command.textContent,
      command.htmlContent,
    );

    const email = new Email(emailId, from, to, content);

    try {
      await this.emailRepository.save(email);
      await this.emailDeliveryService.send(email);
      email.markAsSent();
      await this.emailRepository.updateStatus(email);
      return emailId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      email.markAsFailed(errorMessage);
      await this.emailRepository.updateStatus(email);
      throw error;
    }
  }
}
