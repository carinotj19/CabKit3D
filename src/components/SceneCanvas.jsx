import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, StatsGl } from '@react-three/drei';
import { Suspense, lazy, useEffect, useRef } from 'react';

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

export default function SceneCanvas({ children, animate, blueprint = false, lowPower = false, showFloor = true, resetViewToken }) {
  const background = blueprint ? '#0b1827' : '#f7f8fb';
  const groundColor = blueprint ? '#132642' : '#e9ecf2';
  const renderFloor = showFloor && !lowPower;
  const controlsRef = useRef();

  useEffect(() => {
    if (!resetViewToken) return;
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.update();
    }
  }, [resetViewToken]);
  return (
    <Canvas
      shadows={!lowPower}
      dpr={lowPower ? 1 : [1, 2]}
      camera={{ position: [1.6, 1.2, 2.0], fov: 45 }}
      frameloop={animate ? 'always' : 'demand'}
      gl={{
        antialias: !lowPower,
        powerPreference: lowPower ? 'low-power' : 'high-performance',
      }}
    >
      <color attach="background" args={[background]} />
      <hemisphereLight intensity={blueprint ? 0.3 : lowPower ? 0.45 : 0.6} color="#fff" groundColor="#b1b1b1" />
      <directionalLight
        position={[2.5, 4, 3]}
        intensity={blueprint ? 0.6 : lowPower ? 0.85 : 1.2}
        castShadow={!lowPower}
        shadow-mapSize={lowPower ? [512, 512] : [1024, 1024]}
      />
      {!blueprint && !lowPower && (
        <Suspense fallback={null}>
          <HDRIEnvironment />
        </Suspense>
      )}
      <OrbitControls ref={controlsRef} makeDefault enablePan={false} minDistance={0.6} maxDistance={6} />
      <InvalidateOnControls />

      {renderFloor ? (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow={!lowPower}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color={groundColor} roughness={1} />
        </mesh>
      ) : null}

      {children}

      {import.meta.env.DEV ? <StatsGl /> : null}
    </Canvas>
  );
}
