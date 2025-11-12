import { useEffect } from 'react';

const COARSE_STEP = 10;
const FINE_STEP = 1;

export default function ShortcutsOverlay() {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
      const fine = event.shiftKey;
      const step = fine ? FINE_STEP : COARSE_STEP;
      let axis = null;
      let delta = 0;
      switch (event.key) {
        case 'ArrowUp':
          axis = event.altKey ? 'depth' : 'height';
          delta = step;
          break;
        case 'ArrowDown':
          axis = event.altKey ? 'depth' : 'height';
          delta = -step;
          break;
        case 'ArrowRight':
          axis = 'width';
          delta = step;
          break;
        case 'ArrowLeft':
          axis = 'width';
          delta = -step;
          break;
        case ' ':
          event.preventDefault();
          window.dispatchEvent(new Event('cabkit:toggle-turntable'));
          break;
        default:
      }
      if (axis) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('cabkit:adjust', { detail: { axis, delta } }));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return null;
}
