import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';

// Big counting numbers. Pass real facts only: items = [{ value, label }].
export default function NumberBand({ items }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const nums = root.current.querySelectorAll('.nb__n');
      nums.forEach((n) => {
        n.textContent = '0';
      });
      const st = { trigger: root.current, start: 'top 86%', once: true };

      gsap.from('.nb__item', { y: 56, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: st });
      gsap.from('.nb__rule', { scaleY: 0, transformOrigin: 'top center', duration: 0.9, stagger: 0.12, ease: 'power3.inOut', scrollTrigger: st });
      nums.forEach((n, i) => {
        const o = { v: 0 };
        gsap.to(o, {
          v: items[i].value,
          duration: 1.8,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: st,
          onUpdate: () => {
            n.textContent = String(Math.round(o.v));
          },
          onComplete: () => {
            n.textContent = String(items[i].value);
          },
        });
      });
    },
    { scope: root, dependencies: [items.map((x) => x.value).join(',')], revertOnUpdate: true }
  );

  return (
    <section className="nb" ref={root}>
      {items.map((it, i) => (
        <div className="nb__item" key={it.label}>
          {i > 0 && <span className="nb__rule" aria-hidden="true" />}
          <div className="nb__n display">{it.value}</div>
          <div className="nb__l">{it.label}</div>
        </div>
      ))}
    </section>
  );
}
