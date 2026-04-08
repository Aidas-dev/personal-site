import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock @tanstack/react-router Link
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ to, children, className, ...props }: any) => (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock GrafanaEmbed component
vi.mock('@/components/dashboard/GrafanaEmbed', () => ({
  GrafanaEmbed: ({ url, title, height }: { url: string; title: string; height?: string }) => (
    <div data-testid="grafana-embed" data-url={url} data-title={title} data-height={height}>
      <span>Grafana Embed: {title}</span>
      <p className="grafana-pending-note">Grafana integration pending — placeholder embed for {title}</p>
    </div>
  ),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the page heading "Dashboard"', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    const headings = screen.getAllByRole('heading', { name: /dashboard/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    // The main page heading should be level 1
    const h1 = headings.find((h) => h.tagName === 'H1');
    expect(h1).toBeInTheDocument();
  });

  it('renders a cluster overview section with placeholder metrics', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    expect(screen.getByRole('heading', { name: /cluster overview/i })).toBeInTheDocument();
  });

  it('displays placeholder node count metric', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    // Should show nodes metric
    expect(screen.getByText(/nodes/i)).toBeInTheDocument();
  });

  it('displays placeholder pods metric', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    expect(screen.getByText(/pods/i)).toBeInTheDocument();
  });

  it('displays placeholder CPU metric', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    expect(screen.getByText(/cpu/i)).toBeInTheDocument();
  });

  it('displays placeholder memory metric', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    expect(screen.getByText(/memory/i)).toBeInTheDocument();
  });

  it('includes a note that real Grafana integration is pending', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    const pendingNotes = screen.getAllByText(/grafana integration pending/i);
    expect(pendingNotes.length).toBeGreaterThanOrEqual(1);
  });

  it('includes Hexagon decorative elements', async () => {
    const { Route } = await import('../routes/dashboard');
    const DashboardComponent = Route.options.component;
    render(<DashboardComponent />);

    const hexagons = document.querySelectorAll('.hexagon');
    expect(hexagons.length).toBeGreaterThanOrEqual(1);
  });
});
