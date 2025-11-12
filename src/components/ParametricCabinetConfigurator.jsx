import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SceneCanvas from './SceneCanvas';
import CabinetModel from './CabinetModel';
import ControlsPanel from './ui/ControlsPanel';
import { estimatePrice } from '../lib/pricing';
import { generateSKU, buildSKUObject } from '../lib/sku';

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

export default function ParametricCabinetConfigurator() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [exploded, setExploded] = useState(0);
  const [turntable, setTurntable] = useState(false);

  const safeParams = useMemo(() => clampParams(params), [params]);

  const price = useMemo(() => estimatePrice(safeParams), [safeParams]);
  const sku = useMemo(() => generateSKU(safeParams), [safeParams]);

  const animateCanvas = turntable || exploded > 0.001;

  const handleParamChange = useCallback((patch) => {
    setParams((current) => ({ ...current, ...patch }));
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
          />
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'relative' }}>
        <SceneCanvas animate={animateCanvas}>
          <CabinetModel params={safeParams} exploded={exploded} turntable={turntable} />
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
        </div>
      </div>
    </div>
  );
}

function clampParams(p) {
  const next = { ...p };
  Object.entries(LIMITS).forEach(([key, [min, max]]) => {
    next[key] = clamp(next[key], min, max);
    if (key === 'doorCount') {
      next[key] = Math.round(next[key]);
    }
    if (key === 'shelfCount') {
      next[key] = Math.round(next[key]);
    }
  });
  next.hingeSide = next.hingeSide === 'RIGHT' ? 'RIGHT' : 'LEFT';
  return next;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}
