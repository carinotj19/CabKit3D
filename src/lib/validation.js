const MATERIAL_LOAD_SPECS = {
  ML: { label: 'Melamine light-duty', maxSpacing: 650 },
  PN: { label: 'Painted MDF', maxSpacing: 600 },
  WD: { label: 'Solid wood veneer', maxSpacing: 580 },
  MB: { label: 'Matte black laminate', maxSpacing: 700 },
  SS: { label: 'Stainless blend', maxSpacing: 720 },
  PW: { label: 'Premium plywood', maxSpacing: 630 },
  DEFAULT: { label: 'Standard panel', maxSpacing: 620 },
};

const RULES = [
  {
    id: 'double-door-width',
    level: 'error',
    test: (p) => p.doorCount === 2 && p.width < 500,
    message: 'Double doors need width >= 500 mm.',
  },
  {
    id: 'single-door-width',
    level: 'warning',
    test: (p) => p.doorCount === 1 && p.width < 350,
    message: 'Single doors narrower than 350 mm may clip hinges.',
  },
  {
    id: 'shelf-height',
    level: 'warning',
    test: (p) => p.shelfCount > 0 && p.height < 400,
    message: 'Add at least 400 mm of height when using shelves.',
  },
  {
    id: 'shelf-density',
    level: 'error',
    test: (p) => p.shelfCount > 0 && p.shelfCount >= Math.max(1, Math.floor(p.height / 150)),
    message: 'Reduce shelf count to keep >=150 mm vertical spacing.',
  },
  {
    id: 'door-gap',
    level: 'warning',
    test: (p) => p.gap < 1.5 && p.handle !== 'NL',
    message: 'Increase the door gap (>=1.5 mm) for handle clearance.',
  },
  {
    id: 'load-shelf-spacing',
    level: (p) => {
      const info = getShelfSpacingInfo(p);
      if (!info) return null;
      return info.ratio >= 1.3 ? 'error' : 'warning';
    },
    test: (p) => {
      const info = getShelfSpacingInfo(p);
      if (!info) return false;
      return info.spacing > info.limit;
    },
    message: (p) => {
      const info = getShelfSpacingInfo(p);
      if (!info) return '';
      return `Average shelf spacing ${Math.round(info.spacing)} mm exceeds ${info.label} limit (${info.limit} mm). Add a shelf or upgrade material stiffness.`;
    },
  },
];

export function validateParams(params) {
  return RULES.reduce((acc, rule) => {
    try {
      if (!rule.test(params)) {
        return acc;
      }
      const computedLevel = typeof rule.level === 'function' ? rule.level(params) : rule.level;
      if (!computedLevel) {
        return acc;
      }
      const computedMessage = typeof rule.message === 'function' ? rule.message(params) : rule.message;
      acc.push({ id: rule.id, level: computedLevel, message: computedMessage });
    } catch {
      // Silently ignore malformed rules.
    }
    return acc;
  }, []);
}

function getShelfSpacingInfo(params) {
  if (!params || params.shelfCount <= 0) return null;
  const segments = params.shelfCount + 1;
  if (segments <= 0) return null;
  const interiorHeight = Math.max(params.height - 2 * params.thickness, 0);
  if (interiorHeight <= 0) return null;
  const spacing = interiorHeight / segments;
  const spec = getMaterialLoadSpec(params.material);
  const ratio = spacing / spec.maxSpacing;
  return {
    spacing,
    limit: spec.maxSpacing,
    label: spec.label,
    ratio,
  };
}

function getMaterialLoadSpec(materialKey) {
  return MATERIAL_LOAD_SPECS[materialKey] || MATERIAL_LOAD_SPECS.DEFAULT;
}
