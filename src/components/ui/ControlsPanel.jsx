import { motion } from 'framer-motion';

export default function ControlsPanel({
  params,
  onChange,
  exploded,
  onExploded,
  turntable,
  onTurntable,
  sku,
  price,
  onExport,
}) {
  const handleNumber = (key) => (event) => {
    const value = Number(event.target.value);
    onChange({ [key]: value });
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24 }}>CabKit3D</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Parametric cabinet configurator</p>
      </div>

      <Section title="Dimensions (mm)">
        <Row label="Width">
          <NumberInput value={params.width} onChange={handleNumber('width')} min={250} max={2000} step={10} />
        </Row>
        <Row label="Height">
          <NumberInput value={params.height} onChange={handleNumber('height')} min={250} max={2600} step={10} />
        </Row>
        <Row label="Depth">
          <NumberInput value={params.depth} onChange={handleNumber('depth')} min={200} max={1000} step={10} />
        </Row>
      </Section>

      <Section title="Construction">
        <Row label="Carcass t.">
          <NumberInput value={params.thickness} onChange={handleNumber('thickness')} min={12} max={30} step={1} />
        </Row>
        <Row label="Back t.">
          <NumberInput value={params.backThickness} onChange={handleNumber('backThickness')} min={3} max={10} step={1} />
        </Row>
        <Row label="Doors">
          <select value={params.doorCount} onChange={(e) => onChange({ doorCount: Number(e.target.value) })}>
            <option value={1}>Single</option>
            <option value={2}>Double</option>
          </select>
        </Row>
        <Row label="Door t.">
          <NumberInput value={params.doorThickness} onChange={handleNumber('doorThickness')} min={16} max={25} step={1} />
        </Row>
        <Row label="Gap">
          <NumberInput value={params.gap} onChange={handleNumber('gap')} min={1} max={4} step={0.5} />
        </Row>
        <Row label="Hinge side">
          <select
            value={params.hingeSide}
            onChange={(e) => onChange({ hingeSide: e.target.value })}
            disabled={params.doorCount !== 1}
          >
            <option value="LEFT">Left</option>
            <option value="RIGHT">Right</option>
          </select>
        </Row>
      </Section>

      <Section title="Style">
        <Row label="Material">
          <select value={params.material} onChange={(e) => onChange({ material: e.target.value })}>
            <option value="ML">Melamine</option>
            <option value="PN">Paint</option>
            <option value="WD">Wood Veneer</option>
          </select>
        </Row>
        <Row label="Handle">
          <select value={params.handle} onChange={(e) => onChange({ handle: e.target.value })}>
            <option value="HB">Bar</option>
            <option value="KN">Knob</option>
            <option value="NL">No Handle</option>
          </select>
        </Row>
      </Section>

      <Section title="Interior">
        <Row label="Shelves">
          <NumberInput value={params.shelfCount} onChange={handleNumber('shelfCount')} min={0} max={8} step={1} />
        </Row>
      </Section>

      <Section title="View">
        <Row label="Exploded">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={exploded}
            onChange={(e) => onExploded(Number(e.target.value))}
          />
        </Row>
        <Row label="Turntable">
          <input type="checkbox" checked={turntable} onChange={(e) => onTurntable(e.target.checked)} />
        </Row>
      </Section>

      <Section title="Summary">
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>SKU:</strong> {sku}</div>
          <div><strong>Estimate:</strong> ${price.toFixed(2)}</div>
          <button onClick={onExport}>Download SKU JSON</button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <motion.section
      layout
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 600 }}>{title}</div>
      {children}
    </motion.section>
  );
}

function Row({ label, children }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 10, fontSize: 14 }}>
      <span style={{ color: '#4b5563' }}>{label}</span>
      <span>{children}</span>
    </label>
  );
}

function NumberInput(props) {
  return (
    <input
      type="number"
      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}
      {...props}
    />
  );
}
