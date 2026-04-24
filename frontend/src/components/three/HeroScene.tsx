import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Grid } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { type Group } from 'three'
import { WaveHexGrid } from './WaveHexGrid'

interface FloatingHexProps {
  position: [number, number, number]
  speed?: number
  distort?: number
  color: string
  scale?: number
}

function FloatingHex({
  position,
  speed = 1,
  distort = 0.3,
  color,
  scale = 1,
}: FloatingHexProps) {
  const meshRef = useRef<Group>(null!)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1 * speed
      meshRef.current.rotation.y += delta * 0.15 * speed
    }
  })

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

interface StaticHexProps {
  position: [number, number, number]
  color: string
  scale?: number
}

function StaticHex({ position, color, scale = 1 }: StaticHexProps) {
  return (
    <mesh position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

interface HeroSceneProps {
  reducedMotion?: boolean
}

type Position = [number, number, number]

/**
 * JetBrains-style clean 3D hero scene.
 * Simple geometric hexagons floating in space with subtle grid.
 * Adapts to dark/light theme and respects reduced motion preference.
 */
export function HeroScene({ reducedMotion = false }: HeroSceneProps) {
  const hexPositions = useMemo<Position[]>(
    () => [
      [-3, 1, -2],
      [2, -1, -3],
      [4, 2, -4],
      [-2, -2, -1],
      [0, 3, -5],
      [-4, 0, -3],
      [3, -3, -2],
    ],
    []
  )

  // Dark green primary theme colors
  const hexColor = '#0a5c36'
  const accentColor = '#0d7a48'

  if (reducedMotion) {
    return (
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <WaveHexGrid reducedMotion />
        {hexPositions.map((pos, i) => (
          <StaticHex
            key={i}
            position={pos}
            color={i % 2 === 0 ? hexColor : accentColor}
            scale={0.3 + (i % 3) * 0.2}
          />
        ))}
        <Grid
          infiniteGrid
          cellSize={2}
          sectionSize={4}
          fadeDistance={20}
          cellColor="#0a5c36"
          sectionColor="#0a5c36"
        />
      </Canvas>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <WaveHexGrid />
      {hexPositions.map((pos, i) => (
        <FloatingHex
          key={i}
          position={pos}
          speed={0.5 + (i % 3) * 0.3}
          distort={0.2 + (i % 2) * 0.15}
          color={i % 2 === 0 ? hexColor : accentColor}
          scale={0.3 + (i % 3) * 0.2}
        />
      ))}
      <Grid
        infiniteGrid
        cellSize={2}
        sectionSize={4}
        fadeDistance={20}
        cellColor="#0a5c36"
        sectionColor="#0a5c36"
      />
    </Canvas>
  )
}

export default HeroScene
