import { useThree } from '@react-three/fiber'
import { OrthographicCamera } from 'three'
import { useEffect } from 'react'

export default function OrthoCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / size.height
    const frustum = 20

    const ortho = new OrthographicCamera(
      (-frustum * aspect) / 2,
      (frustum * aspect) / 2,
      frustum / 2,
      -frustum / 2,
      0.1,
      100
    )

    ortho.position.set(0, 3, 20)
    ortho.lookAt(0, 0, 0)
    ortho.updateProjectionMatrix()

    camera.copy(ortho)
  }, [camera, size])

  return null
}
