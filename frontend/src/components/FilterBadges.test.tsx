import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBadges } from './FilterBadges';

describe('FilterBadges', () => {
  it('should render active filter badges', () => {
    const onRemove = vi.fn();
    render(
      <FilterBadges
        filters={[
          { label: 'Price: €10 - €100', onRemove: () => onRemove('price') },
          { label: 'In Stock', onRemove: () => onRemove('availability') },
        ]}
      />,
    );
    expect(screen.getByText('Price: €10 - €100')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('should call onRemove when badge close button clicked', () => {
    const onRemove = vi.fn();
    render(
      <FilterBadges
        filters={[
          { label: 'Price: €10 - €100', onRemove: () => onRemove('price') },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove Price: €10 - €100 filter' }));
    expect(onRemove).toHaveBeenCalledWith('price');
  });

  it('should render nothing when no active filters', () => {
    const { container } = render(<FilterBadges filters={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render clear all button when multiple filters', () => {
    const onClearAll = vi.fn();
    render(
      <FilterBadges
        filters={[
          { label: 'Price: €10 - €100', onRemove: vi.fn() },
          { label: 'In Stock', onRemove: vi.fn() },
        ]}
        onClearAll={onClearAll}
      />,
    );
    expect(screen.getByText('Clear all')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear all'));
    expect(onClearAll).toHaveBeenCalled();
  });
});
