export default function SocialPreviewStrip({ previewUrl }) {
  if (!previewUrl) {
    return (
      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
        Run <code>npm run prerender</code> to refresh the SSR snapshot before sharing. Preview thumbnails will appear here once
        available.
      </p>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '52.5%',
          borderRadius: 14,
          border: '1px solid #cbd5f5',
          overflow: 'hidden',
          background: '#0f172a',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
        }}
      >
        <iframe
          key={previewUrl}
          title="CabKit3D social preview"
          src={previewUrl}
          loading="lazy"
          sandbox="allow-same-origin"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '200%',
            height: '200%',
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
            border: 'none',
            pointerEvents: 'none',
            background: 'transparent',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            background: 'rgba(15, 23, 42, 0.65)',
            color: '#e2e8f0',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            letterSpacing: 0.4,
          }}
        >
          1200 × 630 SSR frame
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
        Snapshot comes from <code>dist-ssr/index.html</code>. Update it whenever you change visuals to keep social cards fresh.
      </p>
    </div>
  );
}
