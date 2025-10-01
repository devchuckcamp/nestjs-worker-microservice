import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import request from 'supertest';
import { EmailController } from '../src/presentation/email/controllers/email.controller';
import { QueueEmailUseCase } from '../src/application/email/use-cases/queue-email.use-case';

describe('EmailController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Mock queue for testing
    const mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    };

    // Mock QueueEmailUseCase
    const mockQueueEmailUseCase = {
      execute: jest.fn().mockResolvedValue({ value: 'test-email-id' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: QueueEmailUseCase,
          useValue: mockQueueEmailUseCase,
        },
        {
          provide: getQueueToken('email-queue'),
          useValue: mockQueue,
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

  it('/email/send (POST) - should queue email successfully', () => {
    const emailData = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      textContent: 'This is a test email',
      htmlContent: '<p>This is a test email</p>',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/email/send')
      .send(emailData)
      .expect(201)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('emailId', 'test-email-id');
        expect(res.body).toHaveProperty('message', 'Email queued successfully');
      });
  });

  it('/email/send (POST) - should validate required fields', () => {
    const invalidEmailData = {
      from: 'test@example.com',
      // missing 'to', 'subject', 'textContent'
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/email/send')
      .send(invalidEmailData)
      .expect(400);
  });

  it('/email/send (POST) - should validate email format', () => {
    const invalidEmailData = {
      from: 'invalid-email',
      to: 'invalid-email',
      subject: 'Test Email',
      textContent: 'This is a test email',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/email/send')
      .send(invalidEmailData)
      .expect(400);
  });
});