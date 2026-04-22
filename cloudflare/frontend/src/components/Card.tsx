import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'product' | 'info' | 'action';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hexagonBorder?: boolean;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  product: 'bg-white shadow-md hover:shadow-lg transition-shadow',
  info: 'bg-neutral-50 border border-neutral-200',
  action: 'bg-primary-50 border-2 border-primary-200 hover:border-primary-400 transition-colors',
};

const hexagonBorderStyles =
  'clip-[polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]';

export function Card({
  variant = 'info',
  hexagonBorder = false,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl p-6
        ${variantStyles[variant]}
        ${hexagonBorder ? hexagonBorderStyles : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
