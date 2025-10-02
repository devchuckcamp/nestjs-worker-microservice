import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationService,
  EmailConfiguration,
  AppConfiguration,
} from './configuration.service';

@Injectable()
export class AppConfigurationService implements ConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  getEmailConfig(): EmailConfiguration {
    return {
      apiKey: this.configService.getOrThrow<string>('SENDGRID_API_KEY'),
      fromEmail: this.configService.getOrThrow<string>('SENDGRID_FROM_EMAIL'),
      maxRetries: this.configService.get<number>('EMAIL_MAX_RETRIES', 3),
      timeout: this.configService.get<number>('EMAIL_TIMEOUT', 30000),
    };
  }

  getAppConfig(): AppConfiguration {
    return {
      port: this.configService.get<number>('PORT', 3001),
      nodeEnv: this.configService.get<string>('NODE_ENV', 'development'),
      redis: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      },
    };
  }

  validateConfiguration(): void {
    // Validate required configurations
    try {
      this.getEmailConfig();
      this.getAppConfig();
    } catch (error) {
      throw new Error(
        `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
