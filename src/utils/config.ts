// Simple configuration using environment variables
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/rest',
    apiKey: import.meta.env.VITE_API_KEY || '68544b73bb5cccc333f6d956',
    corsApiKey: import.meta.env.VITE_CORS_API_KEY || '68544b73bb5cccc333f6d956'
  }
};

// Debug logging
console.log('🔗 Config: VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);
console.log('🔗 Config: Final baseUrl:', config.api.baseUrl);

// Simple getters for backward compatibility
export const getApiConfig = () => config.api; 