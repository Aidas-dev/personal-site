import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortDropdown } from './SortDropdown';
import type { ProductSortOption } from '@/types';

describe('SortDropdown', () => {
  it('should render sort options', () => {
    render(<SortDropdown onChange={vi.fn()} />);
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
  });

  it('should call onChange when option selected', () => {
    const onChange = vi.fn();
    render(<SortDropdown onChange={onChange} />);
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'price_asc' } });
    expect(onChange).toHaveBeenCalledWith('price_asc');
  });

  it('should show initial value', () => {
    render(<SortDropdown onChange={vi.fn()} value="name_desc" />);
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(select.value).toBe('name_desc');
  });
});
