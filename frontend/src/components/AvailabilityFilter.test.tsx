import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityFilter } from './AvailabilityFilter';

describe('AvailabilityFilter', () => {
  it('should render availability options', () => {
    render(<AvailabilityFilter onChange={vi.fn()} />);
    expect(screen.getByLabelText('In Stock')).toBeInTheDocument();
    expect(screen.getByLabelText('Low Stock')).toBeInTheDocument();
    expect(screen.getByLabelText('Out of Stock')).toBeInTheDocument();
  });

  it('should call onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(<AvailabilityFilter onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('In Stock'));
    expect(onChange).toHaveBeenCalledWith('in_stock');
  });

  it('should show selected option as active', () => {
    render(<AvailabilityFilter onChange={vi.fn()} value="low_stock" />);
    const lowStockRadio = screen.getByLabelText('Low Stock') as HTMLInputElement;
    expect(lowStockRadio.checked).toBe(true);
  });

  it('should clear selection when Clear button clicked', () => {
    const onChange = vi.fn();
    render(<AvailabilityFilter onChange={onChange} value="in_stock" />);
    fireEvent.click(screen.getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
