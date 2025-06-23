import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DarkModeToggle } from '../DarkModeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('DarkModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('should render with light mode icon by default', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<DarkModeToggle />);
    
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should render with dark mode icon when theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<DarkModeToggle />);
    
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('should toggle theme when clicked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<DarkModeToggle />);
    
    const toggleButton = screen.getByLabelText('Switch to dark mode');
    
    // Click to switch to dark mode
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    // Click to switch back to light mode
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should respect system preference when no saved theme', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock system preference for dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(<DarkModeToggle />);
    
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply custom className', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<DarkModeToggle className="custom-class" />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('theme-toggle', 'custom-class');
  });
}); 