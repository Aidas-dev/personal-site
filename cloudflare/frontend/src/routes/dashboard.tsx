import { createFileRoute } from '@tanstack/react-router';
import { Hexagon } from '@/components/ui/Hexagon';
import { GrafanaEmbed } from '@/components/dashboard/GrafanaEmbed';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

// Placeholder Grafana URLs — replace with real ones when available
const GRAFANA_BASE_URL = 'https://grafana.example.com/d';

const clusterMetrics = [
  { label: 'Nodes', value: '4', icon: '🖥️' },
  { label: 'Pods', value: '42', icon: '📦' },
  { label: 'CPU', value: '23%', icon: '⚡' },
  { label: 'Memory', value: '61%', icon: '💾' },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 relative overflow-hidden">
      {/* Decorative Hexagon elements */}
      <div className="absolute top-20 right-16 opacity-15" aria-hidden="true">
        <Hexagon size="lg" />
      </div>
      <div className="absolute bottom-40 left-10 opacity-10" aria-hidden="true">
        <Hexagon size="md" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
          Real-time cluster monitoring and performance metrics.
        </p>

        {/* Pending Integration Notice */}
        <div className="mb-8 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Grafana Integration Pending
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                This dashboard uses placeholder data. Real Grafana integration is pending — actual cluster metrics and live dashboards will be connected once the Grafana instance URLs are provided.
              </p>
            </div>
          </div>
        </div>

        {/* Cluster Overview Metrics */}
        <section className="mb-10" aria-labelledby="cluster-overview">
          <h2 id="cluster-overview" className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6">
            Cluster Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {clusterMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center hover:border-primary-300 dark:hover:border-primary-700 transition-colors duration-200"
              >
                <div className="text-2xl mb-2" aria-hidden="true">{metric.icon}</div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {metric.value}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Grafana Dashboard Embeds */}
        <section aria-labelledby="grafana-dashboards">
          <h2 id="grafana-dashboards" className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-6">
            Grafana Dashboards
          </h2>
          <div className="space-y-8">
            <GrafanaEmbed
              url={`${GRAFANA_BASE_URL}/cluster-overview`}
              title="Cluster Overview"
              height="500px"
            />
            <GrafanaEmbed
              url={`${GRAFANA_BASE_URL}/node-metrics`}
              title="Node Metrics"
              height="400px"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
