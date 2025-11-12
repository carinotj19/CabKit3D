import { useMemo, useEffect } from 'react';
import { MeshPhysicalMaterial, Color, Vector2 } from 'three';
import { LatheGeometry } from 'three';

export default function HandleKnob({ part, material }) {
  const fallbackMaterial = useMemo(() => {
    if (material) return null;
    return createMetalMaterial('#c7c2b5');
  }, [material]);

  const geometry = useMemo(() => {
    const profile = createKnobProfile();
    return new LatheGeometry(profile, 32);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => fallbackMaterial?.dispose(), [fallbackMaterial]);

  const scale = useMemo(() => [
    part.size.x / 0.03 || 1,
    part.size.y / 0.03 || 1,
    part.size.z / 0.03 || 1,
  ], [part.size]);

  return (
    <mesh
      geometry={geometry}
      material={material ?? fallbackMaterial}
      position={[part.position.x, part.position.y, part.position.z]}
      rotation={[part.rotation.x, part.rotation.y, part.rotation.z]}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

function createKnobProfile() {
  const height = 0.03;
  return [
    new Vector2(0, 0),
    new Vector2(0.012, 0),
    new Vector2(0.015, height * 0.25),
    new Vector2(0.013, height * 0.6),
    new Vector2(0.01, height * 0.9),
    new Vector2(0.0, height),
  ];
}

function createMetalMaterial(color) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.3,
    sheen: 0.1,
  });
}
