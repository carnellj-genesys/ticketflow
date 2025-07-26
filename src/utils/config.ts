// Simple configuration using environment variables
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/rest',
    apiKey: import.meta.env.VITE_API_KEY || '68544b73bb5cccc333f6d956',
    corsApiKey: import.meta.env.VITE_CORS_API_KEY || '68544b73bb5cccc333f6d956'
  },
  webhook: {
    enabled: import.meta.env.VITE_WEBHOOK_ENABLED !== 'false',
    url: import.meta.env.VITE_WEBHOOK_URL || 'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
    timeout: parseInt(import.meta.env.VITE_WEBHOOK_TIMEOUT || '5000')
  }
};

// Simple getters for backward compatibility
export const getApiConfig = () => config.api;
export const getWebhookConfig = () => config.webhook; 