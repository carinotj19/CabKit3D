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
];

export function validateParams(params) {
  return RULES.filter((rule) => {
    try {
      return rule.test(params);
    } catch {
      return false;
    }
  }).map(({ id, level, message }) => ({ id, level, message }));
}
