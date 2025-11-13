import { getPricingPreset } from './pricingPresets';

const MATERIAL_RATE_PER_M2 = {
  ML: 18,
  PN: 26,
  WD: 32,
  MB: 24, // matte black lacquer
  SS: 34, // stainless laminate
  PW: 20, // plywood core veneer
};

const BACK_RATE_PER_M2 = 10;
const DOOR_RATE_MULTIPLIER = 1.15;
const HANDLE_COST = {
  HB: 8,
  KN: 4,
  NL: 0,
  DP: 10,
  RP: 12,
};
const HINGE_COST_PER_DOOR = 7; // two hinges
const ASSEMBLY_COST = 12;
const SHELF_RATE_PER_M2 = 14;
const SHELF_HARDWARE = 1.5;
const RIGHT_HINGE_PREMIUM = 2;

const PANEL_KEYS = ['carcassCost', 'backCost', 'doorCost', 'shelfCost'];

export function estimatePrice(params, presetOverride) {
  const preset = presetOverride || getPricingPreset(params.pricingPreset);
  const materialFactor = preset.materialMultiplier ?? 1;
  const laborFactor = preset.laborMultiplier ?? 1;
  const regionMarkupRate = preset.regionMarkup ?? 0;
  const exchangeRate = preset.exchangeRate ?? 1;

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

  const baseCarcass = mm2ToM2(carcassArea) * MATERIAL_RATE_PER_M2[material];
  const baseBack = mm2ToM2(backArea) * BACK_RATE_PER_M2;
  const baseDoor = mm2ToM2(doorFaceArea) * MATERIAL_RATE_PER_M2[material] * DOOR_RATE_MULTIPLIER;
  const handleCost = doorCount * (HANDLE_COST[handle] ?? 0);
  const hingeCost = doorCount * HINGE_COST_PER_DOOR;

  const shelfQty = Math.max(0, Math.floor(shelfCount));
  const shelfArea = Math.max((width - 2 * thickness), 0) * Math.max((depth - thickness), 0);
  const baseShelf = shelfQty * mm2ToM2(shelfArea) * SHELF_RATE_PER_M2;
  const shelfHardware = shelfQty * SHELF_HARDWARE;

  const hingeSideAdjustment = doorCount === 1 && hingeSide === 'RIGHT' ? RIGHT_HINGE_PREMIUM : 0;

  const carcassCost = baseCarcass * materialFactor;
  const backCost = baseBack * materialFactor;
  const doorCost = baseDoor * materialFactor;
  const shelfCost = baseShelf * materialFactor;
  const assemblyCost = ASSEMBLY_COST * laborFactor;

  const subtotal =
    carcassCost +
    backCost +
    doorCost +
    handleCost +
    hingeCost +
    shelfCost +
    shelfHardware +
    hingeSideAdjustment +
    assemblyCost;

  const regionMarkupValue = subtotal * regionMarkupRate;
  const totalBase = subtotal + regionMarkupValue;

  const convert = (value) => Math.round(value * exchangeRate * 100) / 100;

  const breakdown = {
    carcassCost,
    backCost,
    doorCost,
    handleCost,
    hingeCost,
    shelfCost,
    shelfHardware,
    hingeSideAdjustment,
    assembly: assemblyCost,
    regionMarkup: regionMarkupValue,
  };

  const convertedBreakdown = Object.fromEntries(
    Object.entries(breakdown).map(([key, value]) => [key, convert(value)]),
  );

  return {
    total: convert(totalBase),
    currency: preset.currency,
    symbol: preset.currencySymbol,
    presetId: preset.id,
    breakdown: convertedBreakdown,
  };
}
