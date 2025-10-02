export interface EmailConfiguration {
  apiKey: string;
  fromEmail: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AppConfiguration {
  port: number;
  nodeEnv: string;
  redis: {
    host: string;
    port: number;
  };
}

export interface ConfigurationService {
  getEmailConfig(): EmailConfiguration;
  getAppConfig(): AppConfiguration;
  validateConfiguration(): void;
}
