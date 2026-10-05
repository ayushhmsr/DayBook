import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';
import { api } from '../api/journalApi.js';
import Brand from '../components/Brand.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { TLink, useTransition } from '../components/TransitionProvider.jsx';

export default function AppShell() {
  const { pathname } = useLocation();
  const { go } = useTransition();
  const { t } = useLanguage();
  const nav = useRef(null);
  const bottomNav = useRef(null);
  const first = useRef(true);
  const user = api.getUserSync();

  const links = [
    { to: '/app', label: t('nav.dashboard'), icon: '📊', match: (p) => p === '/app' || p === '/app/' },
    { to: `/app/new/${user?.profession || 'trader'}`, label: t('nav.newEntry'), icon: '✍️', match: (p) => p.startsWith('/app/new') },
    { to: '/app/entries', label: t('nav.entries'), icon: '📖', match: (p) => p.startsWith('/app/entries') },
  ];

  // A single ink bar slides under whichever link is active on desktop.
  useGSAP(
    () => {
      const updateInk = (immediate = false) => {
        if (!nav.current) return;
        const active = nav.current.querySelector('.is-active');
        const ink = nav.current.querySelector('.shell__ink');
        if (!active || !ink) {
          if (ink) gsap.to(ink, { opacity: 0, duration: 0.2 });
          return;
        }
        const vars = { x: active.offsetLeft, width: active.offsetWidth, opacity: 1 };
        if (immediate || first.current || reducedMotion()) {
          gsap.set(ink, vars);
        } else {
          gsap.to(ink, { ...vars, duration: 0.45, ease: 'power3.inOut' });
        }
      };

      updateInk();
      first.current = false;

      const handleResize = () => updateInk(true);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    },
    { scope: nav, dependencies: [pathname] }
  );

  const signOut = async () => {
    await api.logout();
    go('/');
  };

  return (
    <div className="shell">
      {/* Top Bar: Brand (Left) + Language Toggle & User / Sign Out (Right) */}
      <header className="shell__bar">
        <Brand to="/" />
        <nav className="shell__nav" ref={nav} aria-label="Desktop App Navigation">
          {links.map((l) => (
            <TLink key={l.to} to={l.to} className={`shell__link${l.match(pathname) ? ' is-active' : ''}`}>
              {l.label}
            </TLink>
          ))}
          <span className="shell__ink" aria-hidden="true" />
        </nav>
        <div className="shell__user">
          <LanguageToggle />
          <span className="shell__user-name">{user?.name || t('nav.guest')}</span>
          <button type="button" className="btn btn--primary btn--small shell__signout" onClick={signOut}>
            {t('nav.signout')}
          </button>
        </div>
      </header>

      <main className="shell__main">
        <Outlet />
      </main>

      {/* Floating Mobile Bottom Navigation Dock */}
      <nav className="shell__mobile-dock" ref={bottomNav} aria-label="Mobile Navigation">
        {links.map((l) => {
          const active = l.match(pathname);
          return (
            <TLink
              key={l.to}
              to={l.to}
              className={`shell__mobile-tab${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="shell__mobile-icon">{l.icon}</span>
              <span className="shell__mobile-label">{l.label}</span>
            </TLink>
          );
        })}
      </nav>

      <footer className="shell__foot">
        <p>{t('foot.quote')}</p>
        <span>{t('foot.systemActive')}</span>
      </footer>
    </div>
  );
}
