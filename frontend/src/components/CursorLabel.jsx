import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';

// A round label that trails the mouse and grows over anything with data-cursor="Text".
// Mouse devices only. The native cursor is left alone.
export default function CursorLabel() {
  const el = useRef(null);
  const txt = useRef(null);

  useGSAP(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reducedMotion()) return;

    const node = el.current;
    const host = node.parentElement;
    gsap.set(node, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0, opacity: 1 });
    const qx = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3.out' });
    const qy = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3.out' });

    const move = (e) => {
      qx(e.clientX);
      qy(e.clientY);
    };
    const over = (e) => {
      const target = e.target.closest?.('[data-cursor]');
      if (!target) return;
      txt.current.textContent = target.dataset.cursor;
      gsap.to(node, { scale: 1, duration: 0.4, ease: 'back.out(2)', overwrite: 'auto' });
    };
    const out = (e) => {
      const from = e.target.closest?.('[data-cursor]');
      if (!from) return;
      const to = e.relatedTarget?.closest?.('[data-cursor]');
      if (!to) gsap.to(node, { scale: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
    };

    host.addEventListener('pointermove', move);
    host.addEventListener('pointerover', over);
    host.addEventListener('pointerout', out);
    return () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerover', over);
      host.removeEventListener('pointerout', out);
    };
  });

  return (
    <div className="cursor-label" ref={el} aria-hidden="true">
      <span ref={txt} />
    </div>
  );
}
