import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WaveHexGridProps {
  gridSize?: number
  hexSpacing?: number
  amplitude?: number
  frequency?: number
  speed?: number
  reducedMotion?: boolean
}

export function WaveHexGrid({
  gridSize = 10,
  hexSpacing = 1.2,
  amplitude = 1.5,
  frequency = 0.3,
  speed = 0.4,
  reducedMotion = false,
}: WaveHexGridProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  
  const { positions, count } = useMemo(() => {
    const size = gridSize
    const offset = (size * hexSpacing) / 2
    const positions: number[][] = []
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const xPos = x * hexSpacing - offset
        const zPos = z * hexSpacing * 0.866 - offset * 0.866
        positions.push([xPos, 0, zPos])
      }
    }
    
    return { positions, count: positions.length }
  }, [gridSize, hexSpacing])

  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])
  
  const primaryColor = '#0a5c36'
  const peakColor = '#4a9e75'
  const valleyColor = '#063820'

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return
    
    const time = state.clock.elapsedTime * speed
    
    for (let i = 0; i < count; i++) {
      const [xPos, , zPos] = positions[i]
      
      const wave = Math.sin(xPos * frequency + time) * Math.cos(zPos * frequency + time * 0.7)
      const height = wave * amplitude
      
      tempObject.position.set(xPos, height, zPos)
      tempObject.scale.set(1, Math.max(0.1, 1 + wave * 0.5), 1)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
      
      const t = (wave + 1) / 2
      tempColor.lerpColors(
        new THREE.Color(valleyColor),
        new THREE.Color(peakColor),
        t
      )
      meshRef.current.setColorAt(i, tempColor)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      position={[0, -3, -5]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <cylinderGeometry args={[0.4, 0.5, 1, 6]} />
      <meshStandardMaterial
        color={primaryColor}
        roughness={0.3}
        metalness={0.6}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  )
}

export default WaveHexGrid