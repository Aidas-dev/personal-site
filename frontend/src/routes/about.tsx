import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-900 mb-6">About Me</h1>
        <div className="prose prose-lg">
          <p className="text-neutral-600 mb-4">
            Welcome to my portfolio. I'm a developer passionate about building
            great software.
          </p>
          <p className="text-neutral-600">
            This page will be expanded with more details about my background,
            skills, and experience.
          </p>
        </div>
      </div>
    </div>
  );
}
