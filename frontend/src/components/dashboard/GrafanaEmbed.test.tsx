import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GrafanaEmbed } from './GrafanaEmbed';

describe('GrafanaEmbed', () => {
  const mockUrl = 'https://grafana.example.com/d/cluster-overview';

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an iframe with the provided URL', () => {
    render(<GrafanaEmbed url={mockUrl} title="Cluster Overview" />);

    const iframe = screen.getByTitle('Cluster Overview');
    expect(iframe).toHaveAttribute('src', mockUrl);
  });

  it('displays a loading state initially', () => {
    render(<GrafanaEmbed url={mockUrl} title="Test Dashboard" />);

    // Loading text "Loading..." is in sr-only, but "Loading dashboard..." is visible
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
  });

  it('hides loading state when iframe loads', async () => {
    render(<GrafanaEmbed url={mockUrl} title="Test Dashboard" />);

    // Loading text should be present initially
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();

    const iframe = screen.getByTitle('Test Dashboard');
    // Simulate iframe load
    await new Promise<void>((resolve) => {
      iframe.dispatchEvent(new Event('load'));
      setTimeout(resolve, 50);
    });

    // Loading text should be gone
    expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument();
  });

  it('shows a note about pending Grafana integration', () => {
    render(<GrafanaEmbed url={mockUrl} title="Pending Dashboard" />);

    // Should always show the pending note
    expect(screen.getByText(/grafana integration pending/i)).toBeInTheDocument();
  });

  it('applies custom height when provided', () => {
    render(<GrafanaEmbed url={mockUrl} title="Custom Height" height="800px" />);

    const container = screen.getByTestId('grafana-embed-container');
    expect(container).toHaveStyle({ height: '800px' });
  });

  it('uses default height when not specified', () => {
    render(<GrafanaEmbed url={mockUrl} title="Default Height" />);

    const container = screen.getByTestId('grafana-embed-container');
    expect(container).toHaveStyle({ height: '600px' });
  });

  it('has accessible title for the iframe', () => {
    render(<GrafanaEmbed url={mockUrl} title="My Dashboard" />);

    const iframe = screen.getByTitle('My Dashboard');
    expect(iframe).toBeInTheDocument();
  });
});
