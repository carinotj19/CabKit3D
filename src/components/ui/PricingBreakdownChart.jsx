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

export default function PricingBreakdownChart({ breakdown = {}, total = 0, currencySymbol = '$' }) {
  const data = buildData(breakdown);
  if (!data.length) {
    return <p style={{ color: '#94a3b8', fontSize: 13 }}>Add dimensions to see breakdown.</p>;
  }

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tickFormatter={(v) => `${currencySymbol}${Math.round(v)}`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${currencySymbol}${Number(value).toFixed(2)}`} />
          <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'right', fontSize: 12, marginTop: 4, color: '#475569' }}>
        Total: {currencySymbol}{total.toFixed(2)}
      </div>
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
