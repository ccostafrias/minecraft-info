import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import GltfModel from '../components/GltfModel'
import { Link } from 'react-router-dom'
import { GrFormPrevious } from 'react-icons/gr'

import beeModelUrl from '../assets/bee.gltf?url'

export default function Entities() {

  const entity = {
    name: 'Bee',
    // modelUrl: beeModelUrl,
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
        <div className='w-64 h-64 mx-auto rounded-2xl bg-highlight'>
          <Canvas>
            {/* Câmera isométrica */}
            <OrthographicCamera
              makeDefault
              zoom={20}
              position={[0, 3, 10]}
            />
            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 20, 10]} intensity={1} />
            <GltfModel url={beeModelUrl} scale={10} />
          </Canvas>
        </div>
        <h2 className="font-bold text-2xl text-center">{entity.name}</h2>
      </section>
    </main>
  )
}