import axios from 'axios';

class WebhookService {
  constructor() {
    this.config = {
      url: process.env.VITE_WEBHOOK_URL || 'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
      enabled: process.env.VITE_WEBHOOK_ENABLED !== 'false',
      timeout: parseInt(process.env.VITE_WEBHOOK_TIMEOUT || '5000')
    };
    
    console.log('🔗 Backend Webhook Service Initialized:');
    console.log('📤 Webhook URL:', this.config.url);
    console.log('📤 Webhook Enabled:', this.config.enabled);
  }

  logWebhookRequest(action, ticketId, url) {
    console.group(`🔗 Backend Webhook Request: ${action} for ticket ${ticketId}`);
    console.log('📤 Webhook URL:', url);
    console.log('📤 Webhook Enabled:', this.config.enabled);
    console.groupEnd();
  }

  logWebhookSuccess(action, ticketId, response) {
    console.group(`✅ Backend Webhook Success: ${action} for ticket ${ticketId}`);
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data:', response.data);
    console.groupEnd();
  }

  logWebhookError(action, ticketId, error) {
    console.group(`❌ Backend Webhook Error: ${action} for ticket ${ticketId}`);
    console.error('📥 Error Details:', error);
    console.error('📥 Error Message:', error.message);
    if (error.response) {
      console.error('📥 Error Status Code:', error.response.status);
      console.error('📥 Error Status Text:', error.response.statusText);
      console.error('📥 Error Headers:', error.response.headers);
      console.error('📥 Error Data:', error.response.data);
    } else if (error.request) {
      console.error('📥 No Response Received:', error.request);
    } else {
      console.error('📥 Request Setup Error:', error.message);
    }
    console.groupEnd();
  }

  createPayload(ticket, action) {
    return {
      id: ticket._id,
      action: action,
      issue_title: ticket.issue_title,
      issue_description: ticket.issue_description,
      status: ticket.status,
      priority: ticket.priority,
      email: ticket.email,
      phone_number: ticket.phone_number,
      notes: ticket.notes,
      created: ticket.created,
      changed: ticket.changed
    };
  }

  async sendWebhook(payload, action) {
    if (!this.config.enabled) {
      console.log(`🔗 Backend Webhook disabled, skipping ${action} for ticket ${payload.id}`);
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
      // Don't throw error - webhook failures shouldn't break the main flow
      console.warn(`⚠️ Webhook notification failed for ${action} ticket ${payload.id}, but continuing...`);
    }
  }

  // Public methods for different ticket operations
  async notifyTicketCreated(ticket) {
    const payload = this.createPayload(ticket, 'CREATE');
    await this.sendWebhook(payload, 'CREATE');
  }

  async notifyTicketUpdated(ticket) {
    const payload = this.createPayload(ticket, 'UPDATE');
    await this.sendWebhook(payload, 'UPDATE');
  }

  async notifyTicketDeleted(ticket) {
    const payload = this.createPayload(ticket, 'DELETE');
    await this.sendWebhook(payload, 'DELETE');
  }

  // Configuration methods
  isEnabled() {
    return this.config.enabled;
  }

  setEnabled(enabled) {
    this.config.enabled = enabled;
    console.log(`🔗 Backend Webhook ${enabled ? 'enabled' : 'disabled'}`);
  }

  getWebhookUrl() {
    return this.config.url;
  }

  setWebhookUrl(url) {
    this.config.url = url;
    console.log(`🔗 Backend Webhook URL updated to: ${url}`);
  }
}

export const webhookService = new WebhookService(); 