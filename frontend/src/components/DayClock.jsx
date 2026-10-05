import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';

const Cell = () => (
  <span className="dc__cell">
    <span className="dc__d">0</span>
  </span>
);

// Time left until local midnight. Each digit that changes rolls in from below.
export default function DayClock({ label }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const cells = root.current.querySelectorAll('.dc__d');
      let prev = '';
      const read = () => {
        const now = new Date();
        const end = new Date(now);
        end.setHours(24, 0, 0, 0);
        const s = Math.max(0, Math.floor((end - now) / 1000));
        return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join('');
      };
      const tick = (animate) => {
        const str = read();
        [...str].forEach((ch, i) => {
          if (prev[i] === ch) return;
          cells[i].textContent = ch;
          if (animate && !reducedMotion()) {
            gsap.fromTo(cells[i], { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
          }
        });
        prev = str;
      };
      tick(false);
      const id = setInterval(() => tick(true), 1000);
      return () => clearInterval(id);
    },
    { scope: root }
  );

  return (
    <div className="dc" ref={root}>
      <span className="dc__label">{label}</span>
      <span className="dc__clock" role="timer" aria-live="off">
        <Cell />
        <Cell />
        <span className="dc__colon">:</span>
        <Cell />
        <Cell />
        <span className="dc__colon">:</span>
        <Cell />
        <Cell />
      </span>
    </div>
  );
}
