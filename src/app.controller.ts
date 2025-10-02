import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { SendGridEmailDeliveryService } from './infrastructure/email/sendgrid-email-delivery.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('EmailDeliveryService')
    private readonly emailDeliveryService: SendGridEmailDeliveryService,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'NestJS Email Worker',
      version: process.env.npm_package_version || '0.0.1',
    };
  }

  @Get('queue/status')
  async getQueueStatus() {
    return this.appService.getQueueStatus();
  }

  @Get('email/stats')
  getEmailStats() {
    return {
      totalEmailsSent: this.emailDeliveryService.getTotalEmailsSent(),
      timestamp: new Date().toISOString(),
      service: 'Domain-Driven Email Service',
    };
  }
}
