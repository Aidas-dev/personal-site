import type { HTMLAttributes, ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  success: 'bg-success/10 border-success text-success',
  error: 'bg-error/10 border-error text-error',
  warning: 'bg-warning/10 border-warning text-warning',
  info: 'bg-info/10 border-info text-info',
};

const variantIcons: Record<AlertVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  ...props
}: AlertProps) {
  return (
    <div
      className={`
        flex gap-3 p-4 rounded-lg border-l-4
        ${variantStyles[variant]}
        ${className}
      `}
      role="alert"
      {...props}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {variantIcons[variant]}
      </span>
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
