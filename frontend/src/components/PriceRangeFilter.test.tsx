import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceRangeFilter } from './PriceRangeFilter';

describe('PriceRangeFilter', () => {
  it('should render with min and max inputs', () => {
    render(<PriceRangeFilter onChange={vi.fn()} />);
    expect(screen.getByLabelText('Min price')).toBeInTheDocument();
    expect(screen.getByLabelText('Max price')).toBeInTheDocument();
  });

  it('should call onChange with price range values', () => {
    const onChange = vi.fn();
    render(<PriceRangeFilter onChange={onChange} />);
    const minInput = screen.getByLabelText('Min price') as HTMLInputElement;
    const maxInput = screen.getByLabelText('Max price') as HTMLInputElement;

    fireEvent.change(minInput, { target: { value: '10' } });
    fireEvent.change(maxInput, { target: { value: '100' } });

    expect(onChange).toHaveBeenCalledWith({ min: 10, max: 100 });
  });

  it('should display initial values', () => {
    render(<PriceRangeFilter onChange={vi.fn()} min={20} max={80} />);
    expect((screen.getByLabelText('Min price') as HTMLInputElement).value).toBe('20');
    expect((screen.getByLabelText('Max price') as HTMLInputElement).value).toBe('80');
  });

  it('should clear price range when clear button clicked', () => {
    const onChange = vi.fn();
    render(<PriceRangeFilter onChange={onChange} min={20} max={80} />);
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith({ min: undefined, max: undefined });
  });
});
