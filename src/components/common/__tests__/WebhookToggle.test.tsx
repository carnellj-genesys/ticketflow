import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WebhookToggle } from '../WebhookToggle';
import { webhookService } from '../../../services/webhookService';

// Mock the webhook service
vi.mock('../../../services/webhookService', () => ({
  webhookService: {
    isEnabled: vi.fn(),
    setEnabled: vi.fn()
  }
}));

describe('WebhookToggle', () => {
  const mockWebhookService = vi.mocked(webhookService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with enabled state', async () => {
    mockWebhookService.isEnabled.mockReturnValue(true);

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('webhook-toggle-small', 'enabled');
      expect(button).toHaveAttribute('aria-label', 'Webhook integration enabled. Click to disable.');
      expect(button).toHaveAttribute('title', 'Webhook integration enabled');
    });
  });

  it('renders with disabled state', async () => {
    mockWebhookService.isEnabled.mockReturnValue(false);

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('webhook-toggle-small', 'disabled');
      expect(button).toHaveAttribute('aria-label', 'Webhook integration disabled. Click to enable.');
      expect(button).toHaveAttribute('title', 'Webhook integration disabled');
    });
  });

  it('shows loading skeleton initially', async () => {
    mockWebhookService.isEnabled.mockReturnValue(true);

    render(<WebhookToggle />);

    // Should show skeleton initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('.webhook-toggle-small-skeleton')).toBeInTheDocument();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('toggles webhook state when clicked', async () => {
    mockWebhookService.isEnabled.mockReturnValue(false);

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled');
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockWebhookService.setEnabled).toHaveBeenCalledWith(true);
  });

  it('calls onToggle callback when toggled', async () => {
    const onToggle = vi.fn();
    mockWebhookService.isEnabled.mockReturnValue(true);

    render(<WebhookToggle onToggle={onToggle} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('displays link icon', async () => {
    mockWebhookService.isEnabled.mockReturnValue(true);

    render(<WebhookToggle />);

    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });
  });

  it('has proper accessibility attributes', async () => {
    mockWebhookService.isEnabled.mockReturnValue(true);

    render(<WebhookToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('title');
    });
  });
}); 