import React, { useState, useCallback } from 'react';

export interface GrafanaEmbedProps {
  url: string;
  title: string;
  height?: string;
}

export function GrafanaEmbed({ url, title, height = '600px' }: GrafanaEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="flex items-center justify-center py-12" style={{ height }}>
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3 text-neutral-500 dark:text-neutral-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      )}

      <iframe
        src={url}
        title={title}
        className={`w-full border-0 rounded-xl border border-neutral-200 dark:border-neutral-800 ${isLoading ? 'hidden' : 'block'}`}
        style={{ height }}
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
        data-testid="grafana-embed-container"
      />

      {hasError && (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8"
          style={{ height }}
        >
          <svg className="w-12 h-12 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Dashboard Unavailable
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
            Real Grafana integration is pending. The embed URL will be configured with actual Grafana dashboards once they are available.
          </p>
        </div>
      )}

      <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500 text-center">
        Grafana integration pending — placeholder embed for {title}
      </p>
    </div>
  );
}
