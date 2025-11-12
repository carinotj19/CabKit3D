import { useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  MeshPhysicalMaterial,
  BoxGeometry,
  Object3D,
  Color,
  CanvasTexture,
} from 'three';
import HandleBar from './handles/HandleBar';
import HandleKnob from './handles/HandleKnob';

const MATERIAL_LIBRARY = {
  ML: {
    carcass: '#f4f4f2',
    door: '#f7f7f5',
    shelf: '#efefe9',
  },
  PN: {
    carcass: '#f2f2f7',
    door: '#ffffff',
    shelf: '#f7f2f7',
  },
  WD: {
    carcass: '#d8b28a',
    door: '#d2a06c',
    shelf: '#cfa376',
  },
};

const METAL = {
  bar: '#b4bac9',
  knob: '#c7c2b5',
};

export default function CabinetModel({ parts = [], materialKey = 'ML', turntable }) {
  const groupRef = useRef();
  const { invalidate } = useThree();

  const groupedParts = useMemo(() => groupParts(parts), [parts]);

  const materials = usePBRMaterials(materialKey);

  useEffect(() => invalidate(), [parts, invalidate]);

  useFrame((_, delta) => {
    if (!groupRef.current || !turntable) return;
    groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <InstancedBoxes parts={groupedParts.carcass} material={materials.carcass} />
      <InstancedBoxes parts={groupedParts.door} material={materials.door} />
      <InstancedBoxes parts={groupedParts.shelf} material={materials.shelf} />
      {groupedParts.handleBar.map((part) => (
        <HandleBar key={part.key} part={part} material={materials.handleBar} />
      ))}
      {groupedParts.handleKnob.map((part) => (
        <HandleKnob key={part.key} part={part} material={materials.handleKnob} />
      ))}
    </group>
  );
}

function groupParts(parts) {
  return parts.reduce(
    (acc, part) => {
      switch (part.kind) {
        case 'panel':
          acc.carcass.push(part);
          break;
        case 'door':
          acc.door.push(part);
          break;
        case 'shelf':
          acc.shelf.push(part);
          break;
        case 'handle-bar':
          acc.handleBar.push(part);
          break;
        case 'handle-knob':
          acc.handleKnob.push(part);
          break;
        default:
          acc.carcass.push(part);
      }
      return acc;
    },
    { carcass: [], door: [], shelf: [], handleBar: [], handleKnob: [] },
  );
}

function usePBRMaterials(materialKey) {
  const materials = useMemo(() => {
    const palette = MATERIAL_LIBRARY[materialKey] ?? MATERIAL_LIBRARY.ML;
    const lightMap = createLightMapTexture();
    return {
      carcass: createMaterial(palette.carcass, {
        roughness: 0.55,
        clearcoat: 0.08,
        sheen: 0.2,
        lightMap,
        lightMapIntensity: lightMap ? 0.85 : undefined,
      }),
      door: createMaterial(palette.door, {
        roughness: 0.4,
        clearcoat: 0.3,
        sheen: 0.35,
        lightMap,
        lightMapIntensity: lightMap ? 0.7 : undefined,
      }),
      shelf: createMaterial(palette.shelf, { roughness: 0.6, transmission: 0.02 }),
      handleBar: createMaterial(METAL.bar, { roughness: 0.2, metalness: 0.9, clearcoat: 1 }),
      handleKnob: createMaterial(METAL.knob, { roughness: 0.35, metalness: 0.75, clearcoat: 0.6 }),
    };
  }, [materialKey]);
  useEffect(() => {
    return () => {
      Object.values(materials).forEach((mat) => mat.dispose());
    };
  }, [materials]);
  return materials;
}

function createMaterial(color, overrides = {}) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    metalness: 0.04,
    roughness: 0.6,
    sheen: 0,
    sheenRoughness: 0.7,
    iridescence: 0,
    ...overrides,
  });
}

function InstancedBoxes({ parts, material }) {
  const meshRef = useRef();
  const geometry = useMemo(() => {
    const geo = new BoxGeometry(1, 1, 1);
    if (geo.attributes.uv) {
      geo.setAttribute('uv2', geo.attributes.uv.clone());
    }
    return geo;
  }, []);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    parts.forEach((part, index) => {
      dummy.position.copy(part.position);
      dummy.scale.copy(part.size);
      dummy.rotation.copy(part.rotation);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [parts, dummy]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!parts.length) return null;

  return (
    <instancedMesh
      key={`${material.uuid}-${parts.length}`}
      ref={meshRef}
      args={[geometry, material, parts.length]}
      castShadow
      receiveShadow
    />
  );
}

function createLightMapTexture() {
  if (typeof document === 'undefined') {
    return null;
  }
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.7);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#b9c0ca');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}
