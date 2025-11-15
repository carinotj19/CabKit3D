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

function edgeBandingForPart(part) {
  if (!part.key) return [];
  if (part.kind === 'door') return ['all sides'];
  if (part.key.startsWith('shelf')) return ['front'];
  if (part.key === 'top' || part.key === 'bottom') return ['front', 'left', 'right'];
  if (part.key.startsWith('side')) return ['front', 'back'];
  if (part.key === 'back') return [];
  return [];
}

function fastenersForPart(part) {
  if (part.key === 'back') return { type: 'brad-nail', quantity: 18 };
  if (part.key.startsWith('shelf')) return { type: 'shelf-pin', quantity: 4 };
  if (part.kind === 'panel' || part.key === 'top' || part.key === 'bottom') {
    return { type: 'confirmat', quantity: 6 };
  }
  return null;
}

function hingeSummary(params) {
  const perDoor = params.height > 900 ? 3 : 2;
  let left = 0;
  let right = 0;
  if (params.doorCount === 1) {
    if (params.hingeSide === 'LEFT') left = perDoor;
    else right = perDoor;
  } else if (params.doorCount === 2) {
    left = perDoor;
    right = perDoor;
  }
  const rows = [];
  if (left) rows.push(makeHingeRow('left', left));
  if (right) rows.push(makeHingeRow('right', right));
  return { perDoor, left, right, rows };
}

function makeHingeRow(side, count) {
  return {
    key: `hinges-${side}`,
    kind: 'hardware',
    width: '',
    height: '',
    depth: '',
    materialId: 'HARDWARE-HINGE',
    edgeBanding: '',
    hingeSide: side,
    hingeCount: count,
    fasteners: '',
    notes: `${count} hinges (${side})`,
  };
}

export function buildBillOfMaterials(parts, params) {
  const hingeInfo = hingeSummary(params);
  const bom = parts.map((part) => {
    const edgeBanding = edgeBandingForPart(part);
    const fasteners = fastenersForPart(part);
    const base = {
      key: part.key,
      kind: part.kind,
      width: roundMM((part.size?.x ?? 0) * MM_PER_M),
      height: roundMM((part.size?.y ?? 0) * MM_PER_M),
      depth: roundMM((part.size?.z ?? 0) * MM_PER_M),
      materialId: materialForPart(part, params),
      edgeBanding: edgeBanding.join(' | '),
      fasteners: fasteners ? `${fasteners.type} x${fasteners.quantity}` : '',
      hingeSide: '',
      hingeCount: '',
      notes: '',
    };
    if (part.kind === 'door') {
      const side = part.key.includes('left') ? 'left' : part.key.includes('right') ? 'right' : params.hingeSide.toLowerCase();
      base.hingeSide = side;
      base.hingeCount = hingeInfo.perDoor;
    }
    return base;
  });
  return [...bom, ...hingeInfo.rows];
}

export function buildBOMCsv(bom) {
  const header = ['key', 'kind', 'width_mm', 'height_mm', 'depth_mm', 'materialId', 'edgeBanding', 'hingeSide', 'hingeCount', 'fasteners', 'notes'];
  const rows = bom.map((item) => [
    item.key,
    item.kind,
    item.width,
    item.height,
    item.depth,
    item.materialId,
    item.edgeBanding || '',
    item.hingeSide || '',
    item.hingeCount || '',
    item.fasteners || '',
    item.notes || '',
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '')}"`).join(','))
    .join('\n');
}
