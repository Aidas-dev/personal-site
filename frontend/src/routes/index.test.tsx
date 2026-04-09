import { describe, it, expect, vi } from 'vitest'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({ to, children, className, ...props }: any) => (
      <a href={to} className={className} {...props}>{children}</a>
    ),
    useLinkProps: () => ({}),
  }
})

vi.mock('../components/three/HeroSceneLazy', () => ({
  HeroSceneLazy: () => <div data-testid="hero-scene" />,
}))

describe('HomePage', () => {
  it('should define the route with a component', async () => {
    const { Route } = await import('./index')
    expect(Route.options.component).toBeDefined()
  })
})
