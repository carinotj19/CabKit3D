import { describe, it, expect } from 'vitest';
import { getCabinetParts } from '../cabinetMath';
import { DEFAULT_PARAMS } from '../../store/useConfiguratorStore';

const BASE_PARAMS = {
  ...DEFAULT_PARAMS,
  width: 900,
  height: 780,
  depth: 560,
  shelfCount: 2,
  doorCount: 2,
  handle: 'HB',
};

describe('getCabinetParts geometry', () => {
  it('creates balanced door leaves with matching handles for double doors', () => {
    const parts = getCabinetParts(BASE_PARAMS, 0);
    const doors = parts.filter((p) => p.kind === 'door');
    expect(doors).toHaveLength(2);
    const handles = parts.filter((p) => p.kind === 'handle-bar');
    expect(handles).toHaveLength(2);

    const leftDoor = doors.find((p) => p.key === 'door-left');
    const rightDoor = doors.find((p) => p.key === 'door-right');
    expect(leftDoor.position.x).toBeLessThan(0);
    expect(rightDoor.position.x).toBeGreaterThan(0);
    expect(Math.abs(leftDoor.position.x)).toBeCloseTo(rightDoor.position.x, 5);
    expect(leftDoor.position.y).toBeCloseTo(rightDoor.position.y, 5);

    const leftHandle = handles.find((p) => p.key.endsWith('-L'));
    const rightHandle = handles.find((p) => p.key.endsWith('-R'));
    expect(leftHandle).toBeDefined();
    expect(rightHandle).toBeDefined();
    expect(leftHandle.position.x).toBeLessThan(0);
    expect(rightHandle.position.x).toBeGreaterThan(0);
    expect(leftHandle.position.z).toBeGreaterThan(leftDoor.position.z);
  });

  it('positions shelves evenly and applies explode offsets', () => {
    const baseParts = getCabinetParts({ ...BASE_PARAMS, shelfCount: 3 }, 0);
    const explodedParts = getCabinetParts({ ...BASE_PARAMS, shelfCount: 3 }, 1);
    const shelves = baseParts.filter((p) => p.kind === 'shelf');
    expect(shelves).toHaveLength(3);

    // shelves should be sorted by Y height ascending
    const yPositions = shelves.map((p) => p.position.y);
    const sorted = [...yPositions].sort((a, b) => a - b);
    expect(yPositions).toEqual(sorted);

    const baseLeftSide = baseParts.find((p) => p.key === 'side-left');
    const explodedLeftSide = explodedParts.find((p) => p.key === 'side-left');
    expect(explodedLeftSide.position.x).toBeLessThan(baseLeftSide.position.x);

    const topPanel = baseParts.find((p) => p.key === 'top');
    const explodedTopPanel = explodedParts.find((p) => p.key === 'top');
    expect(explodedTopPanel.position.y).toBeGreaterThan(topPanel.position.y);
  });
});
