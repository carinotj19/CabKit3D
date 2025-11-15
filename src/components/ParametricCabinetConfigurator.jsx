import { useMemo, useCallback, useEffect, useState, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SceneCanvas from './SceneCanvas';
import CabinetModel from './CabinetModel';
import { estimatePrice } from '../lib/pricing';
import { generateSKU, buildSKUObject } from '../lib/sku';
import { validateParams } from '../lib/validation';
import { getCabinetParts } from '../lib/cabinetMath';
import SceneAnnotations from './SceneAnnotations';
import ShortcutsOverlay from './ShortcutsOverlay';
import ShortcutsHelper from './ui/ShortcutsHelper';
import OnboardingCoach from './OnboardingCoach';
import { buildBillOfMaterials, buildBOMCsv } from '../lib/bom';
import { getPricingPreset } from '../lib/pricingPresets';
import { useConfiguratorStore, DEFAULT_PARAMS } from '../store/useConfiguratorStore';
import { preloadCommonPreset } from '../store/preloadCommonPreset';
const ControlsPanelLazy = lazy(() => import('./ui/ControlsPanel'));
const MaterialsPanelLazy = lazy(() => import('./ui/MaterialsPanel'));

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
  const params = useConfiguratorStore((state) => state.params);
  const setParams = useConfiguratorStore((state) => state.setParams);
  const exploded = useConfiguratorStore((state) => state.exploded);
  const setExploded = useConfiguratorStore((state) => state.setExploded);
  const turntable = useConfiguratorStore((state) => state.turntable);
  const setTurntable = useConfiguratorStore((state) => state.setTurntable);
  const blueprintMode = useConfiguratorStore((state) => state.blueprintMode);
  const setBlueprintMode = useConfiguratorStore((state) => state.setBlueprint);
  const presets = useConfiguratorStore((state) => state.presets);
  const setPresets = useConfiguratorStore((state) => state.setPresets);
  const setValidationStore = useConfiguratorStore((state) => state.setValidation);
  const hasBlockingErrors = useConfiguratorStore((state) => state.hasBlockingErrors);
  const initialized = useConfiguratorStore((state) => state.initialized);
  const initializeStore = useConfiguratorStore((state) => state.initialize);
  const resetStore = useConfiguratorStore((state) => state.reset);

  useEffect(() => {
    if (!initialized) {
      initializeStore();
      preloadCommonPreset(useConfiguratorStore.getState());
    }
  }, [initialized, initializeStore]);

  const safeParams = useMemo(() => clampParams(params), [params]);
  const preset = useMemo(() => getPricingPreset(safeParams.pricingPreset), [safeParams.pricingPreset]);
  const price = useMemo(() => estimatePrice(safeParams, preset), [safeParams, preset]);
  const sku = useMemo(() => generateSKU(safeParams), [safeParams]);
  const validation = useMemo(() => validateParams(safeParams), [safeParams]);
  useEffect(() => {
    setValidationStore(validation);
  }, [validation, setValidationStore]);
  const partsExploded = useMemo(
    () => getCabinetParts(safeParams, exploded),
    [safeParams, exploded],
  );
  const partsBase = useMemo(
    () => getCabinetParts(safeParams, 0),
    [safeParams],
  );
  const bom = useMemo(() => buildBillOfMaterials(partsBase, safeParams), [partsBase, safeParams]);

  const animateCanvas = turntable || exploded > 0.001;

  const handleParamChange = useCallback((patch) => {
    setParams((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    const handleAdjust = (event) => {
      const { axis, delta } = event.detail || {};
      if (!axis || typeof delta !== 'number') return;
      setParams((current) => {
        const next = { ...current };
        if (axis === 'width') next.width = current.width + delta;
        if (axis === 'height') next.height = current.height + delta;
        if (axis === 'depth') next.depth = current.depth + delta;
        return next;
      });
    };
    const handleToggleTurntable = () => setTurntable((v) => !v);
    window.addEventListener('cabkit:adjust', handleAdjust);
    window.addEventListener('cabkit:toggle-turntable', handleToggleTurntable);
    return () => {
      window.removeEventListener('cabkit:adjust', handleAdjust);
      window.removeEventListener('cabkit:toggle-turntable', handleToggleTurntable);
    };
  }, [setParams, setTurntable]);

  const [sidebarTab, setSidebarTab] = useState('design');

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
    resetStore();
  }, [resetStore]);

  const handleExport = useCallback(() => {
    const data = buildSKUObject(safeParams, sku, price, bom);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sku}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [safeParams, sku, price, bom]);

  const handleExportCsv = useCallback(() => {
    const csv = buildBOMCsv(bom);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sku}-bom.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [bom, sku]);

  const handleAutoFix = useCallback((ruleId) => {
    const fixer = AUTO_FIXES[ruleId];
    if (!fixer) return;
    setParams((current) => fixer.apply ? fixer.apply(current) : current);
  }, []);

  const isSSR = typeof window === 'undefined';

  return (
    <>
      <ShortcutsOverlay />
      <ShortcutsHelper />
      <OnboardingCoach />
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100dvh' }}>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key="controls"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          style={{ borderRight: '1px solid #eceff4', padding: '20px', overflow: 'auto', background: '#fbfcff', display: 'grid', gap: 12 }}
        >
          <SidebarTabs active={sidebarTab} onChange={setSidebarTab} />
          <Suspense fallback={<div style={{ padding: '16px 0', color: '#94a3b8' }}>Loading panel...</div>}>
            {sidebarTab === 'design' ? (
              <ControlsPanelLazy
                params={safeParams}
                onChange={handleParamChange}
                exploded={exploded}
                onExploded={setExploded}
                turntable={turntable}
                onTurntable={setTurntable}
                blueprintMode={blueprintMode}
                onBlueprintMode={setBlueprintMode}
                sku={sku}
                price={price}
                onExport={handleExport}
                onExportCsv={handleExportCsv}
                validation={validation}
                hasBlockingErrors={hasBlockingErrors}
                presets={presets}
                onPresetSave={handlePresetSave}
                onPresetLoad={handlePresetLoad}
                onPresetDelete={handlePresetDelete}
                onReset={handleReset}
                autoFixes={AUTO_FIXES}
                onAutoFix={handleAutoFix}
                pricingPreset={safeParams.pricingPreset}
              />
            ) : (
              <MaterialsPanelLazy params={safeParams} />
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'relative' }}>
        {isSSR ? (
          <div
            style={{
              height: '100%',
              minHeight: 400,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #f8fbff, #e2e8f0)',
              color: '#475569',
              fontWeight: 600,
            }}
          >
            CabKit3D preview ready for {sku}
          </div>
        ) : (
          <SceneCanvas key={blueprintMode ? 'blueprint' : 'default'} animate={animateCanvas} blueprint={blueprintMode}>
            <CabinetModel
              parts={partsExploded}
              materialKey={safeParams.material}
              turntable={turntable}
              blueprint={blueprintMode}
            />
            <SceneAnnotations
              params={safeParams}
              exploded={exploded}
              parts={partsExploded}
              baseParts={partsBase}
              blueprint={blueprintMode}
            />
          </SceneCanvas>
        )}

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
    </>
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
  next.pricingPreset = normalizePricingPreset(next.pricingPreset);
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
  const allowed = ['horizontal', 'vertical', 'depth'];
  if (allowed.includes((value || '').toLowerCase())) {
    return value.toLowerCase();
  }
  return 'horizontal';
}

function normalizePricingPreset(value) {
  const preset = getPricingPreset(value);
  return preset.id;
}
function SidebarTabs({ active, onChange }) {
  const tabs = [
    { id: 'design', label: 'Design' },
    { id: 'materials', label: 'Materials' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid',
            borderColor: active === tab.id ? '#4f46e5' : '#e2e8f0',
            background: active === tab.id ? '#eef2ff' : '#fff',
            color: active === tab.id ? '#312e81' : '#475569',
            fontWeight: 600,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
