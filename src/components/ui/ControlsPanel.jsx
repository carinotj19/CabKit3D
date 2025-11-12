import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const RULE_FIELD_MAP = {
  'double-door-width': ['width'],
  'single-door-width': ['width'],
  'shelf-height': ['shelfCount'],
  'shelf-density': ['shelfCount'],
  'door-gap': ['gap'],
};

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
  validation = [],
  hasBlockingErrors = false,
  presets = {},
  onPresetSave,
  onPresetLoad,
  onPresetDelete,
  onReset,
  autoFixes = {},
  onAutoFix,
}) {
  const handleNumber = (key) => (event) => {
    const value = Number(event.target.value);
    onChange({ [key]: value });
  };
  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const presetNames = useMemo(
    () => Object.keys(presets).sort((a, b) => a.localeCompare(b)),
    [presets],
  );

  const handleSavePreset = () => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    const result = onPresetSave?.(trimmed);
    if (result !== false) {
      setSelectedPreset(trimmed);
      setPresetName('');
    }
  };

  const handleLoadPreset = (name) => {
    setSelectedPreset(name);
    if (name) {
      onPresetLoad?.(name);
    }
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;
    onPresetDelete?.(selectedPreset);
    setSelectedPreset('');
  };

  const hintsByField = useMemo(() => {
    const map = {};
    validation.forEach((rule) => {
      const fields = RULE_FIELD_MAP[rule.id];
      if (!fields) return;
      fields.forEach((field) => {
        if (!map[field]) map[field] = [];
        map[field].push(rule);
      });
    });
    return map;
  }, [validation]);

  const getHints = (field) => hintsByField[field] ?? [];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24 }}>CabKit3D</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Parametric cabinet configurator</p>
      </div>

      <Section title="Dimensions (mm)">
        <Row label="Width" hints={getHints('width')} autoFixes={autoFixes} onAutoFix={onAutoFix}>
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
        <Row label="Gap" hints={getHints('gap')} autoFixes={autoFixes} onAutoFix={onAutoFix}>
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
        <Row label="Handle pos.">
          <select
            value={params.handlePosition}
            onChange={(e) => onChange({ handlePosition: e.target.value })}
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </Row>
        <Row label="Handle orient.">
          <select
            value={params.handleOrientation}
            onChange={(e) => onChange({ handleOrientation: e.target.value })}
          >
            <option value="horizontal">Horizontal (X)</option>
            <option value="vertical">Vertical (Y)</option>
            <option value="depth">Depth (Z)</option>
          </select>
        </Row>
      </Section>

      <Section title="Interior">
        <Row label="Shelves" hints={getHints('shelfCount')} autoFixes={autoFixes} onAutoFix={onAutoFix}>
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
          <button onClick={onExport} disabled={hasBlockingErrors}>Download SKU JSON</button>
          {hasBlockingErrors ? (
            <small style={{ color: '#c53030' }}>Fix blocking errors to export.</small>
          ) : null}
        </div>
      </Section>

      <Section title="Validation">
        {validation.length === 0 ? (
          <p style={{ margin: 0, color: '#16a34a', fontSize: 14 }}>All constraints satisfied.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, display: 'grid', gap: 6 }}>
            {validation.map((rule) => (
              <li
                key={rule.id}
                style={{ color: rule.level === 'error' ? '#c53030' : '#d97706' }}
              >
                {rule.message}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Presets">
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="New preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}
            />
            <button onClick={handleSavePreset}>Save</button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={selectedPreset}
              onChange={(e) => handleLoadPreset(e.target.value)}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}
            >
              <option value="">Load preset...</option>
              {presetNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button onClick={handleDeletePreset} disabled={!selectedPreset}>Delete</button>
          </div>
          <button onClick={onReset}>Reset to defaults</button>
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

function Row({ label, children, hints = [], autoFixes, onAutoFix }) {
  const hintElements = hints.map((rule) => {
    const meta = autoFixes?.[rule.id];
    return (
      <div
        key={rule.id}
        style={{
          fontSize: 12,
          color: rule.level === 'error' ? '#c53030' : '#b45309',
          marginTop: 4,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span>{rule.message}</span>
        {meta ? (
          <button
            type="button"
            onClick={() => onAutoFix?.(rule.id)}
            style={{
              border: '1px solid #94a3b8',
              background: '#fff',
              color: '#0f172a',
              borderRadius: 4,
              fontSize: 11,
              padding: '2px 6px',
            }}
          >
            {meta.label}
          </button>
        ) : null}
      </div>
    );
  });

  return (
    <label style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 10, fontSize: 14 }}>
      <span style={{ color: '#4b5563' }}>{label}</span>
      <span>
        {children}
        {hintElements}
      </span>
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
