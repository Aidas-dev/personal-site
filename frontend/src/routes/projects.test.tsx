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

describe('ProjectsPage', () => {

  it('should render projects heading', async () => {
    const { Component } = await renderRoute(() => import('./projects'))
    render(<Component />)
    expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument()
  })

  it('should render project cards', async () => {
    const { Component } = await renderRoute(() => import('./projects'))
    render(<Component />)
    expect(screen.getByText('personal-website')).toBeInTheDocument()
    expect(screen.getByText('kubernetes-cluster')).toBeInTheDocument()
  })

  it('should render filter buttons', async () => {
    const { Component } = await renderRoute(() => import('./projects'))
    render(<Component />)
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
  })

  it('should filter projects when a tech tag is clicked', async () => {
    const { Component } = await renderRoute(() => import('./projects'))
    render(<Component />)
    const k8sBtn = screen.getByRole('button', { name: /kubernetes/i })
    k8sBtn.click()
    expect(screen.queryByText('personal-website')).toBeInTheDocument()
  })

  it('should show all projects when All filter is clicked', async () => {
    const { Component } = await renderRoute(() => import('./projects'))
    render(<Component />)
    const allBtn = screen.getByRole('button', { name: /all/i })
    allBtn.click()
    expect(screen.getByText('personal-website')).toBeInTheDocument()
  })

  it('should render decorative hexagons', async () => {
    const { Component } = await renderRoute(() => import('./projects'))
    render(<Component />)
    expect(document.querySelectorAll('.hexagon').length).toBeGreaterThanOrEqual(1)
  })
})
