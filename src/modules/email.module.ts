import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SendEmailUseCase } from '../application/email/use-cases/send-email.use-case';
import { QueueEmailUseCase } from '../application/email/use-cases/queue-email.use-case';
import { InMemoryEmailRepository } from '../infrastructure/email/in-memory-email.repository';
import { SendGridEmailDeliveryService } from '../infrastructure/email/sendgrid-email-delivery.service';
import { EmailController } from '../presentation/email/controllers/email.controller';

const EMAIL_REPOSITORY = 'EmailRepository';
const EMAIL_DELIVERY_SERVICE = 'EmailDeliveryService';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [EmailController],
  providers: [
    SendEmailUseCase,
    QueueEmailUseCase,
    {
      provide: EMAIL_REPOSITORY,
      useClass: InMemoryEmailRepository,
    },
    {
      provide: EMAIL_DELIVERY_SERVICE,
      useClass: SendGridEmailDeliveryService,
    },
  ],
  exports: [SendEmailUseCase, QueueEmailUseCase, EMAIL_DELIVERY_SERVICE],
})
export class EmailModule {}
