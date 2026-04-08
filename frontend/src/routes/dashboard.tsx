import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Dashboard</h1>
        <p className="text-neutral-600">
          Admin dashboard - placeholder for future development.
        </p>
      </div>
    </div>
  );
}
