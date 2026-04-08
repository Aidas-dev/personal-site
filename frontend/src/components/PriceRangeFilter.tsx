import { useState } from 'react';
import type { Availability } from '@/types';

interface PriceRangeFilterProps {
  onChange: (range: { min?: number; max?: number }) => void;
  min?: number;
  max?: number;
}

export function PriceRangeFilter({ onChange, min, max }: PriceRangeFilterProps) {
  const [minValue, setMinValue] = useState(min?.toString() ?? '');
  const [maxValue, setMaxValue] = useState(max?.toString() ?? '');

  const handleChange = (field: 'min' | 'max', value: string) => {
    if (field === 'min') setMinValue(value);
    else setMaxValue(value);

    const range: { min?: number; max?: number } = {};
    const newMin = field === 'min' ? value : minValue;
    const newMax = field === 'max' ? value : maxValue;

    const parsedMin = parseFloat(newMin);
    if (newMin && !isNaN(parsedMin) && parsedMin >= 0) {
      range.min = parsedMin;
    }

    const parsedMax = parseFloat(newMax);
    if (newMax && !isNaN(parsedMax) && parsedMax >= 0) {
      range.max = parsedMax;
    }

    onChange(range);
  };

  const handleClear = () => {
    setMinValue('');
    setMaxValue('');
    onChange({ min: undefined, max: undefined });
  };

  const hasValues = minValue || maxValue;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">Price Range</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={minValue}
          onChange={(e) => handleChange('min', e.target.value)}
          placeholder="Min"
          min={0}
          className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          aria-label="Min price"
        />
        <span className="text-neutral-400">-</span>
        <input
          type="number"
          value={maxValue}
          onChange={(e) => handleChange('max', e.target.value)}
          placeholder="Max"
          min={0}
          className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          aria-label="Max price"
        />
      </div>
      {hasValues && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-primary-500 hover:text-primary-600"
        >
          Clear
        </button>
      )}
    </div>
  );
}
