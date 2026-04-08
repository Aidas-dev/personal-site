import type { Availability } from '@/types';

interface AvailabilityFilterProps {
  onChange: (availability?: Availability) => void;
  value?: Availability;
}

const options: { value: Availability; label: string }[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export function AvailabilityFilter({ onChange, value }: AvailabilityFilterProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">Availability</label>
      <div className="space-y-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="availability"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="text-primary-500 focus:ring-primary-500"
              aria-label={option.label}
            />
            <span className="text-sm text-neutral-700">{option.label}</span>
          </label>
        ))}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs text-primary-500 hover:text-primary-600"
        >
          Clear
        </button>
      )}
    </div>
  );
}
