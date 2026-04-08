import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary-900 mb-4">
          Welcome to My Portfolio
        </h1>
        <p className="text-xl text-neutral-600">
          Developer. Builder. Problem Solver.
        </p>
      </div>
    </div>
  );
}
