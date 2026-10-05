import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';

// A statement that lights up word by word as you scroll through it.
// Wrap the part to highlight in *asterisks*.
export default function Manifesto({ text }) {
  const root = useRef(null);
  const words = text.split('*').flatMap((seg, si) =>
    seg
      .split(' ')
      .filter(Boolean)
      .map((w) => ({ w, mark: si % 2 === 1 }))
  );

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const all = root.current.querySelectorAll('.mf__w');
      const marks = root.current.querySelectorAll('.mf__w--mark');

      gsap.fromTo(
        all,
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: { each: 0.08 },
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 82%', end: 'bottom 50%', scrub: 0.8 },
        }
      );
      gsap.fromTo(
        marks,
        { backgroundSize: '0% 0.38em' },
        {
          backgroundSize: '100% 0.38em',
          stagger: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 65%', end: 'bottom 45%', scrub: 0.8 },
        }
      );
    },
    { scope: root, dependencies: [text], revertOnUpdate: true }
  );

  return (
    <section className="mf" ref={root}>
      <p className="mf__text display">
        {words.map(({ w, mark }, i) => (
          <span className={`mf__w${mark ? ' mf__w--mark' : ''}`} key={`${w}-${i}`}>
            {w}
          </span>
        ))}
      </p>
    </section>
  );
}
