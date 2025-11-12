const MM_PER_M = 1000;

function roundMM(value) {
  return Math.round(value * 100) / 100;
}

function materialForPart(part, params) {
  const material = params.material ?? 'MAT';
  if (part.kind === 'door') return `${material}-DOOR`;
  if (part.kind === 'shelf') return `${material}-SHELF`;
  if (part.kind === 'panel') {
    if (part.key === 'back') return `${material}-BACK`;
    return `${material}-CARCASS`;
  }
  if (part.kind && part.kind.startsWith('handle')) return 'HARDWARE-HANDLE';
  return material;
}

export function buildBillOfMaterials(parts, params) {
  return parts.map((part) => ({
    key: part.key,
    kind: part.kind,
    width: roundMM((part.size?.x ?? 0) * MM_PER_M),
    height: roundMM((part.size?.y ?? 0) * MM_PER_M),
    depth: roundMM((part.size?.z ?? 0) * MM_PER_M),
    materialId: materialForPart(part, params),
  }));
}

export function buildBOMCsv(bom) {
  const header = ['key', 'kind', 'width_mm', 'height_mm', 'depth_mm', 'materialId'];
  const rows = bom.map((item) => [
    item.key,
    item.kind,
    item.width,
    item.height,
    item.depth,
    item.materialId,
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '')}"`).join(','))
    .join('\n');
}
