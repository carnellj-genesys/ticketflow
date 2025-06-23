import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render error message', () => {
    const errorMessage = 'This is a test error';
    render(<ErrorBanner error={errorMessage} onClose={mockOnClose} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ErrorBanner error="Test error" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close error message/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<ErrorBanner error="Test error" onClose={mockOnClose} />);

    const banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close error message/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should display the close button with proper styling', () => {
    render(<ErrorBanner error="Test error" onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('close');
  });
}); 