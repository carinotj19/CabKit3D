import { useEffect, useState } from 'react';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'dimensions', label: 'Dimensions', target: 'dimensions' },
  { id: 'construction', label: 'Construction', target: 'construction' },
  { id: 'style', label: 'Style', target: 'style' },
];

export default function OnboardingCoach() {
  const onboardingSeen = useConfiguratorStore((state) => state.onboardingSeen);
  const dismiss = useConfiguratorStore((state) => state.dismissOnboarding);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(!onboardingSeen);

  useEffect(() => {
    if (onboardingSeen) setVisible(false);
  }, [onboardingSeen]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [visible, index]);

  if (!visible) return null;

  const step = STEPS[index];

  return (
    <AnimatePresence>
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{
          position: 'fixed',
          left: 380,
          top: step.id === 'dimensions' ? 120 : step.id === 'construction' ? 300 : 470,
          background: '#0f172a',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          boxShadow: '0 25px 60px rgba(15,23,42,0.35)',
          zIndex: 60,
          width: 220,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Tip</div>
        <p style={{ margin: 0, fontSize: 13 }}>
          {step.id === 'dimensions' && 'Start with width/height/depth to set cabinet footprint.'}
          {step.id === 'construction' && 'Dial carcass thickness + shelves for structural integrity.'}
          {step.id === 'style' && 'Material + handle presets drive both visuals and pricing.'}
        </p>
        <button
          onClick={() => { setVisible(false); dismiss(); }}
          style={{ marginTop: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}
        >Got it</button>
      </motion.div>
    </AnimatePresence>
  );
}
