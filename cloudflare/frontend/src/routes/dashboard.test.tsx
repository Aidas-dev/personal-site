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

describe('DashboardPage', () => {
  it('should define the route with a component', async () => {
    const { Route } = await import('./dashboard')
    expect(Route.options.component).toBeDefined()
  })
})
