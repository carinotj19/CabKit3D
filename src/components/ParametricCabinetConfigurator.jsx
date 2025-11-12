import { useMemo, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SceneCanvas from './SceneCanvas';
import CabinetModel from './CabinetModel';
import ControlsPanel from './ui/ControlsPanel';
import { estimatePrice } from '../lib/pricing';
import { generateSKU, buildSKUObject } from '../lib/sku';
import { validateParams } from '../lib/validation';
import { getCabinetParts } from '../lib/cabinetMath';
import SceneAnnotations from './SceneAnnotations';

const DEFAULT_PARAMS = {
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
};

const LIMITS = {
  width: [250, 2000],
  height: [250, 2600],
  depth: [200, 1000],
  thickness: [12, 30],
  backThickness: [3, 10],
  doorCount: [1, 2],
  gap: [1, 4],
  doorThickness: [16, 25],
  shelfCount: [0, 8],
};

const STORAGE_KEYS = {
  lastParams: 'cabkit3d:lastParams',
  presets: 'cabkit3d:presets',
};

const AUTO_FIXES = {
  'double-door-width': {
    label: 'Set width to 500 mm',
    apply: (p) => ({ ...p, width: Math.max(p.width, 500) }),
  },
  'single-door-width': {
    label: 'Set width to 350 mm',
    apply: (p) => ({ ...p, width: Math.max(p.width, 350) }),
  },
  'shelf-height': {
    label: 'Remove shelves',
    apply: (p) => ({ ...p, shelfCount: 0 }),
  },
  'shelf-density': {
    label: 'Clamp shelf count',
    apply: (p) => {
      const limit = Math.max(1, Math.floor(p.height / 150));
      const nextCount = Math.max(0, limit - 1);
      return { ...p, shelfCount: Math.min(p.shelfCount, nextCount) };
    },
  },
  'door-gap': {
    label: 'Use 1.5 mm gap',
    apply: (p) => ({ ...p, gap: Math.max(p.gap, 1.5) }),
  },
};

export default function ParametricCabinetConfigurator() {
  const [params, setParams] = useState(() => readStorage(STORAGE_KEYS.lastParams, DEFAULT_PARAMS));
  const [exploded, setExploded] = useState(0);
  const [turntable, setTurntable] = useState(false);
  const [presets, setPresets] = useState(() => readStorage(STORAGE_KEYS.presets, {}));

  const safeParams = useMemo(() => clampParams(params), [params]);
  const price = useMemo(() => estimatePrice(safeParams), [safeParams]);
  const sku = useMemo(() => generateSKU(safeParams), [safeParams]);
  const validation = useMemo(() => validateParams(safeParams), [safeParams]);
  const hasBlockingErrors = validation.some((rule) => rule.level === 'error');
  const partsExploded = useMemo(
    () => getCabinetParts(safeParams, exploded),
    [safeParams, exploded],
  );
  const partsBase = useMemo(
    () => getCabinetParts(safeParams, 0),
    [safeParams],
  );

  const animateCanvas = turntable || exploded > 0.001;

  const handleParamChange = useCallback((patch) => {
    setParams((current) => ({ ...current, ...patch }));
  }, []);

  const handlePresetSave = useCallback((name) => {
    if (!name) return false;
    setPresets((current) => ({
      ...current,
      [name]: safeParams,
    }));
    return true;
  }, [safeParams]);

  const handlePresetLoad = useCallback((name) => {
    setParams((current) => {
      const preset = presets?.[name];
      if (!preset) return current;
      return { ...preset };
    });
  }, [presets]);

  const handlePresetDelete = useCallback((name) => {
    if (!name) return;
    setPresets((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setExploded(0);
    setTurntable(false);
  }, []);

  const handleExport = useCallback(() => {
    const data = buildSKUObject(safeParams, sku, price);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sku}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [safeParams, sku, price]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.lastParams, safeParams);
  }, [safeParams]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.presets, presets);
  }, [presets]);

  const handleAutoFix = useCallback((ruleId) => {
    const fixer = AUTO_FIXES[ruleId];
    if (!fixer) return;
    setParams((current) => fixer.apply ? fixer.apply(current) : current);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100dvh' }}>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key="controls"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          style={{ borderRight: '1px solid #eceff4', padding: '20px', overflow: 'auto', background: '#fbfcff' }}
        >
          <ControlsPanel
            params={safeParams}
            onChange={handleParamChange}
            exploded={exploded}
            onExploded={setExploded}
            turntable={turntable}
            onTurntable={setTurntable}
            sku={sku}
            price={price.total}
            onExport={handleExport}
            validation={validation}
            hasBlockingErrors={hasBlockingErrors}
            presets={presets}
            onPresetSave={handlePresetSave}
            onPresetLoad={handlePresetLoad}
            onPresetDelete={handlePresetDelete}
            onReset={handleReset}
            autoFixes={AUTO_FIXES}
            onAutoFix={handleAutoFix}
          />
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'relative' }}>
        <SceneCanvas animate={animateCanvas}>
          <CabinetModel
            parts={partsExploded}
            materialKey={safeParams.material}
            turntable={turntable}
          />
          <SceneAnnotations
            params={safeParams}
            exploded={exploded}
            parts={partsExploded}
            baseParts={partsBase}
          />
        </SceneCanvas>

        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            background: 'rgba(255, 255, 255, 0.92)',
            padding: '10px 14px',
            borderRadius: 10,
            boxShadow: '0 8px 25px rgba(15, 23, 42, 0.12)',
            fontSize: 13,
            minWidth: 200,
          }}
        >
          <div><strong>SKU:</strong> {sku}</div>
          <div><strong>Estimate:</strong> ${price.total.toFixed(2)}</div>
          {hasBlockingErrors ? (
            <div style={{ color: '#c53030', marginTop: 6 }}>Resolve errors before exporting.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function clampParams(p) {
  const next = { ...p };
  Object.entries(LIMITS).forEach(([key, [min, max]]) => {
    next[key] = clamp(next[key], min, max);
    if (key === 'doorCount' || key === 'shelfCount') {
      next[key] = Math.round(next[key]);
    }
  });
  next.hingeSide = next.hingeSide === 'RIGHT' ? 'RIGHT' : 'LEFT';
  next.handlePosition = normalizeHandlePosition(next.handlePosition);
  next.handleOrientation = normalizeHandleOrientation(next.handleOrientation);
  return next;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function normalizeHandlePosition(value) {
  const allowed = ['top', 'middle', 'bottom'];
  if (allowed.includes((value || '').toLowerCase())) {
    return value.toLowerCase();
  }
  return 'middle';
}

function normalizeHandleOrientation(value) {
  const allowed = ['horizontal', 'vertical'];
  if (allowed.includes((value || '').toLowerCase())) {
    return value.toLowerCase();
  }
  return 'horizontal';
}

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
    // ignore storage errors (private mode, quota, etc.)
  }
}
