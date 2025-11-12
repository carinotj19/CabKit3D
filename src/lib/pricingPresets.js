export const PRICING_PRESETS = {
  US_STD: {
    id: 'US_STD',
    label: 'US · USD standard',
    currency: 'USD',
    currencySymbol: '$',
    exchangeRate: 1,
    materialMultiplier: 1,
    laborMultiplier: 1,
    regionMarkup: 0.05,
  },
  EU_STD: {
    id: 'EU_STD',
    label: 'EU · EUR',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.92,
    materialMultiplier: 1.05,
    laborMultiplier: 1.1,
    regionMarkup: 0.08,
  },
  PREMIUM: {
    id: 'PREMIUM',
    label: 'Premium showroom',
    currency: 'USD',
    currencySymbol: '$',
    exchangeRate: 1,
    materialMultiplier: 1.25,
    laborMultiplier: 1.2,
    regionMarkup: 0.15,
  },
};

export function getPricingPreset(id = 'US_STD') {
  return PRICING_PRESETS[id] ?? PRICING_PRESETS.US_STD;
}
