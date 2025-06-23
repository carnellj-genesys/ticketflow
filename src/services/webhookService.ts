import axios from 'axios';
import type { Ticket } from '../types/ticket';

interface WebhookConfig {
  url: string;
  enabled: boolean;
  timeout: number;
}

interface WebhookPayload {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  issue_title: string;
  issue_description: string;
  status: 'Open' | 'In-progress' | 'Closed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  email: string;
  phone_number: string;
  created: string;
  changed: string;
}

class WebhookService {
  private config: WebhookConfig;

  constructor() {
    this.config = {
      url: import.meta.env.VITE_WEBHOOK_URL || 'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
      enabled: import.meta.env.VITE_WEBHOOK_ENABLED !== 'false', // Default to true, can be explicitly disabled
      timeout: 5000 // 5 second timeout
    };
  }

  private logWebhookRequest(action: string, ticketId: string, url: string) {
    console.group(`🔗 Webhook Request: ${action} for ticket ${ticketId}`);
    console.log('📤 Webhook URL:', url);
    console.log('📤 Webhook Enabled:', this.config.enabled);
    console.groupEnd();
  }

  private logWebhookSuccess(action: string, ticketId: string, response: any) {
    console.group(`✅ Webhook Success: ${action} for ticket ${ticketId}`);
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Status Code:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data:', response.data);
    console.log('📥 Response Body (JSON):', JSON.stringify(response.data, null, 2));
    console.groupEnd();
  }

  private logWebhookError(action: string, ticketId: string, error: any) {
    console.group(`❌ Webhook Error: ${action} for ticket ${ticketId}`);
    console.error('📥 Error Details:', error);
    console.error('📥 Error Message:', error.message);
    if (error.response) {
      console.error('📥 Error Status Code:', error.response.status);
      console.error('📥 Error Status Text:', error.response.statusText);
      console.error('📥 Error Headers:', error.response.headers);
      console.error('📥 Error Data:', error.response.data);
      console.error('📥 Error Body (JSON):', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📥 No Response Received:', error.request);
    } else {
      console.error('📥 Request Setup Error:', error.message);
    }
    console.groupEnd();
  }

  private createPayload(ticket: Ticket, action: 'CREATE' | 'UPDATE' | 'DELETE'): WebhookPayload {
    return {
      id: ticket._id,
      action: action,
      issue_title: ticket.issue_title,
      issue_description: ticket.issue_description,
      status: ticket.status,
      priority: ticket.priority,
      email: ticket.email,
      phone_number: ticket.phone_number,
      created: ticket.created,
      changed: ticket.changed
    };
  }

  private async sendWebhook(payload: WebhookPayload, action: string): Promise<void> {
    if (!this.config.enabled) {
      console.log(`🔗 Webhook disabled, skipping ${action} for ticket ${payload.id}`);
      return;
    }

    this.logWebhookRequest(action, payload.id, this.config.url);

    try {
      const response = await axios.post(this.config.url, payload, {
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.logWebhookSuccess(action, payload.id, response);
    } catch (error) {
      this.logWebhookError(action, payload.id, error);
      throw error;
    }
  }

  // Public methods for different ticket operations
  async notifyTicketCreated(ticket: Ticket): Promise<void> {
    const payload = this.createPayload(ticket, 'CREATE');
    
    // Use setTimeout to make the webhook call asynchronous
    setTimeout(async () => {
      try {
        await this.sendWebhook(payload, 'CREATE');
      } catch (error) {
        // Log error but don't throw - webhook failures shouldn't affect main operation
        console.error('Webhook CREATE failed:', error);
        // Emit a custom event that the App component can listen to
        window.dispatchEvent(new CustomEvent('webhook-error', {
          detail: {
            action: 'CREATE',
            ticketId: ticket._id,
            error: error instanceof Error ? error.message : 'Unknown webhook error'
          }
        }));
      }
    }, 0);
  }

  async notifyTicketUpdated(ticket: Ticket): Promise<void> {
    const payload = this.createPayload(ticket, 'UPDATE');
    
    setTimeout(async () => {
      try {
        await this.sendWebhook(payload, 'UPDATE');
      } catch (error) {
        console.error('Webhook UPDATE failed:', error);
        window.dispatchEvent(new CustomEvent('webhook-error', {
          detail: {
            action: 'UPDATE',
            ticketId: ticket._id,
            error: error instanceof Error ? error.message : 'Unknown webhook error'
          }
        }));
      }
    }, 0);
  }

  async notifyTicketDeleted(ticket: Ticket): Promise<void> {
    const payload = this.createPayload(ticket, 'DELETE');
    
    setTimeout(async () => {
      try {
        await this.sendWebhook(payload, 'DELETE');
      } catch (error) {
        console.error('Webhook DELETE failed:', error);
        window.dispatchEvent(new CustomEvent('webhook-error', {
          detail: {
            action: 'DELETE',
            ticketId: ticket._id,
            error: error instanceof Error ? error.message : 'Unknown webhook error'
          }
        }));
      }
    }, 0);
  }

  // Method to check if webhook is enabled
  isEnabled(): boolean {
    return this.config.enabled;
  }

  // Method to enable/disable webhook at runtime
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🔗 Webhook integration ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Method to get webhook URL (for debugging)
  getWebhookUrl(): string {
    return this.config.url;
  }
}

export const webhookService = new WebhookService(); 