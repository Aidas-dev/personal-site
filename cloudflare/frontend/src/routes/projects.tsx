import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Hexagon } from '@/components/ui/Hexagon';
import { ProjectCard, type ProjectData } from '@/components/ui/ProjectCard';

export const Route = createFileRoute('/projects')({
  component: Projects,
});

const mockProjects: ProjectData[] = [
  {
    title: 'personal-website',
    description:
      'A modern portfolio site built with TanStack Start, React 19, and Tailwind CSS. Features a dark green hexagon theme, responsive design, and Grafana dashboard integration.',
    techStack: ['TypeScript', 'React', 'Tailwind CSS', 'TanStack Start'],
    githubUrl: 'https://github.com/user/personal-website',
    liveUrl: 'https://portfolio.example.com',
  },
  {
    title: 'kubernetes-cluster',
    description:
      'Infrastructure-as-code for a Talos Linux Kubernetes cluster deployed across multiple physical locations. Includes monitoring, logging, and GitOps workflows.',
    techStack: ['Kubernetes', 'Talos Linux', 'Terraform', 'Tailscale'],
    githubUrl: 'https://github.com/user/kubernetes-cluster',
  },
  {
    title: 'home-lab',
    description:
      'Self-hosted home lab infrastructure with Proxmox, Docker, and automated backups. Runs services like Grafana, Gitea, and a media server.',
    techStack: ['Python', 'Docker', 'Terraform', 'Go'],
    githubUrl: 'https://github.com/user/home-lab',
    liveUrl: 'https://home-lab.example.com',
  },
  {
    title: 'ci-cd-pipeline',
    description:
      'Reusable CI/CD pipeline templates for GitHub Actions with automated testing, linting, security scanning, and deployment to Kubernetes.',
    techStack: ['Go', 'TypeScript', 'Kubernetes', 'CI/CD'],
    githubUrl: 'https://github.com/user/ci-cd-pipeline',
  },
];

const allTechStacks = ['All', ...Array.from(new Set(mockProjects.flatMap((p) => p.techStack))).sort()];

function Projects() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return mockProjects;
    return mockProjects.filter((project) => project.techStack.includes(activeFilter));
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 relative overflow-hidden">
      {/* Decorative Hexagon elements */}
      <div className="absolute top-16 right-20 opacity-15" aria-hidden="true">
        <Hexagon size="lg" />
      </div>
      <div className="absolute bottom-24 left-12 opacity-10" aria-hidden="true">
        <Hexagon size="md" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">
          Projects
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
          A showcase of my recent work, infrastructure projects, and open-source contributions.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter projects by technology">
          {allTechStacks.map((tech) => (
            <button
              key={tech}
              onClick={() => setActiveFilter(tech)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === tech
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
              aria-pressed={activeFilter === tech}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              No projects found with the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
