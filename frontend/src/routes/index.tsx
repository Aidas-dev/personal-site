import { createFileRoute, Link } from '@tanstack/react-router'
import { HeroSceneLazy } from '../components/three/HeroSceneLazy'
import { Hexagon } from '../components/ui/Hexagon'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Three.js Background */}
      <HeroSceneLazy />

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Decorative hexagons */}
        <div className="mb-6 flex gap-3">
          <Hexagon size="sm" />
          <Hexagon size="md" />
          <Hexagon size="sm" />
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-100 dark:text-neutral-50 sm:text-6xl md:text-7xl">
          Aidas Kriščiūnas
        </h1>

        <p className="mb-2 max-w-2xl text-lg text-neutral-300 dark:text-neutral-400 sm:text-xl">
          Developer. Infrastructure enthusiast. Building things that run on
          Kubernetes.
        </p>

        <p className="mb-8 max-w-xl text-sm text-neutral-400 dark:text-neutral-500 sm:text-base">
          My work is open-source, my infra is self-hosted, and my portfolio is
          deployed on a Talos Linux cluster. Welcome to my corner of the web.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/projects"
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            View Projects
          </Link>
          <a
            href="/resume.pdf"
            download
            className="rounded-lg border border-neutral-600 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-primary-500 hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Download Resume
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg
          className="h-6 w-6 text-neutral-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  )
}
