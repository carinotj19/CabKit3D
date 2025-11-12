import { Vector3, Euler } from 'three';

const MM_TO_M = 0.001;

export function getCabinetParts(params, exploded = 0) {
  const {
    width,
    height,
    depth,
    thickness,
    backThickness,
    doorCount,
    gap,
    doorThickness,
    handle,
    shelfCount = 0,
    hingeSide = 'LEFT',
    handlePosition = 'middle',
    handleOrientation = 'horizontal',
  } = params;

  const W = width * MM_TO_M;
  const H = height * MM_TO_M;
  const D = depth * MM_TO_M;
  const T = thickness * MM_TO_M;
  const B = backThickness * MM_TO_M;
  const GAP = gap * MM_TO_M;
  const DOOR_T = doorThickness * MM_TO_M;

  const centerY = H / 2;
  const parts = [];

  const explodeMagnitude = exploded * (Math.max(W, H, D) * 0.25);

  // Sides
  parts.push(boxPart(
    'side-left',
    new Vector3(T, H, D),
    new Vector3(-(W - T) / 2 - explodeMagnitude, centerY, 0),
  ));

  parts.push(boxPart(
    'side-right',
    new Vector3(T, H, D),
    new Vector3((W - T) / 2 + explodeMagnitude, centerY, 0),
  ));

  // Bottom
  parts.push(boxPart(
    'bottom',
    new Vector3(W, T, D),
    new Vector3(0, T / 2 - explodeMagnitude, 0),
  ));

  // Top
  parts.push(boxPart(
    'top',
    new Vector3(W, T, D),
    new Vector3(0, H - T / 2 + explodeMagnitude, 0),
  ));

  // Back
  parts.push(boxPart(
    'back',
    new Vector3(W - 2 * T, H - 2 * T, B),
    new Vector3(0, centerY, -(D / 2) - explodeMagnitude + B / 2),
  ));

  // Shelves
  const shelfQty = Math.max(0, Math.floor(shelfCount));
  if (shelfQty > 0) {
    const interiorWidth = Math.max(W - 2 * T, 0.05);
    const interiorDepth = Math.max(D - T, 0.05);
    const shelfThickness = Math.min(T, 0.03);
    const clearHeight = Math.max(H - 2 * T, shelfThickness);

    for (let i = 0; i < shelfQty; i += 1) {
      const fraction = (i + 1) / (shelfQty + 1);
      const y = T + fraction * clearHeight;
      const verticalOffset = (i - (shelfQty - 1) / 2) * explodeMagnitude * 0.2;
      parts.push(boxPart(
        `shelf-${i}`,
        new Vector3(interiorWidth, shelfThickness, interiorDepth),
        new Vector3(0, y + verticalOffset, 0),
        'shelf',
      ));
    }
  }

  // Doors
  const doorHeight = H - 2 * GAP;
  const doorOffsetZ = D / 2 + DOOR_T / 2 + explodeMagnitude;

  if (doorCount === 1) {
    const doorWidth = W - 2 * GAP;
    parts.push(boxPart('door', new Vector3(doorWidth, doorHeight, DOOR_T), new Vector3(0, centerY, doorOffsetZ), 'door'));
    addHandle(parts, handle, {
      key: 'door',
      x: 0,
      y: centerY,
      z: doorOffsetZ,
      width: doorWidth,
      height: doorHeight,
    }, 'S', { hingeSide, isSingleDoor: true, handlePosition, handleOrientation });
  } else {
    const leafWidth = (W - 3 * GAP) / 2;
    const leftX = -(leafWidth / 2 + GAP / 2);
    const rightX = leafWidth / 2 + GAP / 2;

    parts.push(boxPart('door-left', new Vector3(leafWidth, doorHeight, DOOR_T), new Vector3(leftX, centerY, doorOffsetZ), 'door'));
    parts.push(boxPart('door-right', new Vector3(leafWidth, doorHeight, DOOR_T), new Vector3(rightX, centerY, doorOffsetZ), 'door'));

    addHandle(parts, handle, {
      key: 'door-left',
      x: leftX,
      y: centerY,
      z: doorOffsetZ,
      width: leafWidth,
      height: doorHeight,
    }, 'L', { hingeSide: 'LEFT', isSingleDoor: false, handlePosition, handleOrientation });

    addHandle(parts, handle, {
      key: 'door-right',
      x: rightX,
      y: centerY,
      z: doorOffsetZ,
      width: leafWidth,
      height: doorHeight,
    }, 'R', { hingeSide: 'RIGHT', isSingleDoor: false, handlePosition, handleOrientation });
  }

  return parts;
}

function boxPart(key, size, position, kind = 'panel') {
  return {
    key,
    kind,
    size,
    position,
    rotation: new Euler(0, 0, 0),
  };
}

const HANDLE_MARGIN = 0.03;
const HANDLE_MIN_EDGE_CLEARANCE = 0.01;

function addHandle(parts, type, door, suffix = '', options = {}) {
  if (type === 'NL') return;

  const {
    hingeSide = 'LEFT',
    isSingleDoor = false,
    handlePosition = 'middle',
    handleOrientation = 'horizontal',
  } = options;
  const edgeDirection = resolveHandleDirection(door.x, hingeSide, isSingleDoor);
  const halfWidth = Math.max(door.width / 2, HANDLE_MIN_EDGE_CLEARANCE);
  const inset = Math.min(HANDLE_MARGIN, Math.max(halfWidth - HANDLE_MIN_EDGE_CLEARANCE, 0));
  const offsetFromCenter = Math.max(halfWidth - inset, HANDLE_MIN_EDGE_CLEARANCE);
  const handleX = door.x + offsetFromCenter * edgeDirection;
  const handleY = door.y + getHandleYOffset(handlePosition, door.height);
  const handleKind = type === 'HB' ? 'handle-bar' : 'handle-knob';

  if (type === 'HB') {
    const min = 0.096;
    const max = 0.32;
    const length = clamp(door.height * 0.35, min, max);
    const diameter = 0.012;
    const offsetZ = 0.02;
    parts.push({
      key: `handle-bar-${suffix}`,
      kind: handleKind,
      size: new Vector3(length, diameter, diameter),
      position: new Vector3(handleX, handleY, door.z + offsetZ),
      rotation: new Euler(0, 0, 0),
      orientation: normalizeOrientation(handleOrientation),
    });
  } else if (type === 'KN') {
    const size = 0.02;
    const offsetZ = 0.025;
    parts.push({
      key: `handle-knob-${suffix}`,
      kind: handleKind,
      size: new Vector3(size, size, size),
      position: new Vector3(handleX, handleY, door.z + offsetZ),
      rotation: new Euler(0, 0, 0),
    });
  }
}

function resolveHandleDirection(_doorCenterX, hingeSide) {
  return hingeSide === 'RIGHT' ? -1 : 1;
}

function getHandleYOffset(position, doorHeight) {
  const clamped = (position || '').toLowerCase();
  const offset = doorHeight / 3;
  switch (clamped) {
    case 'top':
      return offset;
    case 'bottom':
      return -offset;
    default:
      return 0;
  }
}

function normalizeOrientation(value) {
  const val = (value || '').toLowerCase();
  if (val === 'vertical' || val === 'depth') return val;
  return 'horizontal';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
