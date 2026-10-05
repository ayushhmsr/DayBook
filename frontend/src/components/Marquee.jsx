import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '../lib/gsap.js';

// Two rows of keywords drifting in opposite directions.
// Scrolling speeds them up, scrolling up reverses them, and the strip leans with the velocity.
// Each word can be a string, or { label, color } to tint its separator.
export default function Marquee({ rows }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tracks = gsap.utils.toArray('.marquee__track');
      const loops = tracks.map((track, i) => {
        const left = i % 2 === 0;
        return gsap.fromTo(
          track,
          { xPercent: left ? 0 : -50 },
          { xPercent: left ? -50 : 0, duration: 40 + i * 10, ease: 'none', repeat: -1 }
        );
      });

      const inner = root.current.querySelector('.marquee__inner');
      const skew = gsap.quickTo(inner, 'skewX', { duration: 0.5, ease: 'power3.out' });
      const settle = gsap.delayedCall(0.14, () => {
        skew(0);
        loops.forEach((tw) => gsap.to(tw, { timeScale: 1, duration: 0.9, ease: 'power2.out', overwrite: true }));
      });

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity();
          const dir = self.direction || 1;
          const speed = dir * (1 + Math.min(Math.abs(v) / 320, 4));
          loops.forEach((tw) => {
            gsap.killTweensOf(tw);
            tw.timeScale(speed);
          });
          skew(gsap.utils.clamp(-5, 5, (v || 0) / -280));
          settle.restart(true);
        },
      });
    },
    { scope: root }
  );

  return (
    <section className="marquee" ref={root} aria-hidden="true">
      <div className="marquee__inner">
        {rows.map((words, i) => (
          <div className={`marquee__row marquee__row--${i % 2 ? 'b' : 'a'}`} key={i}>
            <div className="marquee__track">
              {[0, 1].map((g) => (
                <div className="marquee__group" key={g}>
                  {words.map((w, j) => {
                    const item = typeof w === 'string' ? { label: w } : w;
                    return (
                      <span className="marquee__item" key={`${item.label}-${j}`}>
                        {item.label}
                        <i className="marquee__sep" style={item.color ? { background: item.color } : undefined} />
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}