import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the Three.js lazy loader
vi.mock('../components/three/HeroSceneLazy', () => ({
  HeroSceneLazy: () => <div data-testid="hero-scene" />,
}))

// Mock TanStack Router Link to work outside RouterProvider
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({ to, children, className, ...props }: any) => (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    ),
    useLinkProps: () => ({}),
  }
})

describe('HomePage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should render hero content with name and title', async () => {
    const { Route } = await import('../routes/index')
    const HomePageComponent = Route.options.component
    render(<HomePageComponent />)

    expect(screen.getByText('Aidas Kriščiūnas')).toBeInTheDocument()
    expect(screen.getByText(/Infrastructure enthusiast/)).toBeInTheDocument()
  })

  it('should have CTA buttons for projects and resume', async () => {
    const { Route } = await import('../routes/index')
    const HomePageComponent = Route.options.component
    render(<HomePageComponent />)

    expect(screen.getByText('View Projects')).toBeInTheDocument()
    expect(screen.getByText('Download Resume')).toBeInTheDocument()
  })

  it('should render Hexagon decorative elements', async () => {
    const { Route } = await import('../routes/index')
    const HomePageComponent = Route.options.component
    render(<HomePageComponent />)

    const hexagons = document.querySelectorAll('.hexagon')
    expect(hexagons.length).toBeGreaterThanOrEqual(1)
  })

  it('should include Three.js scene placeholder', async () => {
    const { Route } = await import('../routes/index')
    const HomePageComponent = Route.options.component
    render(<HomePageComponent />)

    expect(screen.getByTestId('hero-scene')).toBeInTheDocument()
  })
})
