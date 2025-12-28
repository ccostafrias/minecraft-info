import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { GrFormPrevious } from 'react-icons/gr'

import beeModelUrl from '../assets/bee.gltf?url'
import GltfModel from '../components/GltfModel'
import type { MouseStatus, Vec2 } from '@shared/types'

export default function Entities() {

  const entity = {
    name: 'Bee',
    // modelUrl: beeModelUrl,
  }

  const [mouseStatus, setMouseStatus] = useState<MouseStatus>({ x: 0, y: 0, isDown: false });
  const [rotation, setRotation] = useState<Vec2>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseStatus.isDown) {
        const deltaX = e.clientX - mouseStatus.x;
        const deltaY = e.clientY - mouseStatus.y;
        const k = 0.002;

        setRotation(prev => ({ x: prev.x + deltaY * k, y: prev.y + deltaX * k }));
        setMouseStatus(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
      }
    }

    const handleMouseUp = () => setMouseStatus(prev => ({ ...prev, isDown: false }));

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [mouseStatus]);


  const handleMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    console.log(`Pointer down on 3D model at ${clientX}, ${clientY}`);
    setMouseStatus({ x: clientX, y: clientY, isDown: true });
  }

  return (
    <main className="entities-main gap-4">
      <header className='entity-header [grid-area:title] border-b-2 pb-4 grid grid-cols-[1fr_auto_1fr] items-center'>
          <Link to={`/`} className='p-2 flex flex-row items-center gap-2' >
            <GrFormPrevious className='text-4xl md:text-xl' />
            <span className='hidden md:inline'>Previous entity</span>
          </Link>
         <h1 className='text-3xl font-bold text-center'>Entity Details</h1>
          <Link to={`/`} className='p-2 flex flex-row items-center gap-2 justify-self-end' >
            <span className='hidden md:inline'>Next entity</span>
            <GrFormPrevious className='rotate-180 text-4xl md:text-xl'/>
          </Link>
      </header>
      <section className='[grid-area:model] flex flex-col gap-4 items-center justify-center'>
        <div 
          className='w-64 h-64 mx-auto rounded-2xl bg-highlight cursor-grab active:cursor-grabbing'
          onMouseDown={handleMouseDown}
        >
          <Canvas>
            {/* Câmera isométrica */}
            <OrthographicCamera
              makeDefault
              zoom={20}
              position={[0, 3, 10]}
            />
            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 20, 10]} intensity={1} />
            <GltfModel url={beeModelUrl} scale={10} rotation={[rotation.x, rotation.y, 0]} isDragging={mouseStatus.isDown} />
          </Canvas>
        </div>
        <h2 className="font-bold text-2xl text-center">{entity.name}</h2>
      </section>
    </main>
  )
}