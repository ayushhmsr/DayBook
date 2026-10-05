import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, Flip, useGSAP, reducedMotion, introDelay } from '../lib/gsap.js';
import { api } from '../api/journalApi.js';
import { TEMPLATES, getTemplate } from '../data/templates.js';
import { formatNice } from '../utils/dates.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { TLink } from '../components/TransitionProvider.jsx';

const show = (field, v) => {
  if (v === '' || v == null || v === 0) return '-';
  if (field.type === 'toggle') return v ? 'Yes' : 'No';
  if (field.type === 'rating') return `${v} of 5`;
  return String(v);
};

export default function Entries() {
  const root = useRef(null);
  const flipState = useRef(null);
  const { t } = useLanguage();
  const user = api.getUserSync();
  const userProf = user?.profession || 'trader';
  const [entries, setEntries] = useState(null);
  const [filter, setFilter] = useState(userProf);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [armed, setArmed] = useState(null); // id waiting for a second tap to delete
  const [lightbox, setLightbox] = useState(null); // URL of image to view in modal

  useEffect(() => {
    api.listEntries({ templateId: userProf }).then(setEntries);
  }, [userProf]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries || []).filter((e) => {
      if (filter !== 'all' && e.templateId !== filter) return false;
      if (!q) return true;
      const tpl = getTemplate(e.templateId);
      if (!tpl) return false;
      const s = tpl.summarize(e.values || {});
      const hay = [tpl.name, s.title, ...s.meta, ...Object.values(e.values || {}).map(String)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [entries, filter, query]);


  const loaded = entries !== null;

  // First load: rows stagger in.
  useGSAP(
    () => {
      if (!loaded || reducedMotion()) return;
      gsap.from('.entries__top > *, .erow', { y: 18, opacity: 0, duration: 0.5, stagger: 0.04, delay: introDelay(), ease: 'power3.out' });
    },
    { scope: root, dependencies: [loaded] }
  );

  // Filter / search: rows that stay glide to their new position (GSAP Flip).
  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      if (!state || reducedMotion()) return;
      Flip.from(state, {
        duration: 0.55,
        ease: 'power2.inOut',
        stagger: 0.025,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.15 }),
      });
    },
    { scope: root, dependencies: [filter, query] }
  );

  const captureFlip = () => {
    const rows = root.current.querySelectorAll('.erow');
    gsap.set(root.current.querySelectorAll('.erow__body'), { height: 0 });
    setOpen(null);
    flipState.current = Flip.getState(rows);
  };

  const { contextSafe } = useGSAP({ scope: root });

  const toggle = contextSafe((id, ev) => {
    const row = ev.currentTarget.closest('.erow');
    const body = row.querySelector('.erow__body');
    const wasOpen = open === id;
    if (open && !wasOpen) {
      const prev = root.current.querySelector(`.erow[data-id="${open}"] .erow__body`);
      if (prev) gsap.to(prev, { height: 0, duration: reducedMotion() ? 0 : 0.3, ease: 'power2.inOut' });
    }
    setOpen(wasOpen ? null : id);
    gsap.to(body, { height: wasOpen ? 0 : 'auto', duration: reducedMotion() ? 0 : 0.4, ease: 'power2.inOut' });
  });

  const remove = contextSafe((id, ev) => {
    if (armed !== id) {
      setArmed(id);
      setTimeout(() => setArmed((a) => (a === id ? null : a)), 3000);
      return;
    }
    const row = ev.currentTarget.closest('.erow');
    const finish = async () => {
      await api.deleteEntry(id);
      setEntries((list) => list.filter((e) => e.id !== id));
      setArmed(null);
    };
    if (reducedMotion()) {
      finish();
      return;
    }
    gsap.to(row, { x: 60, opacity: 0, height: 0, duration: 0.45, ease: 'power2.in', onComplete: finish });
  });

  const [viewMode, setViewMode] = useState('diary'); // 'diary' | 'list'

  if (!loaded) return <div className="entries" ref={root} aria-busy="true" />;

  return (
    <div className="entries" ref={root}>
      <div className="entries__top">
        <div className="entries__title-row">
          <div>
            <h1 className="display">{t('entries.title')}</h1>
            <p className="entries__subtitle">{t('entries.subtitle')}</p>
          </div>
          <div className="view-switcher" role="group" aria-label="View mode">
            <button
              type="button"
              className={`view-btn${viewMode === 'diary' ? ' is-active' : ''}`}
              onClick={() => setViewMode('diary')}
              title={t('entries.viewDiary')}
            >
              {t('entries.viewDiary')}
            </button>
            <button
              type="button"
              className={`view-btn${viewMode === 'list' ? ' is-active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t('entries.viewList')}
            >
              {t('entries.viewList')}
            </button>
          </div>
        </div>

        <div className="entries__controls">
          <input
            className="entries__search"
            type="search"
            placeholder={t('entries.search')}
            aria-label="Search entries"
            value={query}
            onChange={(e) => {
              captureFlip();
              setQuery(e.target.value);
            }}
          />
          <div className="chips" role="radiogroup" aria-label="Filter by template">
            {(() => {
              const tpl = getTemplate(userProf) || TEMPLATES[0];
              return (
                <span className="chip is-active" style={{ cursor: 'default' }}>
                  <span className="tab__dot" style={{ background: tpl.cover }} />
                  {tpl.name} Journal
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          <h2 className="display">{t('entries.empty')}</h2>
          <p>{t('entries.emptySub')}</p>
          <TLink to={`/app/new/${userProf}`} className="btn btn--primary">
            {t('entries.writeFirst')}
          </TLink>
        </div>
      ) : viewMode === 'diary' ? (
        <div className="diary-stack">
          {visible.map((e) => {
            const tpl = getTemplate(e.templateId);
            if (!tpl) return null;
            const s = tpl.summarize(e.values || {});
            const imageField = tpl.fields.find((f) => f.type === 'image');
            const imageUrl = imageField ? e.values?.[imageField.key] : null;
            const pnl = e.values?.pnl;
            const isWin = e.values?.result === 'Win' || (pnl != null && pnl > 0);
            const isLoss = e.values?.result === 'Loss' || (pnl != null && pnl < 0);

            return (
              <article
                key={e.id}
                className="diary-sheet"
                style={{ '--cover': tpl.cover, '--cover-ink': tpl.coverInk }}
                data-flip-id={e.id}
              >
                <div className="diary-sheet__binder" aria-hidden="true">
                  <span className="diary-sheet__hole" />
                  <span className="diary-sheet__hole" />
                  <span className="diary-sheet__hole" />
                </div>

                <div className="diary-sheet__paper">
                  <div className="diary-sheet__margin-line" aria-hidden="true" />

                  <header className="diary-sheet__header">
                    <div className="diary-sheet__date-box">
                      <span className="diary-sheet__date-stamp">{formatNice(e.date)}</span>
                      <span className="diary-sheet__tag" style={{ background: tpl.cover, color: tpl.coverInk }}>
                        {tpl.name} Log
                      </span>
                    </div>

                    <div className="diary-sheet__stamp-box">
                      {e.values?.result ? (
                        <span className={`ink-stamp ${isWin ? 'ink-stamp--win' : isLoss ? 'ink-stamp--loss' : ''}`}>
                          {e.values.result === 'Win' ? t('stamp.profit') : e.values.result === 'Loss' ? t('stamp.loss') : t('stamp.breakeven')}
                        </span>
                      ) : (
                        <span className="ink-stamp ink-stamp--verified">{t('entries.recorded')}</span>
                      )}
                    </div>
                  </header>

                  <div className="diary-sheet__title-row">
                    <h2 className="diary-sheet__title display">{s.title}</h2>
                    {pnl != null && (
                      <span className={`diary-sheet__pnl ${pnl >= 0 ? 'pnl--pos' : 'pnl--neg'}`}>
                        {pnl >= 0 ? `+₹${pnl.toLocaleString('en-IN')}` : `-₹${Math.abs(pnl).toLocaleString('en-IN')}`}
                      </span>
                    )}
                  </div>

                  {/* Primary Key-Value Grid */}
                  <div className="diary-sheet__grid">
                    {tpl.fields
                      .filter(
                        (f) =>
                          f.type !== 'image' &&
                          f.type !== 'textarea' &&
                          f.key !== 'title' &&
                          f.key !== 'pnl' &&
                          f.key !== 'result' &&
                          e.values?.[f.key] != null &&
                          e.values?.[f.key] !== ''
                      )
                      .map((f) => (
                        <div key={f.key} className="diary-sheet__stat-cell">
                          <span className="diary-sheet__stat-label">{f.label}</span>
                          <strong className="diary-sheet__stat-val">{show(f, e.values?.[f.key])}</strong>
                        </div>
                      ))}
                  </div>

                  {/* Ruled Long-form Handwritten Sections */}
                  <div className="diary-sheet__notes">
                    {tpl.fields
                      .filter((f) => f.type === 'textarea' && e.values?.[f.key])
                      .map((f) => {
                        const isMistake = f.key === 'mistake';
                        const isLesson = f.key === 'lesson';
                        const isShipped = f.key === 'shipped';
                        const isBlocker = f.key === 'blockers';

                        return (
                          <div
                            key={f.key}
                            className={`diary-note${
                              isMistake
                                ? ' diary-note--mistake'
                                : isLesson
                                ? ' diary-note--lesson'
                                : isShipped
                                ? ' diary-note--shipped'
                                : isBlocker
                                ? ' diary-note--blocker'
                                : ''
                            }`}
                          >
                            <span className="diary-note__label">
                              {isMistake && '⚠️ '}
                              {isLesson && '💡 '}
                              {isShipped && '🚀 '}
                              {isBlocker && '🛑 '}
                              {f.label}:
                            </span>
                            <div className="diary-note__text">{e.values[f.key]}</div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Polaroid Photo with Washi Tape Effect */}
                  {imageUrl && (
                    <div className="polaroid-wrapper">
                      <div
                        className="polaroid-card"
                        onClick={() => setLightbox(imageUrl)}
                        title={t('entries.zoom')}
                      >
                        <div className="polaroid-card__tape" aria-hidden="true" />
                        <div className="polaroid-card__frame">
                          <img src={imageUrl} alt={imageField?.label || 'Diary attachment'} />
                        </div>
                        <div className="polaroid-card__caption">
                          <span>📷 {imageField?.label || t('callout.photo')}</span>
                          <small>{t('entries.zoom')}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  <footer className="diary-sheet__footer">
                    <span className="diary-sheet__id">{t('entries.pageId', { id: e.id.slice(0, 10) })}</span>
                    <button
                      type="button"
                      className={`linkbtn linkbtn--danger${armed === e.id ? ' is-armed' : ''}`}
                      onClick={(ev) => remove(e.id, ev)}
                    >
                      {armed === e.id ? t('entries.tearConfirm') : t('entries.tearPage')}
                    </button>
                  </footer>
                </div>
              </article>
            );
          })}
          {visible.length === 0 && <p className="entries__none">{t('entries.none')}</p>}
        </div>
      ) : (
        <div className="erows">
          {visible.map((e) => {
            const tpl = getTemplate(e.templateId);
            if (!tpl) return null;
            const s = tpl.summarize(e.values || {});
            const isOpen = open === e.id;
            const imageField = tpl.fields.find((f) => f.type === 'image');
            const imageUrl = imageField ? e.values?.[imageField.key] : null;

            return (
              <div className="erow" key={e.id} data-id={e.id} data-flip-id={e.id}>
                <button type="button" className="erow__head" aria-expanded={isOpen} onClick={(ev) => toggle(e.id, ev)}>
                  <span className="drow__dot" style={{ background: tpl.cover }} title={tpl.name} />
                  <span className="drow__title">{s.title}</span>
                  <span className="drow__meta">
                    {s.meta.map((m) => {
                      const isMoney = m.startsWith('+₹') || m.startsWith('-₹');
                      const isWin = m.startsWith('+₹') || m === 'Win';
                      const isLoss = m.startsWith('-₹') || m === 'Loss';
                      return (
                        <span
                          key={m}
                          className={isMoney ? `pnl-badge ${isWin ? 'pnl-badge--win' : isLoss ? 'pnl-badge--loss' : ''}` : ''}
                        >
                          {m}
                        </span>
                      );
                    })}
                  </span>
                  <span className="drow__date">{formatNice(e.date)}</span>
                </button>
                <div className="erow__body">
                  <div className="erow__inner">
                    <dl>
                      {tpl.fields
                        .filter((f) => f.type !== 'image')
                        .map((f) => {
                          const val = e.values?.[f.key];
                          const isHighlighted = ['mistake', 'lesson', 'blockers', 'shipped', 'issues'].includes(f.key) && val;
                          return (
                            <div
                              key={f.key}
                              className={`${f.type === 'textarea' ? 'wide' : ''}${isHighlighted ? ' callout-field' : ''}`}
                            >
                              <dt>
                                {f.key === 'mistake' && '⚠️ '}
                                {f.key === 'lesson' && '💡 '}
                                {f.key === 'blockers' && '🛑 '}
                                {f.key === 'shipped' && '🚀 '}
                                {f.key === 'issues' && '⚠️ '}
                                {f.label}
                              </dt>
                              <dd>{show(f, val)}</dd>
                            </div>
                          );
                        })}
                    </dl>

                    {imageUrl && (
                      <div className="erow__image-section">
                        <span className="erow__image-label">{imageField?.label || t('callout.photo')}</span>
                        <div
                          className="erow__image-card"
                          onClick={() => setLightbox(imageUrl)}
                          title={t('entries.enlarge')}
                        >
                          <img src={imageUrl} alt={imageField?.label || 'Entry attachment'} />
                          <span className="erow__image-overlay">{t('entries.enlarge')}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className={`linkbtn linkbtn--danger${armed === e.id ? ' is-armed' : ''}`}
                      onClick={(ev) => remove(e.id, ev)}
                    >
                      {armed === e.id ? t('entries.deleteConfirm') : t('entries.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && <p className="entries__none">{t('entries.none')}</p>}
        </div>
      )}

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
              ✕
            </button>
            <img src={lightbox} alt="Full resolution view" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
