/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { EmailDeliveryService } from '../../application/email/services/email-delivery.service';
import { Email } from '../../domain/email/entities/email.entity';

const sgMail = require('@sendgrid/mail');

@Injectable()
export class SendGridEmailDeliveryService implements EmailDeliveryService {
  private readonly logger = new Logger(SendGridEmailDeliveryService.name);
  private totalEmailsSent: number = 0;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }
    sgMail.setApiKey(apiKey);
    this.logger.log('SendGrid Email Delivery Service initialized');
  }

  async send(email: Email): Promise<void> {
    const msg = {
      to: email.getTo().getValue(),
      from: email.getFrom().getValue(),
      subject: email.getContent().getSubject(),
      text: email.getContent().getTextContent(),
      html: email.getContent().hasHtmlContent()
        ? email.getContent().getHtmlContent()
        : undefined,
    };

    this.logger.log(
      `Attempting to send email to ${msg.to} with subject: ${msg.subject}`,
    );
    this.logger.debug(`Email message: ${JSON.stringify(msg, null, 2)}`);

    try {
      const result = await sgMail.send(msg);
      this.totalEmailsSent++;
      this.logger.log(
        `Email sent successfully to ${msg.to}. Response: ${JSON.stringify(result)}`,
      );
      this.logger.log(`📊 Total emails sent: ${this.totalEmailsSent}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${msg.to}:`, error);

      // Log more detailed error information
      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          this.logger.error(
            'SendGrid Response Error:',
            error.response.body || error.response,
          );
        }
        if ('message' in error) {
          this.logger.error('Error Message:', error.message);
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  getTotalEmailsSent(): number {
    return this.totalEmailsSent;
  }
}
