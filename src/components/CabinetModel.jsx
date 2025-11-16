import { useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  MeshPhysicalMaterial,
  BoxGeometry,
  Object3D,
  Color,
  CanvasTexture,
  EdgesGeometry,
  LineBasicMaterial,
} from 'three';
import HandleBar from './handles/HandleBar';
import HandleKnob from './handles/HandleKnob';
import HandleRecessed from './handles/HandleRecessed';

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
  MB: {
    carcass: '#1f2937',
    door: '#111827',
    shelf: '#1e2532',
  },
  SS: {
    carcass: '#cfd7dd',
    door: '#e4e8ec',
    shelf: '#d3dbe1',
  },
  PW: {
    carcass: '#d5b089',
    door: '#e3c199',
    shelf: '#c99d69',
  },
};

const METAL = {
  bar: '#b4bac9',
  knob: '#c7c2b5',
};

export default function CabinetModel({ parts = [], materialKey = 'ML', blueprint = false, lowPower = false }) {
  const groupRef = useRef();
  const { invalidate } = useThree();

  const groupedParts = useMemo(() => groupParts(parts), [parts]);

  const materials = usePBRMaterials(materialKey, blueprint, lowPower);

  useEffect(() => invalidate(), [parts, invalidate]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <InstancedBoxes parts={groupedParts.carcass} material={materials.carcass} blueprint={blueprint} lowPower={lowPower} />
      <InstancedBoxes parts={groupedParts.door} material={materials.door} blueprint={blueprint} lowPower={lowPower} />
      <InstancedBoxes parts={groupedParts.shelf} material={materials.shelf} blueprint={blueprint} lowPower={lowPower} />
      {groupedParts.handleBar.map((part) => (
        <HandleBar key={part.key} part={part} material={materials.handleBar} />
      ))}
      {groupedParts.handleKnob.map((part) => (
        <HandleKnob key={part.key} part={part} material={materials.handleKnob} />
      ))}
      {groupedParts.handleRecessed.map((part) => (
        <HandleRecessed key={part.key} part={part} material={materials.handleRecessed} />
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
        case 'handle-recessed':
          acc.handleRecessed.push(part);
          break;
        default:
          acc.carcass.push(part);
      }
      return acc;
    },
    { carcass: [], door: [], shelf: [], handleBar: [], handleKnob: [], handleRecessed: [] },
  );
}

function usePBRMaterials(materialKey, blueprint, lowPower) {
  const materials = useMemo(() => {
    const palette = blueprint ? null : (MATERIAL_LIBRARY[materialKey] ?? MATERIAL_LIBRARY.ML);
    const enableLightMap = !blueprint && !lowPower;
    const lightMap = enableLightMap ? createLightMapTexture() : null;
    const baseColor = palette ?? { carcass: '#f0f4ff', door: '#e2e8f0', shelf: '#cbd5f5' };
    if (blueprint) {
      return {
        carcass: createMaterial('#1f5bff', { metalness: 0, roughness: 0.2, clearcoat: 0 }),
        door: createMaterial('#1b4fd6', { metalness: 0, roughness: 0.2, clearcoat: 0 }),
        shelf: createMaterial('#3474ff', { metalness: 0, roughness: 0.2, clearcoat: 0 }),
        handleBar: createMaterial('#f8f8f2', { metalness: 0, roughness: 0.15, clearcoat: 0 }),
        handleKnob: createMaterial('#f8f8f2', { metalness: 0, roughness: 0.15, clearcoat: 0 }),
        handleRecessed: createMaterial('#f8f8f2', { metalness: 0, roughness: 0.15, clearcoat: 0 }),
      };
    }
    return {
      carcass: createMaterial(baseColor.carcass, {
        roughness: lowPower ? 0.72 : 0.55,
        clearcoat: lowPower ? 0 : 0.08,
        sheen: lowPower ? 0 : 0.2,
        lightMap,
        lightMapIntensity: lightMap ? 0.85 : undefined,
        flatShading: lowPower,
      }),
      door: createMaterial(baseColor.door, {
        roughness: lowPower ? 0.62 : 0.4,
        clearcoat: lowPower ? 0 : 0.3,
        sheen: lowPower ? 0 : 0.35,
        lightMap,
        lightMapIntensity: lightMap ? 0.7 : undefined,
        flatShading: lowPower,
      }),
      shelf: createMaterial(baseColor.shelf, {
        roughness: lowPower ? 0.75 : 0.6,
        transmission: lowPower ? 0 : 0.02,
        flatShading: lowPower,
      }),
      handleBar: createMaterial(METAL.bar, {
        roughness: lowPower ? 0.35 : 0.2,
        metalness: lowPower ? 0.65 : 0.9,
        clearcoat: lowPower ? 0 : 1,
        flatShading: lowPower,
      }),
      handleKnob: createMaterial(METAL.knob, {
        roughness: lowPower ? 0.5 : 0.35,
        metalness: lowPower ? 0.55 : 0.75,
        clearcoat: lowPower ? 0 : 0.6,
        flatShading: lowPower,
      }),
      handleRecessed: createMaterial('#444', { roughness: 0.35, metalness: 0.4, flatShading: lowPower }),
    };
  }, [materialKey, blueprint, lowPower]);
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

function InstancedBoxes({ parts, material, blueprint, lowPower = false }) {
  const meshRef = useRef();
  const geometry = useMemo(() => {
    const geo = new BoxGeometry(1, 1, 1);
    if (geo.attributes.uv) {
      geo.setAttribute('uv2', geo.attributes.uv.clone());
    }
    return geo;
  }, []);
  const dummy = useMemo(() => new Object3D(), []);
  const edgesGeometry = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), []);
  const lineMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: '#5ebdff',
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );

  useLayoutEffect(() => {
    if (blueprint || !meshRef.current) return;
    parts.forEach((part, index) => {
      dummy.position.copy(part.position);
      dummy.scale.copy(part.size);
      dummy.rotation.copy(part.rotation);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [parts, dummy, blueprint]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => edgesGeometry.dispose(), [edgesGeometry]);
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);

  if (!parts.length) return null;

  if (blueprint) {
    return (
      <group>
        {parts.map((part) => (
          <lineSegments
            key={part.key}
            geometry={edgesGeometry}
            material={lineMaterial}
            position={[part.position.x, part.position.y, part.position.z]}
            rotation={[part.rotation.x, part.rotation.y, part.rotation.z]}
            scale={[part.size.x, part.size.y, part.size.z]}
          />
        ))}
      </group>
    );
  }

  return (
    <instancedMesh
      key={`${material.uuid}-${parts.length}`}
      ref={meshRef}
      args={[geometry, material, parts.length]}
      castShadow={!blueprint && !lowPower}
      receiveShadow={!blueprint && !lowPower}
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
