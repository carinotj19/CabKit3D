import { Scene, Mesh, BoxGeometry, MeshStandardMaterial, Color, AmbientLight } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const COLORS = {
  panel: '#d4d8e5',
  door: '#f4dcbf',
  shelf: '#bdc7ff',
  hardware: '#8f9cff',
};

export function exportCabinetGlb(parts, filename = 'cabinet.glb') {
  return new Promise((resolve, reject) => {
    const scene = new Scene();
    scene.add(new AmbientLight(0xffffff, 1.2));

    parts.forEach((part) => {
      const color = colorForPart(part.kind);
      const mesh = new Mesh(
        new BoxGeometry(part.size.x, part.size.y, part.size.z),
        new MeshStandardMaterial({ color: new Color(color), metalness: 0.05, roughness: 0.6 })
      );
      mesh.position.copy(part.position);
      mesh.rotation.copy(part.rotation);
      scene.add(mesh);
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        const blob = result instanceof ArrayBuffer ? new Blob([result], { type: 'model/gltf-binary' }) : new Blob([JSON.stringify(result)], { type: 'application/json' });
        downloadBlob(blob, filename);
        resolve();
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

function colorForPart(kind = '') {
  if (kind === 'door') return COLORS.door;
  if (kind === 'shelf') return COLORS.shelf;
  if (kind.startsWith('handle')) return COLORS.hardware;
  return COLORS.panel;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
