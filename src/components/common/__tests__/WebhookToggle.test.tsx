import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { WebhookToggle } from '../WebhookToggle';
import { webhookService } from '../../../services/webhookService';

// Mock the webhook service
vi.mock('../../../services/webhookService', () => ({
  webhookService: {
    getStatus: vi.fn(),
    setEnabled: vi.fn()
  }
}));

describe('WebhookToggle', () => {
  const mockWebhookService = vi.mocked(webhookService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders enabled state correctly', async () => {
    mockWebhookService.getStatus.mockResolvedValue(true);

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('webhook-toggle-small', 'enabled');
      expect(button).toHaveAttribute('aria-label', 'Webhook integration enabled. Click to disable.');
      expect(button).toHaveAttribute('title', 'Webhook integration enabled');
    });
  });

  it('renders disabled state correctly', async () => {
    mockWebhookService.getStatus.mockResolvedValue(false);

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('webhook-toggle-small', 'disabled');
      expect(button).toHaveAttribute('aria-label', 'Webhook integration disabled. Click to enable.');
      expect(button).toHaveAttribute('title', 'Webhook integration disabled');
    });
  });

  it('shows loading state initially', () => {
    mockWebhookService.getStatus.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<WebhookToggle />);

    expect(document.querySelector('.webhook-toggle-small-skeleton')).toBeInTheDocument();
  });

  it('toggles webhook state when clicked', async () => {
    mockWebhookService.getStatus.mockResolvedValue(false);
    mockWebhookService.setEnabled.mockResolvedValue();

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled');
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWebhookService.setEnabled).toHaveBeenCalledWith(true);
    });
  });

  it('calls onToggle callback when state changes', async () => {
    const onToggle = vi.fn();
    mockWebhookService.getStatus.mockResolvedValue(true);
    mockWebhookService.setEnabled.mockResolvedValue();

    render(<WebhookToggle onToggle={onToggle} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('enabled');
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(false);
    });
  });

  it('reverts state if backend update fails', async () => {
    mockWebhookService.getStatus.mockResolvedValue(true);
    mockWebhookService.setEnabled.mockRejectedValue(new Error('Network error'));

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('enabled');
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should revert to enabled state after failed update
    await waitFor(() => {
      expect(button).toHaveClass('enabled');
    });
  });
}); 