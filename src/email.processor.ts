import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SendEmailUseCase } from './application/email/use-cases/send-email.use-case';

export interface EmailJobData {
  type: 'domain-email';
  to: string;
  subject?: string;
  // For domain email jobs
  emailId?: string;
  from?: string;
  textContent?: string;
  htmlContent?: string;
}

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} for ${job.data.to}`);

    try {
      switch (job.data.type) {
        case 'domain-email':
          if (
            !job.data.from ||
            !job.data.to ||
            !job.data.subject ||
            !job.data.textContent
          ) {
            throw new Error(
              'From, to, subject, and textContent are required for domain email',
            );
          }
          await this.sendEmailUseCase.execute({
            from: job.data.from,
            to: job.data.to,
            subject: job.data.subject,
            textContent: job.data.textContent,
            htmlContent: job.data.htmlContent,
          });
          break;

        default:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          throw new Error(`Unknown email type: ${(job.data as any).type}`);
      }

      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  }
}
