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

describe('AboutPage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the page heading "About Me"', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    expect(screen.getByRole('heading', { name: /about me/i })).toBeInTheDocument();
  });

  it('displays the bio statement about open-source and transparent engineering', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    const openSourceMatches = screen.getAllByText(/open-source/i);
    expect(openSourceMatches.length).toBeGreaterThanOrEqual(1);
    const transparentMatches = screen.getAllByText(/transparent engineering/i);
    expect(transparentMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders skills/tech stack tags', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    const skills = ['TypeScript', 'React', 'Kubernetes', 'Talos Linux', 'Go', 'Python', 'Terraform', 'Docker', 'CI/CD', 'Grafana'];
    for (const skill of skills) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });

  it('renders a personal interests section', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    expect(
      screen.getByRole('heading', { name: /interests/i })
    ).toBeInTheDocument();
  });

  it('includes Hexagon decorative elements', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    const hexagons = document.querySelectorAll('.hexagon');
    expect(hexagons.length).toBeGreaterThanOrEqual(1);
  });

  it('has a resume download link', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    const resumeLink = screen.getByRole('link', { name: /download resume/i });
    expect(resumeLink).toBeInTheDocument();
    expect(resumeLink).toHaveAttribute('href', '/resume.pdf');
    expect(resumeLink).toHaveAttribute('download');
  });

  it('uses semantic section elements for accessibility', async () => {
    const { Route } = await import('../routes/about');
    const AboutComponent = Route.options.component;
    render(<AboutComponent />);

    // Should have sections for bio, skills, and interests
    const sections = document.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });
});
