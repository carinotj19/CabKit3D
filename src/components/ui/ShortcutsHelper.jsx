import { useEffect, useState } from 'react';

const SHORTCUTS = [
  'Left/Right arrows resize width (Shift = 1mm)',
  'Up/Down arrows resize height (Shift = 1mm)',
  'Alt + Up/Down resize depth',
  'Space toggles turntable',
];

export default function ShortcutsHelper() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === '?' || event.key.toLowerCase() === 'h') {
        setVisible(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      {visible ? (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            background: 'rgba(15,23,42,0.92)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 10,
            boxShadow: '0 20px 60px rgba(15,23,42,0.4)',
            fontSize: 13,
            maxWidth: 260,
            zIndex: 50,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Quick shortcuts</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {SHORTCUTS.map((tip) => (
              <li key={tip} style={{ marginBottom: 4 }}>{tip}</li>
            ))}
          </ul>
          <button
            onClick={() => setVisible(false)}
            style={{
              marginTop: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      ) : null}
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: visible ? 'rgba(15,23,42,0.8)' : '#ffffff',
          color: visible ? '#fff' : '#0f172a',
          border: '1px solid rgba(15,23,42,0.3)',
          borderRadius: '999px',
          padding: '6px 12px',
          fontSize: 12,
          cursor: 'pointer',
          zIndex: 40,
          boxShadow: '0 10px 25px rgba(15,23,42,0.2)',
        }}
        title="Toggle shortcuts overlay (also press ?)"
      >
        {visible ? 'Hide shortcuts' : 'Show shortcuts'}
      </button>
    </>
  );
}
