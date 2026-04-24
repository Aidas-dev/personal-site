import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HeroScene } from './HeroScene'
import { vi } from 'vitest'

// Mock @react-three/fiber and drei for unit tests (Three.js needs WebGL context)
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  Float: ({ children }: any) => <div data-testid="float">{children}</div>,
  MeshDistortMaterial: () => <div data-testid="distort-material" />,
  Grid: () => <div data-testid="grid" />,
}))

describe('HeroScene', () => {
  it('should render canvas with grid', () => {
    const { getByTestId } = render(<HeroScene />)
    expect(getByTestId('canvas')).toBeDefined()
    expect(getByTestId('grid')).toBeDefined()
  })

  it('should render 7 floating hexagons in animated mode', () => {
    const { getAllByTestId } = render(<HeroScene />)
    const floats = getAllByTestId('float')
    expect(floats).toHaveLength(7)
  })

  it('should render static hexagons when reducedMotion is true', () => {
    const { queryAllByTestId, getByTestId } = render(
      <HeroScene reducedMotion />
    )
    const floats = queryAllByTestId('float')
    expect(floats).toHaveLength(0)
    expect(getByTestId('canvas')).toBeDefined()
    expect(getByTestId('grid')).toBeDefined()
  })

  it('should have z-index 0 and absolute positioning for background layer', () => {
    const { getByTestId } = render(<HeroScene />)
    const canvas = getByTestId('canvas')
    expect(canvas).toHaveStyle({ position: 'absolute', zIndex: 0 })
  })
})

describe('HeroSceneLazy', () => {
  it('should be defined', async () => {
    const mod = await import('./HeroSceneLazy')
    expect(mod.HeroSceneLazy).toBeDefined()
  })
})
