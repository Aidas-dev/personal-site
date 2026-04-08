interface FilterBadge {
  label: string;
  onRemove: () => void;
}

interface FilterBadgesProps {
  filters: FilterBadge[];
  onClearAll?: () => void;
}

export function FilterBadges({ filters, onClearAll }: FilterBadgesProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((badge) => (
        <span
          key={badge.label}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full border border-primary-200"
        >
          {badge.label}
          <button
            type="button"
            onClick={badge.onRemove}
            className="ml-1 text-primary-400 hover:text-primary-600"
            aria-label={`Remove ${badge.label} filter`}
          >
            x
          </button>
        </span>
      ))}
      {filters.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-neutral-500 hover:text-neutral-700 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
