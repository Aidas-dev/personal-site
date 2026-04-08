import { createFileRoute } from '@tanstack/react-router';
import { Button, Card, Input, Alert, Container, Spinner } from '@/components';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 hexagon-bg">
      <Container>
        <div className="py-16 flex flex-col items-center">
          {/* Brand */}
          <div className="hexagon bg-primary-500 w-24 h-24 mb-8" />
          <h1 className="text-5xl font-bold text-primary-900 mb-4">
            Riedu E-Shop
          </h1>
          <p className="text-xl text-neutral-600 mb-12">
            Bicycle parts and parking solutions
          </p>

          {/* Component Showcase */}
          <div className="w-full max-w-2xl space-y-8">
            {/* Buttons */}
            <Card>
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Buttons</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="primary" isLoading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </Card>

            {/* Inputs */}
            <Card>
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Inputs</h2>
              <div className="space-y-4">
                <Input label="Email" type="email" placeholder="you@example.com" />
                <Input label="Password" type="password" error="Password must be at least 8 characters" />
              </div>
            </Card>

            {/* Alerts */}
            <Card>
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Alerts</h2>
              <div className="space-y-3">
                <Alert variant="success" title="Success!">Your changes have been saved.</Alert>
                <Alert variant="error" title="Error!">Something went wrong.</Alert>
                <Alert variant="warning">Please review your information.</Alert>
                <Alert variant="info">New features are available.</Alert>
              </div>
            </Card>

            {/* Spinner */}
            <Card>
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Loading</h2>
              <div className="flex gap-6 items-center">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </Card>

            {/* Colors */}
            <Card>
              <h2 className="text-lg font-semibold text-primary-700 mb-4">Design Tokens</h2>
              <div className="flex gap-2 mb-4">
                {['bg-primary-500', 'bg-accent', 'bg-success', 'bg-warning', 'bg-error', 'bg-info'].map((c) => (
                  <div key={c} className={`w-10 h-10 rounded-full ${c}`} />
                ))}
              </div>
              <p className="text-sm text-neutral-500">Primary: #2D5A3D · Accent: #F59E0B</p>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
