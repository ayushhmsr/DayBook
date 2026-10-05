import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, reducedMotion, introDelay } from '../lib/gsap.js';
import { TEMPLATES } from '../data/templates.js';
import { api } from '../api/journalApi.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Logbook from '../components/Logbook.jsx';
import SplitWords from '../components/SplitWords.jsx';
import Heatmap from '../components/Heatmap.jsx';
import LoyaltyShowcase from '../components/LoyaltyShowcase.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import Brand from '../components/Brand.jsx';
import CursorLabel from '../components/CursorLabel.jsx';
import Marquee from '../components/Marquee.jsx';
import Manifesto from '../components/Manifesto.jsx';
import NumberBand from '../components/NumberBand.jsx';
import DayClock from '../components/DayClock.jsx';
import { TLink } from '../components/TransitionProvider.jsx';
import { addDays, dayKey } from '../utils/dates.js';
import '../styles/landing-fx.css';

// Fixed sample so the landing page heatmap looks the same on every visit.
function sampleCounts() {
  const counts = {};
  const today = new Date();
  const skip = new Set([6, 9, 13, 14, 21, 27, 28, 34, 40, 41, 47, 55, 61, 62, 63, 70, 77, 80]);
  for (let i = 0; i < 105; i += 1) {
    if (skip.has(i)) continue;
    counts[dayKey(addDays(today, -i))] = 1 + ((i * 7) % 3 === 0 ? 1 : 0) + (i % 11 === 0 ? 1 : 0);
  }
  return counts;
}
const SAMPLE = sampleCounts();

// Fan coordinates for desktop & mobile
const FAN = [
  { x: -190, y: 34, r: -11 },
  { x: -62, y: -14, r: -4 },
  { x: 62, y: 10, r: 4 },
  { x: 190, y: 52, r: 11 },
];

// Everything below is derived from the template schemas, so the numbers are always true.
const uniq = (arr) => [...new Set(arr)];
const TOTAL_FIELDS = TEMPLATES.reduce((a, tp) => a + tp.fields.length, 0);
const TOTAL_STATS = TEMPLATES.reduce((a, tp) => a + tp.stats.length, 0);
const FIELD_TYPES = uniq(TEMPLATES.flatMap((tp) => tp.fields.map((f) => f.type))).length;

const pad2 = (n) => String(n).padStart(2, '0');

