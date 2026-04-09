import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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

function renderRoute(routeImport: () => Promise<{ Route: { options: { component?: React.ComponentType } } }>) {
  return routeImport().then(({ Route }) => {
    const Component = Route.options.component
    if (!Component) throw new Error('Route component is undefined')
    return { Component }
  })
}

describe('AboutPage', () => {

  it('should render bio section', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(screen.getByText(/open-source, self-hosted infrastructure/)).toBeInTheDocument()
  })

  it('should render skills tags', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Kubernetes')).toBeInTheDocument()
  })

  it('should render interests section', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(screen.getByText(/Interests/)).toBeInTheDocument()
  })

  it('should render decorative hexagons', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(document.querySelectorAll('.hexagon').length).toBeGreaterThanOrEqual(1)
  })

  it('should have resume download link', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(screen.getByText(/Download Resume/)).toBeInTheDocument()
  })

  it('should use semantic sections', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(document.querySelector('section')).toBeInTheDocument()
  })

  it('should render personal interests', async () => {
    const { Component } = await renderRoute(() => import('./about'))
    render(<Component />)
    expect(screen.getByText(/hobbies|interests|personal/i)).toBeInTheDocument()
  })
})
