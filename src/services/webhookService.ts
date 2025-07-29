import axios from 'axios';
import { config } from '../utils/config';

interface WebhookStatus {
  enabled: boolean;
}

class WebhookService {
  private baseUrl: string;
  private apiKey: string;
  private corsApiKey: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.apiKey = config.api.apiKey;
    this.corsApiKey = config.api.corsApiKey;
    console.log('🔗 WebhookService: Using baseUrl:', this.baseUrl);
    console.log('🔗 WebhookService: Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  }

  private getHeaders() {
    return {
      'x-apikey': this.apiKey,
      'CORS-API-Key': this.corsApiKey,
      'Content-Type': 'application/json',
      'host_header': 'apicall'
    };
  }

  async getStatus(): Promise<boolean> {
    try {
      console.log('🔗 Frontend: Getting webhook status from:', `${this.baseUrl}/webhook/status`);
      const response = await axios.get<WebhookStatus>(`${this.baseUrl}/webhook/status`, {
        headers: this.getHeaders()
      });
      console.log('🔗 Frontend: Webhook status response:', response.data);
      return response.data.enabled;
    } catch (error) {
      console.error('❌ Error getting webhook status:', error);
      return false; // Default to disabled on error
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    try {
      console.log('🔗 Frontend: Setting webhook status to:', enabled);
      const response = await axios.put<WebhookStatus>(`${this.baseUrl}/webhook/status`, 
        { enabled }, 
        { headers: this.getHeaders() }
      );
      console.log('🔗 Frontend: Webhook status update response:', response.data);
      console.log(`🔗 Webhook ${enabled ? 'enabled' : 'disabled'} via frontend`);
    } catch (error) {
      console.error('❌ Error updating webhook status:', error);
      throw error;
    }
  }

  // Convenience methods for backward compatibility
  async isEnabled(): Promise<boolean> {
    return this.getStatus();
  }
}

export const webhookService = new WebhookService(); 