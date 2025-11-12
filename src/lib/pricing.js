const MATERIAL_RATE_PER_M2 = {
  ML: 18,
  PN: 26,
  WD: 32,
};

const BACK_RATE_PER_M2 = 10;
const DOOR_RATE_MULTIPLIER = 1.15;
const HANDLE_COST = {
  HB: 8,
  KN: 4,
  NL: 0,
};
const HINGE_COST_PER_DOOR = 7; // two hinges
const ASSEMBLY_COST = 12;
const SHELF_RATE_PER_M2 = 14;
const SHELF_HARDWARE = 1.5;
const RIGHT_HINGE_PREMIUM = 2;

export function estimatePrice(params) {
  const {
    width,
    height,
    depth,
    thickness,
    backThickness,
    doorCount,
    material,
    handle,
    shelfCount = 0,
    hingeSide = 'LEFT',
  } = params;

  const mm2ToM2 = (value) => value / 1_000_000;

  const topBottomArea = 4 * (width * depth);
  const sideArea = 4 * (height * depth);
  const backArea = (width - 2 * thickness) * (height - 2 * thickness);
  const carcassArea = topBottomArea + sideArea + backArea;

  const doorFaceArea = doorCount === 1 ? width * height : (width / 2) * height * 2;

  const carcassCost = mm2ToM2(carcassArea) * MATERIAL_RATE_PER_M2[material];
  const backCost = mm2ToM2(backArea) * BACK_RATE_PER_M2;
  const doorCost = mm2ToM2(doorFaceArea) * MATERIAL_RATE_PER_M2[material] * DOOR_RATE_MULTIPLIER;
  const handleCost = doorCount * (HANDLE_COST[handle] ?? 0);
  const hingeCost = doorCount * HINGE_COST_PER_DOOR;

  const shelfQty = Math.max(0, Math.floor(shelfCount));
  const shelfArea = Math.max((width - 2 * thickness), 0) * Math.max((depth - thickness), 0);
  const shelfCost = shelfQty * mm2ToM2(shelfArea) * SHELF_RATE_PER_M2;
  const shelfHardware = shelfQty * SHELF_HARDWARE;

  const hingeSideAdjustment = doorCount === 1 && hingeSide === 'RIGHT' ? RIGHT_HINGE_PREMIUM : 0;

  const total = carcassCost + backCost + doorCost + handleCost + hingeCost + shelfCost + shelfHardware + hingeSideAdjustment + ASSEMBLY_COST;

  return {
    total,
    breakdown: {
      carcassCost,
      backCost,
      doorCost,
      handleCost,
      hingeCost,
      shelfCost,
      shelfHardware,
      hingeSideAdjustment,
      assembly: ASSEMBLY_COST,
    },
  };
}
