import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap, motionState, reducedMotion } from '../lib/gsap.js';

const Ctx = createContext({ go: () => {} });
export const useTransition = () => useContext(Ctx);

// Wraps navigation in a curtain sweep. Use go('/path') or <TLink to="/path">.
export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const curtain = useRef(null);
  const busy = useRef(false);

  const go = useCallback(
    (to) => {
      if (!to) return;
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const targetPath = to.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

      if (busy.current) return;
      if (currentPath === targetPath) {
        if (window.location.pathname !== to) {
          navigate(to);
        }
        return;
      }

      if (reducedMotion()) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }

      const el = curtain.current;
      if (!el) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }

      busy.current = true;
      motionState.fromTransition = true;
      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
            motionState.fromTransition = false;
          },
        })
        .set(el, { display: 'grid', yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.55, ease: 'power3.inOut' })
        .add(() => {
          navigate(to);
          window.scrollTo(0, 0);
        })
        .to(el, { yPercent: -100, duration: 0.6, ease: 'power3.inOut', delay: 0.15 })
        .set(el, { display: 'none' });
    },
    [navigate]
  );

  const value = useMemo(() => ({ go }), [go]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="curtain" ref={curtain} aria-hidden="true">
        <span className="curtain__mark display">Daybook</span>
      </div>
    </Ctx.Provider>
  );
}

export function TLink({ to, children, className, onClick, ...rest }) {
  const { go } = useTransition();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!to || to.startsWith('#') || to.startsWith('http://') || to.startsWith('https://') || to.startsWith('mailto:')) {
          onClick?.(e);
          return;
        }
        e.preventDefault();
        onClick?.(e);
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
