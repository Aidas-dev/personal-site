import React from 'react';

export type HexagonSize = 'sm' | 'md' | 'lg';

export interface HexagonProps {
  size?: HexagonSize;
  className?: string;
}

const sizeClasses: Record<HexagonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function Hexagon({ size = 'md', className = '' }: HexagonProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div
      role="presentation"
      className={[
        'hexagon',
        sizeClass,
        'bg-primary-500 dark:bg-primary-400',
        'transition-colors duration-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
