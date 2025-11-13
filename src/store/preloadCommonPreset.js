export const COMMON_PRESET_NAME = 'Standard 600x720 double';

export function preloadCommonPreset(store) {
  if (typeof window === 'undefined' || !store) return;
  const task = () => {
    store.setPresets((presets) => {
      if (presets[COMMON_PRESET_NAME]) return presets;
      return {
        ...presets,
        [COMMON_PRESET_NAME]: {
          width: 600,
          height: 720,
          depth: 560,
          thickness: 18,
          backThickness: 6,
          doorCount: 2,
          material: 'ML',
          handle: 'HB',
          gap: 2,
          doorThickness: 20,
          shelfCount: 2,
          hingeSide: 'LEFT',
          handlePosition: 'middle',
          handleOrientation: 'horizontal',
          pricingPreset: 'US_STD',
        },
      };
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 2000 });
  } else {
    setTimeout(task, 500);
  }
}
