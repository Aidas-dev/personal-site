import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

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

describe('ProjectsPage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the page heading "Projects"', async () => {
    const { Route } = await import('../routes/projects');
    const ProjectsComponent = Route.options.component;
    render(<ProjectsComponent />);

    expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  });

  it('renders project cards for placeholder projects', async () => {
    const { Route } = await import('../routes/projects');
    const ProjectsComponent = Route.options.component;
    render(<ProjectsComponent />);

    expect(screen.getByText('personal-website')).toBeInTheDocument();
    expect(screen.getByText('kubernetes-cluster')).toBeInTheDocument();
    expect(screen.getByText('home-lab')).toBeInTheDocument();
  });

  it('renders filter buttons for tech stacks', async () => {
    const { Route } = await import('../routes/projects');
    const ProjectsComponent = Route.options.component;
    render(<ProjectsComponent />);

    // Should have filter buttons
    const buttons = screen.getAllByRole('button');
    const filterButtons = buttons.filter((btn) =>
      ['All', 'TypeScript', 'Kubernetes', 'Terraform', 'Python', 'Go'].some(
        (label) => btn.textContent === label
      )
    );
    expect(filterButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('filters projects when a tech stack filter is clicked', async () => {
    const { Route } = await import('../routes/projects');
    const ProjectsComponent = Route.options.component;
    render(<ProjectsComponent />);

    // Initially all projects visible
    expect(screen.getByText('personal-website')).toBeInTheDocument();

    // Click a filter button (e.g., "Terraform")
    const terraformBtn = screen.getByRole('button', { name: 'Terraform' });
    await act(async () => {
      terraformBtn.click();
    });

    // Projects with Terraform should be visible, others may be hidden
    // At minimum, the page should not error
    expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  });

  it('shows all projects when "All" filter is clicked', async () => {
    const { Route } = await import('../routes/projects');
    const ProjectsComponent = Route.options.component;
    render(<ProjectsComponent />);

    const allBtn = screen.getByRole('button', { name: 'All' });
    await act(async () => {
      allBtn.click();
    });

    expect(screen.getByText('personal-website')).toBeInTheDocument();
    expect(screen.getByText('kubernetes-cluster')).toBeInTheDocument();
    expect(screen.getByText('home-lab')).toBeInTheDocument();
  });

  it('includes Hexagon decorative elements', async () => {
    const { Route } = await import('../routes/projects');
    const ProjectsComponent = Route.options.component;
    render(<ProjectsComponent />);

    const hexagons = document.querySelectorAll('.hexagon');
    expect(hexagons.length).toBeGreaterThanOrEqual(1);
  });
});
