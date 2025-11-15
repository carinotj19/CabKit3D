import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const ORDER = [
  { key: 'carcassCost', label: 'Carcass' },
  { key: 'backCost', label: 'Back' },
  { key: 'doorCost', label: 'Doors' },
  { key: 'shelfCost', label: 'Shelves' },
  { key: 'shelfHardware', label: 'Shelf hardware' },
  { key: 'handleCost', label: 'Handles' },
  { key: 'hingeCost', label: 'Hinges' },
  { key: 'hingeSideAdjustment', label: 'Hinge premium' },
  { key: 'assembly', label: 'Assembly' },
  { key: 'regionMarkup', label: 'Region markup' },
];

export default function PricingBreakdownChart({
  breakdown = {},
  total = 0,
  currencySymbol = '$',
  warnings = [],
}) {
  const data = buildData(breakdown);
  const hasWarnings = Array.isArray(warnings) && warnings.length > 0;
  const badgeLabel = warnings.length > 1 ? `${warnings.length} load-case warnings` : 'Load-case warning';

  if (!data.length) {
    return (
      <div>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Add dimensions to see breakdown.</p>
        {hasWarnings ? <WarningList warnings={warnings} /> : null}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <div style={{ width: '100%', minWidth: 0, height: 240, position: 'relative' }}>
        {hasWarnings ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(249, 115, 22, 0.12)',
              color: '#9a3412',
              border: '1px solid rgba(249, 115, 22, 0.5)',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 10px',
              letterSpacing: 0.4,
              pointerEvents: 'none',
            }}
          >
            ! {badgeLabel}
          </div>
        ) : null}
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => `${currencySymbol}${Math.round(v)}`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
            <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="value" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, marginTop: 4, color: '#475569' }}>
        Total: {currencySymbol}{total.toFixed(2)}
      </div>
      {hasWarnings ? <WarningList warnings={warnings} /> : null}
    </div>
  );
}

function buildData(breakdown) {
  let cumulative = 0;
  return ORDER.filter((item) => (breakdown[item.key] ?? 0) > 0.01).map((item) => {
    const value = Number(breakdown[item.key] ?? 0);
    const start = cumulative;
    cumulative += value;
    return {
      name: item.label,
      start,
      value,
    };
  });
}

function WarningList({ warnings }) {
  if (!warnings?.length) return null;
  return (
    <div
      style={{
        marginTop: 8,
        padding: '8px 10px',
        border: '1px solid #fed7aa',
        background: '#fff7ed',
        borderRadius: 8,
        color: '#9a3412',
        fontSize: 12,
      }}
    >
      <strong style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Load-case watch</strong>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 2 }}>
        {warnings.map((warning) => (
          <li key={warning.id}>{warning.message}</li>
        ))}
      </ul>
    </div>
  );
}
