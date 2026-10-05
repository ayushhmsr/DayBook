import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';

// Tweens a number from its last shown value to the new one.
export default function CountUp({ value = 0, decimals = 0, prefix = '', suffix = '', signed = false, duration = 1.1 }) {
  const ref = useRef(null);
  const last = useRef(0);

  const fmt = (n) => {
    const num = typeof n === 'number' && !Number.isNaN(n) ? n : 0;
    const abs = Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const sign = num < 0 ? '-' : signed && num > 0 ? '+' : '';
    return `${sign}${prefix}${abs}${suffix}`;
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (reducedMotion()) {
        el.textContent = fmt(value);
        last.current = value;
        return;
      }
      const o = { v: last.current };
      el.textContent = fmt(o.v);
      gsap.to(o, {
        v: value,
        duration,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = fmt(o.v);
          last.current = o.v;
        },
        onComplete: () => {
          el.textContent = fmt(value);
          last.current = value;
        },
      });
    },
    { dependencies: [value], revertOnUpdate: true }
  );

  return (
    <span ref={ref} className="countup">
      {fmt(value)}
    </span>
  );
}
