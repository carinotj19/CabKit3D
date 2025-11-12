import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { getCabinetParts } from '../lib/cabinetMath';

const MATERIALS = {
  ML: { color: '#f4f4f2', roughness: 0.9, metalness: 0.05 },
  PN: { color: '#efefef', roughness: 0.7, metalness: 0.05 },
  WD: { color: '#d2b48c', roughness: 0.8, metalness: 0.12 },
  DOOR: { color: '#ffffff', roughness: 0.6, metalness: 0.05 },
  HANDLE: { color: '#666666', roughness: 0.35, metalness: 0.65 },
};

export default function CabinetModel({ params, exploded, turntable }) {
  const groupRef = useRef();
  const { invalidate } = useThree();

  const parts = useMemo(() => getCabinetParts(params, exploded), [params, exploded]);

  useEffect(() => {
    invalidate();
  }, [parts, invalidate]);

  useFrame((_, delta) => {
    if (!groupRef.current || !turntable) return;
    groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {parts.map((part) => {
        const material = getMaterial(part.kind, params.material);
        return (
          <mesh
            key={part.key}
            position={[part.position.x, part.position.y, part.position.z]}
            rotation={[part.rotation.x, part.rotation.y, part.rotation.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[part.size.x, part.size.y, part.size.z]} />
            <meshStandardMaterial {...material} />
          </mesh>
        );
      })}
    </group>
  );
}

function getMaterial(kind, carcassKey) {
  if (kind === 'door') return MATERIALS.DOOR;
  if (kind === 'handle') return MATERIALS.HANDLE;
  return MATERIALS[carcassKey] ?? MATERIALS.ML;
}
