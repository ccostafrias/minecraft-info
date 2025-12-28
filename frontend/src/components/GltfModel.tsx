import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useRef } from 'react'

interface Props {
  url: string
  scale?: number
  rotate?: boolean
  rotation?: [number, number, number]
  isDragging?: boolean
}


export default function GltfModel({ url, scale = 1, rotate = true, rotation = [0, 0, 0], isDragging = false }: Props) {
  const gltf = useLoader(GLTFLoader, url)
  const groupRef = useRef<THREE.Group>(null)

  gltf.scene.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh
      const mat = mesh.material
      if (Array.isArray(mat)) {
        mat.forEach(m => { m.side = THREE.DoubleSide })
      } else if (mat) {
        mat.side = THREE.DoubleSide
      }
    }
  })

  useFrame((_, delta) => {
    if (groupRef.current && rotate && !isDragging) {
      groupRef.current.rotation.y -= delta * 0.5
    }
  })

  return (
    <group 
      ref={groupRef} 
      rotation={[Math.atan(Math.sqrt(2))/2 + rotation[0], Math.PI / 4 + rotation[1], rotation[2]]} 
      scale={scale}
    >
      <primitive object={gltf.scene} />
    </group>
  )
}
