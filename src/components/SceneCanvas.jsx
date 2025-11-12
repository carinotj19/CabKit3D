import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, StatsGl } from '@react-three/drei';
import { Suspense, lazy, useEffect } from 'react';

const HDRIEnvironment = lazy(() => import('./environment/HDRIEnvironment'));

function InvalidateOnControls() {
  const { invalidate, controls } = useThree((state) => ({
    invalidate: state.invalidate,
    controls: state.controls,
  }));

  useEffect(() => {
    if (!controls) return;
    const handleChange = () => invalidate();
    controls.addEventListener('change', handleChange);
    return () => controls.removeEventListener('change', handleChange);
  }, [controls, invalidate]);

  return null;
}

export default function SceneCanvas({ children, animate }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [1.6, 1.2, 2.0], fov: 45 }}
      frameloop={animate ? 'always' : 'demand'}
    >
      <color attach="background" args={['#f7f8fb']} />
      <hemisphereLight intensity={0.6} color="#fff" groundColor="#b1b1b1" />
      <directionalLight
        position={[2.5, 4, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Suspense fallback={null}>
        <HDRIEnvironment />
      </Suspense>
      <OrbitControls makeDefault enablePan={false} minDistance={0.6} maxDistance={6} />
      <InvalidateOnControls />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e9ecf2" roughness={1} />
      </mesh>

      {children}

      {import.meta.env.DEV ? <StatsGl /> : null}
    </Canvas>
  );
}
