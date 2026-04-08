import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/projects')({
  component: Projects,
});

function Projects() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Projects</h1>
        <p className="text-neutral-600 mb-8">
          A showcase of my recent work and projects. More details coming soon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project cards will be added here */}
        </div>
      </div>
    </div>
  );
}
