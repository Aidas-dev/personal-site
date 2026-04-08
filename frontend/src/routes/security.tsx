import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/security')({
  component: Security,
});

function Security() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-900 mb-6">
          Security Practices
        </h1>
        <p className="text-neutral-600 mb-4">
          Information about security practices and responsible disclosure.
        </p>
        <p className="text-neutral-600">
          This page will detail my approach to security and how to report
          vulnerabilities.
        </p>
      </div>
    </div>
  );
}
