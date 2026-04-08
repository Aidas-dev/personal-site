import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should render search input with label', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByLabelText('Search products')).toBeInTheDocument();
  });

  it('should display search query in input', () => {
    render(<SearchBar onSearch={vi.fn()} initialQuery="brake" />);
    const input = screen.getByLabelText('Search products') as HTMLInputElement;
    expect(input.value).toBe('brake');
  });

  it('should show search icon (hidden from screen readers)', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    // Search icon should not be accessible by label (aria-hidden)
    expect(screen.queryByLabelText('Search')).not.toBeInTheDocument();
  });

  it('should call onSearch immediately when no debounce', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={0} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'brake' } });
    // setTimeout(fn, 0) still runs on next tick
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(onSearch).toHaveBeenCalledWith('brake');
  });

  it('should clear search when clear button clicked', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} initialQuery="test" />);
    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearButton);
    const input = screen.getByLabelText('Search products') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('should not show clear button when query is empty', () => {
    render(<SearchBar onSearch={vi.fn()} initialQuery="" />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('should show clear button when query is not empty', () => {
    render(<SearchBar onSearch={vi.fn()} initialQuery="test" />);
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });
});

describe('SearchBar debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call onSearch after debounce delay', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);
    const input = screen.getByLabelText('Search products');

    fireEvent.change(input, { target: { value: 'brake' } });
    expect(onSearch).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith('brake');
  });

  it('should debounce rapid typing', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);
    const input = screen.getByLabelText('Search products');

    fireEvent.change(input, { target: { value: 'b' } });
    fireEvent.change(input, { target: { value: 'br' } });
    fireEvent.change(input, { target: { value: 'bra' } });
    fireEvent.change(input, { target: { value: 'brake' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('brake');
  });
});
