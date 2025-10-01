import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockQueue = {
      add: jest.fn(),
      getWaiting: jest.fn().mockResolvedValue([]),
      getActive: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getFailed: jest.fn().mockResolvedValue([]),
    };

    const mockEmailDeliveryService = {
      send: jest.fn().mockResolvedValue(undefined),
      getTotalEmailsSent: jest.fn().mockReturnValue(10),
    };

    const app: TestingModule = await Test.createTestingModule({
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

    appController = app.get<AppController>(AppController);
  });

  describe('queue status', () => {
    it('should return queue status', async () => {
      const result = await appController.getQueueStatus();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('email stats', () => {
    it('should return email statistics', () => {
      const result = appController.getEmailStats();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalEmailsSent', 10);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service', 'Domain-Driven Email Service');
    });
  });
});
