import { useMemo, useEffect } from 'react';
import { MeshPhysicalMaterial, Color, Vector4, TubeGeometry } from 'three';
import { NURBSCurve } from 'three/examples/jsm/curves/NURBSCurve.js';

const BASE_LENGTH = 0.18;
const BASE_RADIUS = 0.008;

export default function HandleBar({ part, material }) {
  const fallbackMaterial = useMemo(() => {
    if (material) return null;
    return createMetalMaterial('#b4bac9');
  }, [material]);

  const curve = useMemo(() => createBarCurve(BASE_LENGTH), []);
  const geometry = useMemo(() => new TubeGeometry(curve, 32, BASE_RADIUS, 24, false), [curve]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => fallbackMaterial?.dispose(), [fallbackMaterial]);

  const scale = useMemo(() => {
    const sx = part.size.x / BASE_LENGTH;
    const sy = part.size.y / (BASE_RADIUS * 2);
    const sz = part.size.z / (BASE_RADIUS * 2);
    return [sx || 1, sy || 1, sz || 1];
  }, [part.size]);

  const rotation = useMemo(() => {
    const { x, y, z } = part.rotation;
    const orientation = (part.orientation || 'horizontal').toLowerCase();
    if (orientation === 'vertical') {
      return [x, y, z + Math.PI / 2];
    }
    if (orientation === 'depth') {
      return [x, y + Math.PI / 2, z];
    }
    return [x, y, z];
  }, [part.rotation, part.orientation]);

  return (
    <mesh
      geometry={geometry}
      material={material ?? fallbackMaterial}
      position={[part.position.x, part.position.y, part.position.z]}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

function createBarCurve(length) {
  const half = length / 2;
  const degree = 3;
  const knots = [0, 0, 0, 0, 1, 1, 1, 1];
  const controlPoints = [
    new Vector4(-half, 0, 0, 1),
    new Vector4(-half * 0.3, 0.012, 0, 1),
    new Vector4(half * 0.3, 0.012, 0, 1),
    new Vector4(half, 0, 0, 1),
  ];
  return new NURBSCurve(degree, knots, controlPoints);
}

function createMetalMaterial(color) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    metalness: 1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
  });
}
