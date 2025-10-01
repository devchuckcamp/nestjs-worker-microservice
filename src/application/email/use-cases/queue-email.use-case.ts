import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { EmailRepository } from '../../../domain/email/repositories/email.repository';
import { Email, EmailId } from '../../../domain/email/entities/email.entity';
import { EmailAddress } from '../../../domain/email/value-objects/email-address';
import { EmailContent } from '../../../domain/email/value-objects/email-content';

export interface QueueEmailCommand {
  from: string;
  to: string;
  subject: string;
  textContent: string;
  htmlContent?: string;
  priority?: number;
  delay?: number;
}

@Injectable()
export class QueueEmailUseCase {
  constructor(
    @Inject('EmailRepository')
    private readonly emailRepository: EmailRepository,
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
  ) {}

  async execute(command: QueueEmailCommand): Promise<EmailId> {
    // Create email entity and save to repository
    const emailId: EmailId = { value: this.generateId() };
    const from = new EmailAddress(command.from);
    const to = new EmailAddress(command.to);
    const content = new EmailContent(
      command.subject,
      command.textContent,
      command.htmlContent,
    );

    const email = new Email(emailId, from, to, content);
    await this.emailRepository.save(email);

    // Queue the email for processing
    const jobData = {
      type: 'domain-email',
      emailId: emailId.value,
      from: command.from,
      to: command.to,
      subject: command.subject,
      textContent: command.textContent,
      htmlContent: command.htmlContent,
    };

    await this.emailQueue.add('send-domain-email', jobData, {
      priority: command.priority || 1,
      delay: command.delay || 0,
    });

    return emailId;
  }

  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
