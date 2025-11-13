export default function MaterialsPanel({ params }) {
  return (
    <div style={{ padding: 12, border: '1px dashed #cbd5f5', borderRadius: 12, color: '#475569' }}>
      <h3 style={{ marginTop: 0 }}>Materials (coming soon)</h3>
      <p style={{ fontSize: 14 }}>
        This panel will host PBR presets, texture packs, and finish-level QA for the current selection ({params.material}).
      </p>
      <ul style={{ fontSize: 13, marginLeft: 16 }}>
        <li>Swap melamine / veneer libraries</li>
        <li>Assign edge-band SKUs</li>
        <li>Preview multi-layer PBR stacks before applying</li>
      </ul>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>Lazy-loaded so future tooling doesn't bloat the initial bundle.</p>
    </div>
  );
}
