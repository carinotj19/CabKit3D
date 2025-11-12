export function generateSKU(params) {
  const {
    width,
    height,
    depth,
    material,
    handle,
    doorCount,
    shelfCount = 0,
    hingeSide = 'LEFT',
  } = params;
  const size = `${width}x${height}x${depth}`;
  const shelves = `S${Math.max(0, Math.floor(shelfCount))}`;
  const hingeCode = (hingeSide && hingeSide.toUpperCase().startsWith('R')) ? 'R' : 'L';
  return `CAB-${size}-${material}-${handle}-D${doorCount}-${shelves}-H${hingeCode}`;
}

export function buildSKUObject(params, sku, price) {
  return {
    sku,
    params,
    price: price.total ?? price,
    currency: 'USD',
    breakdown: price.breakdown ?? null,
    timestamp: new Date().toISOString(),
    version: 1,
  };
}
