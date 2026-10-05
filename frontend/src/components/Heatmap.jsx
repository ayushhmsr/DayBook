import { useMemo, useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';
import { addDays, dayKey } from '../utils/dates.js';

// Weeks as columns, Monday at the top. Cells ripple in from today backwards.
export default function Heatmap({ counts = {}, weeks = 15, onScroll = false }) {
  const root = useRef(null);

  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mondayOffset = (today.getDay() + 6) % 7; // 0 = Monday
    const start = addDays(today, -mondayOffset - (weeks - 1) * 7);
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const d = addDays(start, i);
      return { key: dayKey(d), future: d > today, today: d.getTime() === today.getTime() };
    });
  }, [weeks]);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const targets = root.current.querySelectorAll('.hm__cell:not(.hm__cell--future)');
      const vars = {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(2.2)',
        stagger: { amount: 1.1, from: 'end' },
      };
      if (onScroll) {
        gsap.from(targets, { ...vars, scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
      } else {
        gsap.from(targets, { ...vars, delay: 0.2 });
      }
    },
    { scope: root, dependencies: [weeks] }
  );

  return (
    <div className="hm" ref={root}>
      <div className="hm__scroll">
        <div className="hm__grid" role="img" aria-label="Entries per day over the last weeks">
          {cells.map((c) => {
            const n = counts[c.key] || 0;
            const level = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3;
            return (
              <span
                key={c.key}
                className={`hm__cell${c.future ? ' hm__cell--future' : ''}${c.today ? ' hm__cell--today' : ''}`}
                data-l={level}
                title={c.future ? '' : `${c.key}: ${n} ${n === 1 ? 'entry' : 'entries'}`}
              />
            );
          })}
        </div>
      </div>
      <div className="hm__legend" aria-hidden="true">
        <span>Less</span>
        <span className="hm__cell" data-l="0" />
        <span className="hm__cell" data-l="1" />
        <span className="hm__cell" data-l="2" />
        <span className="hm__cell" data-l="3" />
        <span>More</span>
      </div>
    </div>
  );
}
