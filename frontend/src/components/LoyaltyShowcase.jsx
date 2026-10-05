import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import LoyaltyCard from './LoyaltyCard.jsx';
import SplitWords from './SplitWords.jsx';
import { TEMPLATES } from '../data/templates.js';

export default function LoyaltyShowcase({ user }) {
  const container = useRef(null);
  const [demoStreak, setDemoStreak] = useState(7);
  const { t } = useLanguage();

  // ✅ Official @gsap/react hook with scope: container and contextSafe for event callbacks
  const { contextSafe } = useGSAP({ scope: container });

  // Initial ScrollTrigger entrance animations scoped to container
  useGSAP(
    () => {
      // 1. Narrative & Roadmap Scroll Reveal
      gsap.from('.loyalty-showcase__story > *', {
        y: 32,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.loyalty-showcase__story',
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('.loyalty-roadmap-step', {
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 0.75,
        stagger: 0.12,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.loyalty-showcase__roadmap',
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Scroll-Scrubbed 3D Perspective Emergence
      const stageWrap = container.current?.querySelector('.loyalty-showcase__stage-wrap');
      if (stageWrap) {
        gsap.fromTo(
          '.loyalty-showcase__card-wrap .loyalty-card',
          {
            rotationX: 28,
            rotationY: -18,
            rotationZ: -3,
            y: 110,
            scale: 0.84,
            opacity: 0.3,
          },
          {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: stageWrap,
              start: 'top 95%',
              end: 'top 40%',
              scrub: 1.2,
            },
          }
        );

        gsap.fromTo(
          '.loyalty-card__shine',
          {
            opacity: 0,
            x: -180,
          },
          {
            opacity: 0.95,
            x: 180,
            ease: 'none',
            scrollTrigger: {
              trigger: stageWrap,
              start: 'top 80%',
              end: 'top 30%',
              scrub: 1.2,
            },
          }
        );

        gsap.fromTo(
          '.loyalty-stamp',
          {
            scale: 0.2,
            opacity: 0,
            y: 16,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.55,
            ease: 'back.out(2.2)',
            scrollTrigger: {
              trigger: stageWrap,
              start: 'top 65%',
              once: true,
            },
          }
        );
      }
    },
    { scope: container }
  );

  // ✅ contextSafe() for interactive switch button (flips the 3D card and pops stamps)
  const onSwitchMode = contextSafe((days) => {
    setDemoStreak(days);

    // 3D Card Flip & Scale
    gsap.fromTo(
      '.loyalty-showcase__card-wrap .loyalty-card',
      {
        rotationY: 90,
        scale: 0.9,
        opacity: 0.7,
      },
      {
        rotationY: 0,
        scale: 1,
        opacity: 1,
        duration: 0.65,
        ease: 'back.out(1.5)',
      }
    );

    // Light flash sweep
    gsap.fromTo(
      '.loyalty-card__shine',
      {
        x: -200,
        opacity: 1,
      },
      {
        x: 200,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
      }
    );

    // Stamps popping in sequence
    gsap.fromTo(
      '.loyalty-stamp',
      {
        scale: 0.3,
        opacity: 0,
        y: 10,
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.45,
        ease: 'back.out(2)',
        delay: 0.15,
      }
    );
  });

  // ✅ contextSafe() for clicking the 3D card directly (360° spin & gold burst)
  const onCardClick = contextSafe(() => {
    gsap.to('.loyalty-showcase__card-wrap .loyalty-card', {
      rotationY: '+=360',
      duration: 0.95,
      ease: 'power3.inOut',
    });

    gsap.fromTo(
      '.loyalty-card__shine',
      { opacity: 1, scale: 1.6 },
      { opacity: 0, scale: 1, duration: 0.9, ease: 'power2.out' }
    );
  });

  return (
    <section ref={container} className="loyalty-showcase" id="loyalty" aria-label="7-Day Consistency Loyalty Card">
      <div className="loyalty-showcase__container">
        {/* Part 1: The Habit Story & Why 7 Days Matter */}
        <div className="loyalty-showcase__story">
          <span className="loyalty-showcase__tag">{t('loyalty.tag')}</span>
          <h2 className="loyalty-showcase__title display">
            <SplitWords text={t('loyalty.title.1')} />
            <br />
            <SplitWords text={t('loyalty.title.2')} />
          </h2>
          <p className="loyalty-showcase__lede">{t('loyalty.lede')}</p>

          {/* 3-Step Milestone Roadmap */}
          <div className="loyalty-showcase__roadmap">
            <div className="loyalty-roadmap-step">
              <span className="loyalty-roadmap-step__num">01</span>
              <div className="loyalty-roadmap-step__title">{t('loyalty.step1.title')}</div>
              <div className="loyalty-roadmap-step__desc">{t('loyalty.step1.desc')}</div>
            </div>

            <div className="loyalty-roadmap-step">
              <span className="loyalty-roadmap-step__num">02</span>
              <div className="loyalty-roadmap-step__title">{t('loyalty.step2.title')}</div>
              <div className="loyalty-roadmap-step__desc">{t('loyalty.step2.desc')}</div>
            </div>

            <div className="loyalty-roadmap-step">
              <span className="loyalty-roadmap-step__num">03</span>
              <div className="loyalty-roadmap-step__title">{t('loyalty.step3.title')}</div>
              <div className="loyalty-roadmap-step__desc">{t('loyalty.step3.desc')}</div>
            </div>
          </div>
        </div>

        {/* Part 2: 3D Perspective Card Stage on Scroll */}
        <div className="loyalty-showcase__stage-wrap">
          <div className="loyalty-showcase__stage-head">
            <span className="loyalty-showcase__stage-label">{t('loyalty.preview.label')}</span>
            <h3 className="loyalty-showcase__stage-title display">{t('loyalty.preview.title')}</h3>
          </div>

          <div className="loyalty-showcase__switcher" role="tablist" aria-label="Card preview toggle">
            <button
              type="button"
              className={`loyalty-showcase__switch-btn${demoStreak === 7 ? ' is-active' : ''}`}
              onClick={() => onSwitchMode(7)}
            >
              {t('loyalty.tab.unlocked')}
            </button>
            <button
              type="button"
              className={`loyalty-showcase__switch-btn${demoStreak === 4 ? ' is-active' : ''}`}
              onClick={() => onSwitchMode(4)}
            >
              {t('loyalty.tab.progress')}
            </button>
          </div>

          <div className="loyalty-showcase__card-wrap" onClick={onCardClick} title="Click to trigger 3D spin">
            <LoyaltyCard
              user={user || { name: 'Alex Morgan', profession: 'trader' }}
              streak={demoStreak}
              longestStreak={demoStreak}
              template={TEMPLATES[0]}
              previewOnly={true}
            />
          </div>

          <span className="loyalty-showcase__hint">
            <span>🖱️</span> {t('loyalty.hint')}
          </span>
        </div>
      </div>
    </section>
  );
}

