import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './email.processor';
import { EmailModule } from './modules/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
        attempts: 3,
      },
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailProcessor],
})
export class AppModule {}