export default function Landing() {
  const root = useRef(null);
  const { t } = useLanguage();

  // Translate with a fallback, so the new sections work before their keys exist in your i18n files.
  const tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v && v !== key ? v : fallback;
  };

  // Row 1 names every profession. Row 2 shows what each one gets, taking one stat from
  // each template in turn so no single profession dominates the strip.
  const names = TEMPLATES.map((tp) => ({ label: tx(`tpl.${tp.id}.name`, tp.name), color: tp.cover }));
  const seen = new Set();
  const perks = [];
  const depth = Math.max(...TEMPLATES.map((tp) => tp.stats.length));
  for (let i = 0; i < depth; i += 1) {
    TEMPLATES.forEach((tp) => {
      const label = tp.stats[i]?.label;
      if (label && !seen.has(label)) {
        seen.add(label);
        perks.push({ label, color: tp.cover });
      }
    });
  }
  const marqueeRows = [[...names, ...names, ...names], [...perks, ...perks]];

  const scrollToTemplates = (e) => {
    e.preventDefault();
    if (reducedMotion()) {
      document.getElementById('templates')?.scrollIntoView();
      return;
    }
    gsap.to(window, { scrollTo: '#templates', duration: 1.2, ease: 'power3.inOut' });
  };

  const scrollToLoyalty = (e) => {
    e.preventDefault();
    if (reducedMotion()) {
      document.getElementById('loyalty')?.scrollIntoView();
      return;
    }
    gsap.to(window, { scrollTo: '#loyalty', duration: 1.2, ease: 'power3.inOut' });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = (s) => root.current.querySelectorAll(s);

      // Dynamic fan responsive layout calculation
      const layoutFan = () => {
        const fan = root.current?.querySelector('.fan');
        if (!fan) return;
        const clientW = fan.clientWidth || window.innerWidth || 360;
        const k = Math.min(1, Math.max(0.46, clientW / 560));
        gsap.set('.fan__item', {
          xPercent: -50,
          yPercent: -50,
          x: (i) => FAN[i].x * k,
          y: (i) => FAN[i].y * k,
          rotation: (i) => FAN[i].r,
          zIndex: (i) => i + 1,
        });
      };

      layoutFan();
      window.addEventListener('resize', layoutFan);

      // Global animations
      mm.add('all', () => {
        if (reducedMotion()) return;
        const cleanups = [];
        const hero = root.current.querySelector('.hero');
        const fan = root.current.querySelector('.fan');

        // 1. Hero text & frame load reveal
        gsap
          .timeline({ delay: introDelay(), defaults: { ease: 'power3.out' } })
          .from(q('.hero__rule'), { scaleX: 0, transformOrigin: 'left center', duration: 0.9, stagger: 0.05, ease: 'power2.inOut' })
          .from(q('.hero__margin'), { scaleY: 0, transformOrigin: 'top center', duration: 0.9, ease: 'power2.inOut' }, 0.1)
          .from(q('.hero .w__in'), { yPercent: 115, duration: 0.95, stagger: 0.06, ease: 'power4.out' }, 0.35)
          .from(q('.hero__lede, .hero__cta > *, .hero__note'), { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.55');

        // Pointer / Touch 3D Tilt on the books (works on touch screens and mouse)
        const tiltTarget = fan || hero;
        if (tiltTarget) {
          const books = gsap.utils.toArray('.fan .book');
          const tweens = books.map((b) => ({
            x: gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' }),
            ry: gsap.quickTo(b, 'rotationY', { duration: 0.6, ease: 'power3.out' }),
            rx: gsap.quickTo(b, 'rotationX', { duration: 0.6, ease: 'power3.out' }),
          }));
          const move = (e) => {
            const r = (window.innerWidth < 900 && fan ? fan : tiltTarget).getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (clientX === undefined || clientY === undefined) return;
            const px = (clientX - r.left) / r.width - 0.5;
            const py = (clientY - r.top) / r.height - 0.5;
            tweens.forEach((tw, i) => {
              const depth = (i + 1) / tweens.length;
              tw.x(Math.max(-36, Math.min(36, px * 34 * depth)));
              tw.ry(Math.max(-22, Math.min(22, px * 16 * depth)));
              tw.rx(Math.max(-18, Math.min(18, -py * 12 * depth)));
            });
          };
          const leave = () => {
            tweens.forEach((tw) => {
              tw.x(0);
              tw.ry(0);
              tw.rx(0);
            });
          };

          tiltTarget.addEventListener('pointermove', move, { passive: true });
          tiltTarget.addEventListener('pointerleave', leave);
          tiltTarget.addEventListener('pointerup', leave);
          tiltTarget.addEventListener('pointercancel', leave);
          cleanups.push(() => {
            tiltTarget.removeEventListener('pointermove', move);
            tiltTarget.removeEventListener('pointerleave', leave);
            tiltTarget.removeEventListener('pointerup', leave);
            tiltTarget.removeEventListener('pointercancel', leave);
          });
        }

        // Hero depth on scroll
        const heroScroll = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to(q('.fan__item'), { y: (i) => `-=${(i + 1) * 26}`, ease: 'none', scrollTrigger: heroScroll });
        gsap.to(q('.hero__copy'), { y: -36, ease: 'none', scrollTrigger: heroScroll });

        // Scroll cue
        const line = q('.hero__cue-line')[0];
        if (line) {
          gsap
            .timeline({ repeat: -1, delay: 2.4 })
            .fromTo(line, { scaleY: 0, transformOrigin: 'top center' }, { scaleY: 1, duration: 0.8, ease: 'power2.inOut' })
            .set(line, { transformOrigin: 'bottom center' })
            .to(line, { scaleY: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.15');
          gsap.to(q('.hero__cue'), { opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '+=160', scrub: true } });
        }

        // Nav hide on scroll down, show on scroll up
        const nav = root.current.querySelector('.nav');
        let navHidden = false;
        ScrollTrigger.create({
          start: 'top -160',
          end: 'max',
          onUpdate: (self) => {
            const hide = self.direction === 1;
            if (hide === navHidden) return;
            navHidden = hide;
            gsap.to(nav, { yPercent: hide ? -110 : 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
          },
          onLeaveBack: () => {
            navHidden = false;
            gsap.to(nav, { yPercent: 0, duration: 0.3, overwrite: 'auto' });
          },
        });

        // Closing CTA magnetic / touch pop
        const btn = root.current.querySelector('.cta__btn');
        if (btn) {
          const mx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
          const my = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
          const mv = (e) => {
            const r = btn.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (clientX === undefined || clientY === undefined) return;
            mx(Math.max(-20, Math.min(20, (clientX - (r.left + r.width / 2)) * 0.3)));
            my(Math.max(-20, Math.min(20, (clientY - (r.top + r.height / 2)) * 0.4)));
          };
          const lv = () => {
            mx(0);
            my(0);
          };
          btn.addEventListener('pointermove', mv, { passive: true });
          btn.addEventListener('pointerleave', lv);
          btn.addEventListener('pointerup', lv);
          cleanups.push(() => {
            btn.removeEventListener('pointermove', mv);
            btn.removeEventListener('pointerleave', lv);
            btn.removeEventListener('pointerup', lv);
          });
        }

        gsap.from(q('.cta .w__in'), {
          yPercent: 115,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.cta', start: 'top 75%', once: true },
        });

        gsap.from(q('.streak__copy > *'), {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.streak', start: 'top 75%', once: true },
        });

        return () => cleanups.forEach((fn) => fn());
      });

      // Desktop: pinned horizontal scroll and hero book drop
      mm.add('(min-width: 900px)', () => {
        if (reducedMotion()) return;

        // Desktop hero fan drop in intro
        gsap.from(q('.fan .book'), {
          y: -220,
          rotation: (i) => (i % 2 ? 22 : -22),
          opacity: 0,
          duration: 1.15,
          stagger: 0.12,
          ease: 'back.out(1.5)',
          delay: introDelay() + 0.55,
        });

        const section = root.current.querySelector('.hs');
        const track = root.current.querySelector('.hs__track');
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.6,
            start: 'top top',
            end: () => `+=${dist()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            refreshPriority: 1,
          },
        });

        gsap.fromTo(
          q('.hs__bar'),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true },
          }
        );

        const panels = gsap.utils.toArray('.hs__panel');
        panels.forEach((p) => {
          const st = { trigger: p, containerAnimation: tween, start: 'left 78%', toggleActions: 'play none none reverse' };
          const title = p.querySelector('.hs__title');
          const rows = p.querySelectorAll('.pv__row');
          if (title) gsap.from(title, { xPercent: -14, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: st });
          if (rows.length) gsap.from(rows, { opacity: 0, x: 40, duration: 0.6, stagger: 0.09, ease: 'power3.out', scrollTrigger: st });
        });

        const counter = q('.hs__counter')[0];
        const now = counter?.querySelector('.hs__counter-now > span');
        const skews = gsap.utils.toArray('.pv').map((el) => gsap.quickTo(el, 'skewX', { duration: 0.5, ease: 'power3.out' }));
        const unskew = () => skews.forEach((s) => s(0));
        let current = -1;

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${dist()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const lean = gsap.utils.clamp(-5, 5, self.getVelocity() / 260);
            skews.forEach((s) => s(lean));
            if (!counter) return;
            const x = self.progress * dist();
            let idx = 0;
            panels.forEach((p, i) => {
              if (p.offsetLeft - x < window.innerWidth * 0.55) idx = i;
            });
            if (idx === current) return;
            current = idx;
            gsap.to(counter, { opacity: idx === 0 ? 0 : 1, duration: 0.3, overwrite: 'auto' });
            if (idx > 0 && now) {
              now.textContent = pad2(idx);
              gsap.fromTo(now, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
            }
          },
        });
        ScrollTrigger.addEventListener('scrollEnd', unskew);
        return () => ScrollTrigger.removeEventListener('scrollEnd', unskew);
      });

      // Mobile & Tablet: 3D perspective card reveal and responsive book entrance
      mm.add('(max-width: 899px)', () => {
        if (reducedMotion()) return;

        // Mobile fan book entrance when scrolled into view
        const fan = root.current.querySelector('.fan');
        if (fan) {
          gsap.from(q('.fan .book'), {
            y: -160,
            rotation: (i) => (i % 2 ? 18 : -18),
            scale: 0.9,
            opacity: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: fan,
              start: 'top 90%',
              once: true,
            },
          });
        }

        gsap.utils.toArray('.hs__panel').forEach((p) => {
          const copy = p.querySelectorAll('.hs__title, .hs__copy > p, .hs__facts, .hs__notice');
          const intro = p.querySelectorAll('.hs__lead, .hs__panel--intro > p');
          const text = copy.length ? copy : intro;
          if (text.length) {
            gsap.from(text, {
              opacity: 0,
              y: 26,
              duration: 0.65,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: p, start: 'top 85%', once: true },
            });
          }

          const pv = p.querySelector('.pv');
          if (pv) {
            gsap.from(pv, {
              opacity: 0,
              y: 36,
              scale: 0.92,
              rotationX: 10,
              duration: 0.7,
              ease: 'back.out(1.5)',
              scrollTrigger: { trigger: pv, start: 'top 85%', once: true },
            });

            const rows = pv.querySelectorAll('.pv__row');
            if (rows.length) {
              gsap.from(rows, {
                opacity: 0,
                x: 18,
                duration: 0.45,
                stagger: 0.06,
                ease: 'power2.out',
                scrollTrigger: { trigger: pv, start: 'top 82%', once: true },
              });
            }
          }
        });
      });

      // Refresh measurements once fonts load or layout shifts
      document.fonts?.ready.then(() => {
        layoutFan();
        ScrollTrigger.refresh();
      });
      requestAnimationFrame(() => {
        layoutFan();
        ScrollTrigger.refresh();
      });

      return () => {
        window.removeEventListener('resize', layoutFan);
        mm.revert();
      };
    },
    { scope: root }
  );

  const user = api.getUserSync();

  return (
    <div className="landing" ref={root}>
      <CursorLabel />

      {/* Modern, Streamlined Navigation Bar: Brand Logo (Left) + Language Toggle & Action (Right) */}
      <header className="nav">
        <Brand />
        <div className="nav__actions">
          <LanguageToggle />
          {user ? (
            <TLink to="/app" className="btn btn--primary btn--small nav__cta">
              {t('nav.dashboard')}
            </TLink>
          ) : (
            <TLink to="/login" className="btn btn--primary btn--small nav__cta">
              {t('nav.startLogging')}
            </TLink>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__lines" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span className="hero__rule" key={i} style={{ '--i': i }} />
            ))}
            <span className="hero__margin" />
          </div>

          <div className="hero__copy">
            <h1 className="hero__title display" aria-label={`${t('hero.title.1')} ${t('hero.title.2')} ${t('hero.title.3')}`}>
              <span aria-hidden="true">
                <SplitWords text={t('hero.title.1')} />
                <br />
                <SplitWords text={t('hero.title.2')} />
                <br />
                <SplitWords text={t('hero.title.3')} />
              </span>
            </h1>
            <p className="hero__lede">{t('hero.lede')}</p>
            <div className="hero__cta">
              <TLink to={user ? '/app' : '/login'} className="btn btn--primary">
                {user ? t('hero.cta.open') : t('hero.cta.start')}
              </TLink>
              <a href="#templates" className="btn btn--ghost" onClick={scrollToTemplates}>
                {t('hero.cta.templates')}
              </a>
            </div>
            {user && (
              <p className="hero__note">
                {t('hero.note.user', { name: user.name || 'User' })}
              </p>
            )}
          </div>

          <div className="fan" aria-hidden="true">
            {TEMPLATES.map((tpl) => (
              <div className="fan__item" key={tpl.id}>
                <Logbook template={tpl} />
              </div>
            ))}
          </div>

          <div className="hero__cue" aria-hidden="true">
            <span className="hero__cue-line" />
            <span>{tx('hero.scroll', 'Scroll')}</span>
          </div>
        </section>

        <Marquee rows={marqueeRows} />

        <section className="hs" id="templates" aria-label="Templates" data-cursor={tx('cursor.scroll', 'Scroll')}>
          <div className="hs__progress" aria-hidden="true">
            <span className="hs__bar" />
          </div>
          <div className="hs__counter" aria-hidden="true">
            <span className="hs__counter-label">{tx('templates.counter', 'Template')}</span>
            <span className="hs__counter-now">
              <span>01</span>
            </span>
            <span>/ {pad2(TEMPLATES.length)}</span>
          </div>
          <div className="hs__track">
            <div className="hs__panel hs__panel--intro">
              <h2 className="hs__lead display">{t('templates.head')}</h2>
              <p>{t('templates.sub')}</p>
            </div>

            {TEMPLATES.map((tpl) => {
              const name = t(`tpl.${tpl.id}.name`) || tpl.name;
              const desc = t(`tpl.${tpl.id}.desc`) || tpl.description;
              const notice = tpl.notice ? (t(`tpl.${tpl.id}.notice`) || tpl.notice) : null;

              return (
                <article className="hs__panel" key={tpl.id} style={{ '--cover': tpl.cover, '--accent': tpl.accent }}>
                  <div className="hs__copy">
                    <h3 className="hs__title display">{name}</h3>
                    <p>{desc}</p>
                    <p className="hs__facts">
                      {t('templates.facts', {
                        fields: tpl.fields.length,
                        stats: tpl.stats.map((s) => s.label.toLowerCase()).join(', '),
                      })}
                    </p>
                    {notice && <p className="hs__notice">{notice}</p>}
                  </div>
                  <div className="pv" role="img" aria-label={`Preview of a ${name} entry`}>
                    <div className="pv__head">{t('templates.newEntryPreview', { name })}</div>
                    {tpl.preview.map(([k, v], idx) => {
                      const rowK = t(`tpl.${tpl.id}.preview.${idx}.k`) || k;
                      const rowV = t(`tpl.${tpl.id}.preview.${idx}.v`) || v;
                      return (
                        <div className="pv__row" key={k}>
                          <span className="pv__k">{rowK}</span>
                          <span className="pv__v">{rowV}</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <Manifesto
          text={tx(
            'manifesto.text',
            'A good day is easy to forget and a bad one is easy to repeat. Write it down *while you still remember it* and let the numbers do the rest.'
          )}
        />

        <NumberBand
          items={[
            { value: TEMPLATES.length, label: tx('numbers.templates', 'Profession templates') },
            { value: TOTAL_FIELDS, label: tx('numbers.fields', 'Fields built for real work') },
            { value: TOTAL_STATS, label: tx('numbers.stats', 'Stats worked out for you') },
            { value: FIELD_TYPES, label: tx('numbers.types', 'Ways to log an answer') },
          ]}
        />

        <section className="streak">
          <div className="streak__copy">
            <h2 className="display">{t('streak.title')}</h2>
            <p>{t('streak.desc')}</p>
            <p className="streak__cap">{t('streak.sample')}</p>
            <DayClock label={tx('streak.clock', 'Today ends in')} />
          </div>
          <div className="streak__chart">
            <Heatmap counts={SAMPLE} weeks={15} onScroll />
          </div>
        </section>

        <LoyaltyShowcase user={user} />

        <section className="cta" data-cursor={tx('cursor.start', 'Start')}>
          <h2 className="cta__title display">
            <SplitWords text={t('cta.title')} />
          </h2>
          <p>{t('cta.desc')}</p>
          <TLink to={user ? '/app' : '/login'} className="cta__btn">
            {user ? t('cta.btn.dash') : t('cta.btn.start')}
          </TLink>
        </section>
      </main>

      <footer className="foot">
        <div className="foot__main">
          <div className="foot__brand-col">
            <Brand />
            <p className="foot__tagline">{t('foot.tagline')}</p>
            <p className="foot__quote">{t('foot.quote')}</p>
          </div>

          <div className="foot__links-group">
            <div className="foot__col">
              <span className="foot__col-title">{t('foot.templates')}</span>
              <a href="#templates" onClick={scrollToTemplates} className="foot__link">
                {t('tpl.trader.name')}
              </a>
              <a href="#templates" onClick={scrollToTemplates} className="foot__link">
                {t('tpl.developer.name')}
              </a>
              <a href="#templates" onClick={scrollToTemplates} className="foot__link">
                {t('tpl.driver.name')}
              </a>
              <a href="#templates" onClick={scrollToTemplates} className="foot__link">
                {t('tpl.generic.name')}
              </a>
            </div>

            <div className="foot__col">
              <span className="foot__col-title">{t('foot.passHabit')}</span>
              <a href="#loyalty" onClick={scrollToLoyalty} className="foot__link">
                {t('nav.loyalty')}
              </a>
              <a href="#templates" onClick={scrollToTemplates} className="foot__link">
                Custom Setup Logs
              </a>
              <TLink to={user ? '/app/entries' : '/login'} className="foot__link">
                Diary Notebook Pages
              </TLink>
            </div>

            <div className="foot__col">
              <span className="foot__col-title">{t('foot.app')}</span>
              <TLink to={user ? '/app' : '/login'} className="foot__link">
                {user ? t('nav.dashboard') : t('nav.signin')}
              </TLink>
              <TLink to={user ? '/app/new' : '/signup'} className="foot__link">
                {user ? t('nav.newEntry') : t('nav.signup')}
              </TLink>
              <TLink to={user ? '/app/entries' : '/login'} className="foot__link">
                {t('nav.entries')}
              </TLink>
            </div>
          </div>
        </div>

        <div className="foot__bottom">
          <p className="foot__copy">
            © {new Date().getFullYear()} Daybook. Crafted with ❤️ . Designed for daily consistency.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageToggle />
            <div className="foot__badge">
              <span className="foot__badge-dot" />
              <span>{t('foot.systemActive')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
