import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SendEmailUseCase } from './application/email/use-cases/send-email.use-case';

export type EmailJobType = 'domain-email';

export interface DomainEmailJobData {
  type: 'domain-email';
  to: string;
  subject: string;
  emailId: string;
  from: string;
  textContent: string;
  htmlContent?: string;
}

export type EmailJobData = DomainEmailJobData;

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} for ${job.data.to}`);

    try {
      if (job.data.type === 'domain-email') {
        await this.sendEmailUseCase.execute({
          from: job.data.from,
          to: job.data.to,
          subject: job.data.subject,
          textContent: job.data.textContent,
          htmlContent: job.data.htmlContent,
        });
      } else {
        // This should never happen with proper typing
        throw new Error(`Unknown email type: ${JSON.stringify(job.data)}`);
      }

      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  }
}
