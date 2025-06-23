import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Ticket } from '../../types/ticket';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true
});

// Mock environment variables
const originalEnv = process.env;

describe('WebhookService', () => {
  const mockTicket: Ticket = {
    _id: '1',
    issue_title: 'Test Ticket',
    issue_description: 'Test Description',
    status: 'Open',
    priority: 'Medium',
    email: 'test@example.com',
    phone_number: '+15551234567',
    created: '2024-01-15T10:30:00.000Z',
    changed: '2024-01-15T10:30:00.000Z'
  };

  let webhookService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset environment variables
    process.env = { ...originalEnv };
    
    // Clear module cache to force re-import with new env vars
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  describe('notifyTicketCreated', () => {
    it('should send webhook notification for ticket creation when enabled', async () => {
      // Enable webhooks for this test
      process.env.VITE_WEBHOOK_ENABLED = 'true';
      
      // Re-import the service with new environment
      const { webhookService: service } = await import('../webhookService');
      webhookService = service;
      
      const axios = await import('axios');
      const mockResponse = { status: 200, data: { success: true } };
      vi.mocked(axios.default.post).mockResolvedValue(mockResponse);

      await webhookService.notifyTicketCreated(mockTicket);

      // Fast-forward timers to trigger setTimeout
      vi.runAllTimers();

      expect(axios.default.post).toHaveBeenCalledWith(
        'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
        {
          id: '1',
          action: 'CREATE',
          issue_title: 'Test Ticket',
          issue_description: 'Test Description',
          status: 'Open',
          priority: 'Medium',
          email: 'test@example.com',
          phone_number: '+15551234567',
          created: '2024-01-15T10:30:00.000Z',
          changed: '2024-01-15T10:30:00.000Z'
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should handle webhook errors gracefully when enabled', async () => {
      // Enable webhooks for this test
      process.env.VITE_WEBHOOK_ENABLED = 'true';
      
      // Re-import the service with new environment
      const { webhookService: service } = await import('../webhookService');
      webhookService = service;
      
      vi.useRealTimers();
      const axios = await import('axios');
      const error = new Error('Webhook failed');
      vi.mocked(axios.default.post).mockRejectedValue(error);

      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await webhookService.notifyTicketCreated(mockTicket);

      // Wait for the async setTimeout to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith('Webhook CREATE failed:', error);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'webhook-error',
          detail: {
            action: 'CREATE',
            ticketId: '1',
            error: 'Webhook failed'
          }
        })
      );

      consoleSpy.mockRestore();
    }, 10000);

    it('should skip webhook calls when disabled', async () => {
      // Explicitly disable webhooks for this test
      process.env.VITE_WEBHOOK_ENABLED = 'false';
      
      // Re-import the service with new environment
      const { webhookService: service } = await import('../webhookService');
      webhookService = service;
      
      const axios = await import('axios');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await webhookService.notifyTicketCreated(mockTicket);
      vi.runAllTimers();

      expect(axios.default.post).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🔗 Webhook disabled, skipping CREATE for ticket 1');

      consoleSpy.mockRestore();
    });
  });

  describe('notifyTicketUpdated', () => {
    it('should send webhook notification for ticket updates when enabled', async () => {
      // Enable webhooks for this test
      process.env.VITE_WEBHOOK_ENABLED = 'true';
      
      // Re-import the service with new environment
      const { webhookService: service } = await import('../webhookService');
      webhookService = service;
      
      const axios = await import('axios');
      const mockResponse = { status: 200, data: { success: true } };
      vi.mocked(axios.default.post).mockResolvedValue(mockResponse);

      await webhookService.notifyTicketUpdated(mockTicket);
      vi.runAllTimers();

      expect(axios.default.post).toHaveBeenCalledWith(
        'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
        expect.objectContaining({
          id: '1',
          action: 'UPDATE',
          issue_title: 'Test Ticket'
        }),
        expect.any(Object)
      );
    });
  });

  describe('notifyTicketDeleted', () => {
    it('should send webhook notification for ticket deletion when enabled', async () => {
      // Enable webhooks for this test
      process.env.VITE_WEBHOOK_ENABLED = 'true';
      
      // Re-import the service with new environment
      const { webhookService: service } = await import('../webhookService');
      webhookService = service;
      
      const axios = await import('axios');
      const mockResponse = { status: 200, data: { success: true } };
      vi.mocked(axios.default.post).mockResolvedValue(mockResponse);

      await webhookService.notifyTicketDeleted(mockTicket);
      vi.runAllTimers();

      expect(axios.default.post).toHaveBeenCalledWith(
        'https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events',
        expect.objectContaining({
          id: '1',
          action: 'DELETE',
          issue_title: 'Test Ticket'
        }),
        expect.any(Object)
      );
    });
  });

  describe('configuration', () => {
    it('should be disabled by default when VITE_WEBHOOK_ENABLED is set to false', async () => {
      process.env.VITE_WEBHOOK_ENABLED = 'false';
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.isEnabled()).toBe(false);
    });

    it('should be enabled by default when VITE_WEBHOOK_ENABLED is not set', async () => {
      delete process.env.VITE_WEBHOOK_ENABLED;
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.isEnabled()).toBe(true);
    });

    it('should be enabled when VITE_WEBHOOK_ENABLED is set to true', async () => {
      process.env.VITE_WEBHOOK_ENABLED = 'true';
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.isEnabled()).toBe(true);
    });

    it('should use custom webhook URL when VITE_WEBHOOK_URL is set', async () => {
      process.env.VITE_WEBHOOK_URL = 'https://custom-webhook.com/api';
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.getWebhookUrl()).toBe('https://custom-webhook.com/api');
    });

    it('should use default webhook URL when VITE_WEBHOOK_URL is not set', async () => {
      delete process.env.VITE_WEBHOOK_URL;
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.getWebhookUrl()).toBe('https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events');
    });
  });

  describe('setEnabled', () => {
    it('should enable webhook when setEnabled(true) is called', async () => {
      process.env.VITE_WEBHOOK_ENABLED = 'false';
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.isEnabled()).toBe(false);
      
      service.setEnabled(true);
      
      expect(service.isEnabled()).toBe(true);
    });

    it('should disable webhook when setEnabled(false) is called', async () => {
      process.env.VITE_WEBHOOK_ENABLED = 'true';
      
      const { webhookService: service } = await import('../webhookService');
      
      expect(service.isEnabled()).toBe(true);
      
      service.setEnabled(false);
      
      expect(service.isEnabled()).toBe(false);
    });
  });
}); 