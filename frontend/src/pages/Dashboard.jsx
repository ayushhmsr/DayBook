import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP, reducedMotion, introDelay } from '../lib/gsap.js';
import { api } from '../api/journalApi.js';
import { TEMPLATES, getTemplate } from '../data/templates.js';
import { computeStats, countsByDay, currentStreak, longestStreak } from '../utils/stats.js';
import { formatNice } from '../utils/dates.js';
import CountUp from '../components/CountUp.jsx';
import Heatmap from '../components/Heatmap.jsx';
import LoyaltyCard from '../components/LoyaltyCard.jsx';
import StreakGuardBanner from '../components/StreakGuardBanner.jsx';
import AnalyticsSection from '../components/AnalyticsSection.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { TLink } from '../components/TransitionProvider.jsx';

export default function Dashboard() {
  const root = useRef(null);
  const { t } = useLanguage();
  const user = api.getUserSync();
  const userProf = user?.profession || 'trader';
  const [entries, setEntries] = useState(null);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? t('dash.morning') : h < 17 ? t('dash.afternoon') : t('dash.evening');
  };

  const load = async () => {
    const list = await api.listEntries({ templateId: userProf });
    setEntries(list);
  };

  useEffect(() => {
    load();
  }, [userProf]);

  const loaded = entries !== null;
  const hasEntries = !!entries?.length;
  const counts = useMemo(() => countsByDay(entries || []), [entries]);
  const streak = currentStreak(counts);
  const longest = longestStreak(counts);
  const template = getTemplate(userProf) || TEMPLATES[0];
  const stats = useMemo(() => computeStats(template, entries || []), [template, entries]);
  const recent = (entries || []).slice(0, 6);


  useGSAP(
    () => {
      if (!loaded || reducedMotion()) return;
      const d = introDelay();
      const tl = gsap
        .timeline({ delay: d, defaults: { ease: 'power3.out' } })
        .from('.dash__hero > *', { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 })
        .from('.dash__panel', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.3');
      if (hasEntries) tl.from('.drow', { x: -20, opacity: 0, duration: 0.5, stagger: 0.06 }, '-=0.3');
    },
    { scope: root, dependencies: [loaded, hasEntries], revertOnUpdate: true }
  );

  if (!loaded) return <div className="dash" ref={root} aria-busy="true" />;

  if (entries.length === 0) {
    return (
      <div className="dash" ref={root}>
        <section className="dash__hero">
          <div>
            <h1 className="dash__title display">
              {getGreeting()}, {user?.name || 'User'}
            </h1>
            <div className="dash__sub">
              <span className="dash__role-badge" style={{ background: template.cover, color: template.coverInk }}>
                {template.name}
              </span>
              <span>{t('dash.ready')}</span>
            </div>
          </div>
        </section>
        <section className="dash__panel empty">
          <h2 className="display">{t('dash.emptyTitle', { name: template.name })}</h2>
          <p>{t('dash.emptyDesc')}</p>
          <div className="empty__actions">
            <TLink to={`/app/new/${userProf}`} className="btn btn--primary">
              {t('dash.writeFirst', { name: template.name })}
            </TLink>
          </div>
        </section>
      </div>
    );
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const hasLoggedToday = !!counts[todayKey];

  return (
    <div className="dash" ref={root}>
      <section className="dash__hero">
        <div>
          <h1 className="dash__title display">
            {getGreeting()}, {user?.name || t('nav.guest')}
          </h1>
          <div className="dash__sub">
            <span className="dash__role-badge" style={{ background: template.cover, color: template.coverInk }}>
              {template.name}
            </span>
            <span>
              {streak > 0 ? t('dash.streakAlive') : t('dash.streakStart')}
            </span>
          </div>
          <TLink to={`/app/new/${userProf}`} className="btn btn--primary dash__new">
            {t('dash.newEntry', { name: template.name })}
          </TLink>
        </div>
        <div className="streakbox" aria-label={`Current streak ${streak} days`}>
          <div className="streakbox__n display">
            <CountUp value={streak} duration={1.3} />
          </div>
          <div className="streakbox__l">{t('dash.dayStreak')}</div>
          <div className="streakbox__s">{t('dash.longest', { count: longest })}</div>
        </div>
      </section>

      <StreakGuardBanner streak={streak} hasLoggedToday={hasLoggedToday} profession={userProf} />

      <div className="dash__grid">
        <section className="dash__panel" style={{ '--cover': template.cover }}>
          <div className="dash__rowhead" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tab__dot" style={{ background: template.cover, width: '10px', height: '10px', borderRadius: '50%' }} />
              <h2 className="dash__h" style={{ margin: 0 }}>{template.name} Performance</h2>
            </div>
            <span className="dash__role-badge" style={{ background: template.cover, color: template.coverInk }}>
              {template.tagline || template.name}
            </span>
          </div>
          <div className="stats">
            {stats.map((s) => (
              <div key={s.label} className={`stat${s.lead ? ' stat--lead' : ''}`}>
                <div className="stat__v display">
                  <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} signed={s.signed} />
                </div>
                <div className="stat__l">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="dash__panel">
          <h2 className="dash__h">{t('dash.last15Weeks')}</h2>
          <Heatmap counts={counts} weeks={15} />
        </section>
      </div>

      <AnalyticsSection template={template} entries={entries} />

      <LoyaltyCard user={user} streak={streak} longestStreak={longest} template={template} />

      <section className="dash__panel dash__recent">
        <div className="dash__rowhead">
          <h2 className="dash__h">{t('dash.recentEntries')}</h2>
          <TLink to="/app/entries" className="linkbtn">
            {t('dash.seeAll')} →
          </TLink>
        </div>
        <ul className="drows">
          {recent.map((e) => {
            const t = getTemplate(e.templateId);
            if (!t) return null;
            const s = t.summarize(e.values);
            return (
              <li key={e.id}>
                <TLink to="/app/entries" className="drow" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="drow__dot" style={{ background: t.cover }} title={t.name} />
                  <span className="drow__title">{s.title}</span>
                  <span className="drow__meta">
                    {s.meta.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </span>
                  <span className="drow__date">{formatNice(e.date)}</span>
                </TLink>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
