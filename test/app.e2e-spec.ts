import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('Email Application (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Mock queue for testing
    const mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
      getWaiting: jest.fn().mockResolvedValue([]),
      getActive: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getFailed: jest.fn().mockResolvedValue([]),
    };

    // Mock SendGrid email delivery service
    const mockEmailDeliveryService = {
      send: jest.fn().mockResolvedValue(undefined),
      getTotalEmailsSent: jest.fn().mockReturnValue(5),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getQueueToken('email-queue'),
          useValue: mockQueue,
        },
        {
          provide: 'EmailDeliveryService',
          useValue: mockEmailDeliveryService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/queue/status (GET) - should return queue status', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/queue/status')
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('waiting', 0);
        expect(res.body).toHaveProperty('active', 0);
        expect(res.body).toHaveProperty('completed', 0);
        expect(res.body).toHaveProperty('failed', 0);
      });
  });

  it('/email/stats (GET) - should return email statistics', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/email/stats')
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('totalEmailsSent', 5);
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty(
          'service',
          'Domain-Driven Email Service',
        );
      });
  });
});
