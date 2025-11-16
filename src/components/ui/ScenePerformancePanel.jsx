import { useEffect, useState } from 'react';

const PANEL_STYLE = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'rgba(15, 23, 42, 0.85)',
  color: '#f8fafc',
  padding: '14px 16px',
  borderRadius: 12,
  width: 260,
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)',
  fontSize: 13,
  lineHeight: 1.4,
  display: 'grid',
  gap: 8,
};

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  fontSize: 12,
  color: '#cbd5f5',
};

export default function ScenePerformancePanel({ stats, lowPowerMode = false, onToggleLowPower }) {
  const frameMetrics = useFrameMetrics();
  if (!stats) return null;
  const { instancedTotal, drawCalls, gpuMemoryMB, carcass, door, shelf } = stats;
  const savingsFactor = drawCalls > 0 ? Math.max(1, Math.round(instancedTotal / drawCalls)) : 1;

  return (
    <div style={PANEL_STYLE}>
      <div style={{ fontWeight: 600, letterSpacing: 0.3, fontSize: 13, textTransform: 'uppercase', color: '#a5b4fc' }}>
        Scene performance
      </div>

      <div style={ROW_STYLE}>
        <span>Frame time</span>
        <span style={{ fontSize: 16, color: '#ffffff' }}>
          {frameMetrics.frameMs.toFixed(1)} ms&nbsp;
          <span style={{ fontSize: 12, color: '#94a3b8' }}>({Math.round(frameMetrics.fps)} fps)</span>
        </span>
      </div>

      <div style={ROW_STYLE}>
        <span>GPU budget</span>
        <span style={{ fontSize: 15, color: '#ffffff' }}>{gpuMemoryMB.toFixed(1)} MB</span>
      </div>

      <div style={{ fontSize: 12, color: '#cbd5f5' }}>
        Instancing {instancedTotal} panels/doors/shelves into {drawCalls || 1} draw calls (~{savingsFactor}× fewer) keeps the
        renderer responsive even as dimensions scale.
      </div>

      <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#e2e8f0' }}>
        <MetricBar label="Panels" count={carcass} accent="#38bdf8" />
        <MetricBar label="Doors" count={door} accent="#f472b6" />
        <MetricBar label="Shelves" count={shelf} accent="#facc15" />
      </div>

      {onToggleLowPower ? (
        <div style={{ display: 'grid', gap: 6 }}>
          <button
            onClick={onToggleLowPower}
            style={{
              border: '1px solid rgba(148,163,184,0.5)',
              background: lowPowerMode ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
              color: '#e2e8f0',
              padding: '9px 10px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {lowPowerMode ? 'Low-power mode: ON' : 'Enable low-power mode'}
          </button>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Cuts HDRI, shadows, and render resolution to stabilize FPS on low-end GPUs or battery devices.
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          Instanced transforms recycle a single geometry buffer, so FPS stays high even when you pack the interior with storage.
        </div>
      )}
    </div>
  );
}

function MetricBar({ label, count, accent }) {
  const clamped = Math.min(1, count / 12);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color: '#c7d2fe' }}>{count}</span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${Math.max(6, clamped * 100)}%`, background: accent, height: '100%' }} />
      </div>
    </div>
  );
}

function useFrameMetrics() {
  const [metrics, setMetrics] = useState({ fps: 60, frameMs: 16.7 });
  useEffect(() => {
    let mounted = true;
    let last = performance.now();
    let accumulator = 0;
    let frames = 0;
    let raf;
    const loop = (now) => {
      const delta = now - last;
      last = now;
      frames += 1;
      accumulator += delta;
      if (accumulator >= 500) {
        const fps = (frames * 1000) / accumulator;
        const frameMs = accumulator / frames;
        if (mounted) {
          setMetrics({
            fps,
            frameMs,
          });
        }
        frames = 0;
        accumulator = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, []);
  return metrics;
}
