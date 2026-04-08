import type { ProductSortOption } from '@/types';

interface SortDropdownProps {
  onChange: (sortBy: ProductSortOption) => void;
  value?: ProductSortOption;
}

const sortOptions: { value: ProductSortOption; label: string }[] = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export function SortDropdown({ onChange, value }: SortDropdownProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-neutral-700">
        Sort by
      </label>
      <select
        id="sort-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as ProductSortOption)}
        className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
        aria-label="Sort by"
      >
        <option value="">Default</option>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
