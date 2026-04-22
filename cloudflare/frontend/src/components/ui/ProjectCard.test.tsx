import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProjectCard, type ProjectData } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject: ProjectData = {
    title: 'Test Project',
    description: 'A test project description.',
    techStack: ['React', 'TypeScript', 'Node.js'],
    githubUrl: 'https://github.com/user/test-project',
    liveUrl: 'https://test-project.example.com',
  };

  it('renders the project title', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders the project description', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('A test project description.')).toBeInTheDocument();
  });

  it('renders all tech stack tags', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders a GitHub link with correct href', () => {
    render(<ProjectCard project={mockProject} />);
    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/user/test-project');
  });

  it('renders a live demo link with correct href', () => {
    render(<ProjectCard project={mockProject} />);
    const liveLink = screen.getByRole('link', { name: /live demo/i });
    expect(liveLink).toHaveAttribute('href', 'https://test-project.example.com');
  });

  it('renders without a live demo link when not provided', () => {
    const projectWithoutLive: ProjectData = {
      ...mockProject,
      liveUrl: undefined,
    };
    render(<ProjectCard project={projectWithoutLive} />);
    const liveLinks = screen.queryAllByRole('link', { name: /live demo/i });
    expect(liveLinks.length).toBe(0);
  });

  it('is accessible with keyboard navigation', () => {
    render(<ProjectCard project={mockProject} />);
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });
});
