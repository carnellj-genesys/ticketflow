interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  corsApiKey: string;
}

interface WebhookConfig {
  enabled: boolean;
  url: string;
  timeout: number;
}

interface CorsConfig {
  origins: string[];
  methods: string[];
  headers: string[];
}

interface ServerConfig {
  port: number;
  cors: CorsConfig;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableRequestLogging: boolean;
  enableResponseLogging: boolean;
}

interface EnvironmentConfig {
  api: ApiConfig;
  webhook: WebhookConfig;
  server: ServerConfig;
  logging: LoggingConfig;
}

interface Config {
  development: EnvironmentConfig;
  production: EnvironmentConfig;
}

class ConfigManager {
  private config: Config | null = null;
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  async loadConfig(): Promise<void> {
    try {
      const response = await fetch('/config.json');
      this.config = await response.json();
      console.log(`📋 Configuration loaded for environment: ${this.environment}`);
    } catch (error) {
      console.error('❌ Failed to load configuration file:', error);
      // Fallback to environment variables
      this.config = this.getFallbackConfig();
    }
  }

  private getFallbackConfig(): Config {
    return {
      development: {
        api: {
          baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3001/rest',
          apiKey: process.env.VITE_API_KEY || '68544b73bb5cccc333f6d956',
          corsApiKey: process.env.VITE_CORS_API_KEY || '68544b73bb5cccc333f6d956'
        },
        webhook: {
          enabled: process.env.VITE_WEBHOOK_ENABLED !== 'false',
          url: process.env.VITE_WEBHOOK_URL || 'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
          timeout: parseInt(process.env.VITE_WEBHOOK_TIMEOUT || '5000')
        },
        server: {
          port: parseInt(process.env.PORT || '3001'),
          cors: {
            origins: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            headers: ['Content-Type', 'x-apikey', 'CORS-API-Key', 'Authorization']
          }
        },
        logging: {
          level: 'debug',
          enableRequestLogging: true,
          enableResponseLogging: true
        }
      },
      production: {
        api: {
          baseUrl: process.env.VITE_API_BASE_URL || 'https://api.ticketflow.com/rest',
          apiKey: process.env.VITE_API_KEY || 'production-api-key',
          corsApiKey: process.env.VITE_CORS_API_KEY || 'production-cors-key'
        },
        webhook: {
          enabled: process.env.VITE_WEBHOOK_ENABLED !== 'false',
          url: process.env.VITE_WEBHOOK_URL || 'https://api.genesys.com/webhook/tickets',
          timeout: parseInt(process.env.VITE_WEBHOOK_TIMEOUT || '10000')
        },
        server: {
          port: parseInt(process.env.PORT || '3001'),
          cors: {
            origins: ['https://ticketflow.com'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            headers: ['Content-Type', 'x-apikey', 'CORS-API-Key', 'Authorization']
          }
        },
        logging: {
          level: 'info',
          enableRequestLogging: false,
          enableResponseLogging: false
        }
      }
    };
  }

  getApiConfig(): ApiConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config[this.environment as keyof Config].api;
  }

  getWebhookConfig(): WebhookConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config[this.environment as keyof Config].webhook;
  }

  getServerConfig(): ServerConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config[this.environment as keyof Config].server;
  }

  getLoggingConfig(): LoggingConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config[this.environment as keyof Config].logging;
  }

  getEnvironment(): string {
    return this.environment;
  }

  isDevelopment(): boolean {
    return this.environment === 'development';
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }
}

export const configManager = new ConfigManager(); 