// Simple configuration using environment variables with runtime override support
const getRuntimeConfig = () => {
  // Check for runtime configuration (useful for Docker deployments)
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__) {
    return (window as any).__RUNTIME_CONFIG__;
  }
  return null;
};

export const config = {
  api: {
    baseUrl: getRuntimeConfig()?.api?.baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/rest',
    apiKey: getRuntimeConfig()?.api?.apiKey || import.meta.env.VITE_API_KEY || '68544b73bb5cccc333f6d956',
    corsApiKey: getRuntimeConfig()?.api?.corsApiKey || import.meta.env.VITE_CORS_API_KEY || '68544b73bb5cccc333f6d956'
  }
};

// Debug logging
console.log('🔗 Config: VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);
console.log('🔗 Config: Runtime config:', getRuntimeConfig());
console.log('🔗 Config: Final baseUrl:', config.api.baseUrl);

// Simple getters for backward compatibility
export const getApiConfig = () => config.api; 