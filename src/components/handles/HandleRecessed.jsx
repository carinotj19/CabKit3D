import { useEffect, useMemo } from 'react';
import { BoxGeometry, MeshPhysicalMaterial, Color } from 'three';

export default function HandleRecessed({ part, material }) {
  const fallback = useMemo(() => {
    if (material) return null;
    return new MeshPhysicalMaterial({ color: new Color('#555'), roughness: 0.4, metalness: 0.15 });
  }, [material]);

  const geometry = useMemo(() => new BoxGeometry(part.size.x, part.size.y, part.size.z), [part.size.x, part.size.y, part.size.z]);

  useEffect(() => () => {
    geometry.dispose();
    fallback?.dispose();
  }, [geometry, fallback]);

  return (
    <mesh
      geometry={geometry}
      material={material ?? fallback}
      position={[part.position.x, part.position.y, part.position.z]}
      rotation={[part.rotation.x, part.rotation.y, part.rotation.z]}
      castShadow
      receiveShadow
    />
  );
}
