import { create } from 'zustand';

export const DEFAULT_PARAMS = {
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
  shelfCount: 0,
  hingeSide: 'LEFT',
  handlePosition: 'middle',
  handleOrientation: 'horizontal',
  pricingPreset: 'US_STD',
};

export const STORAGE_KEYS = {
  lastParams: 'cabkit3d:lastParams',
  presets: 'cabkit3d:presets',
  lowPower: 'cabkit3d:lowPower',
};

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const useConfiguratorStore = create((set) => ({
  params: DEFAULT_PARAMS,
  exploded: 0,
  turntable: false,
  blueprintMode: false,
  lowPowerMode: false,
  presets: {},
  validation: [],
  hasBlockingErrors: false,
  onboardingSeen: false,
  initialized: false,
  initialize() {
    const lowPowerDefault = detectLowPowerDefault();
    set({
      params: readStorage(STORAGE_KEYS.lastParams, DEFAULT_PARAMS),
      presets: readStorage(STORAGE_KEYS.presets, {}),
      onboardingSeen: !!readStorage('cabkit3d:onboarding', false),
      lowPowerMode: readStorage(STORAGE_KEYS.lowPower, lowPowerDefault),
      initialized: true,
    });
  },
  setParams(patch) {
    set((state) => {
      const next = typeof patch === 'function' ? patch(state.params) : { ...state.params, ...patch };
      writeStorage(STORAGE_KEYS.lastParams, next);
      return { params: next };
    });
  },
  setExploded(value) {
    set({ exploded: value });
  },
  setTurntable(value) {
    set((state) => ({
      turntable: typeof value === 'function' ? value(state.turntable) : value,
    }));
  },
  setBlueprint(value) {
    set((state) => ({
      blueprintMode: typeof value === 'function' ? value(state.blueprintMode) : value,
    }));
  },
  setLowPowerMode(value) {
    set((state) => {
      const next = typeof value === 'function' ? value(state.lowPowerMode) : value;
      writeStorage(STORAGE_KEYS.lowPower, next);
      return { lowPowerMode: next };
    });
  },
  setPresets(updater) {
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.presets) : updater;
      writeStorage(STORAGE_KEYS.presets, next);
      return { presets: next };
    });
  },
  setValidation(list) {
    set({ validation: list, hasBlockingErrors: list.some((rule) => rule.level === 'error') });
  },
  dismissOnboarding() {
    writeStorage('cabkit3d:onboarding', true);
    set({ onboardingSeen: true });
  },
  reset() {
    const lowPowerDefault = detectLowPowerDefault();
    writeStorage(STORAGE_KEYS.lastParams, DEFAULT_PARAMS);
    writeStorage(STORAGE_KEYS.lowPower, lowPowerDefault);
    set({
      params: DEFAULT_PARAMS,
      exploded: 0,
      turntable: false,
      blueprintMode: false,
      lowPowerMode: lowPowerDefault,
    });
  },
}));

if (typeof window !== 'undefined') {
  useConfiguratorStore.getState().initialize();
}

function detectLowPowerDefault() {
  if (typeof window === 'undefined') return false;
  const prefersReduceMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const limitedMemory = typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 4;
  const fewCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  return prefersReduceMotion || limitedMemory || fewCores;
}
