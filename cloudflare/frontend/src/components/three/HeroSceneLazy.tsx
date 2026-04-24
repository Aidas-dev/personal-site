import { lazy, Suspense } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const LazyHeroScene = lazy(() =>
  import('./HeroScene').then((mod) => ({ default: mod.HeroScene }))
)

/**
 * Lazy-loaded hero scene wrapper.
 * Shows a simple placeholder while the Three.js bundle loads.
 * Respects prefers-reduced-motion.
 */
export function HeroSceneLazy() {
  const reducedMotion = useReducedMotion()

  return (
    <Suspense
      fallback={
        <div
          className="absolute inset-0 z-0 bg-neutral-900 dark:bg-neutral-950"
          aria-hidden="true"
        />
      }
    >
      <LazyHeroScene reducedMotion={reducedMotion} />
    </Suspense>
  )
}
