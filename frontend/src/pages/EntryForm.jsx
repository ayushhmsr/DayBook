import { useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { gsap, useGSAP, reducedMotion, introDelay } from '../lib/gsap.js';
import { api } from '../api/journalApi.js';
import { getTemplate } from '../data/templates.js';
import { formatNice, todayKey } from '../utils/dates.js';
import Field, { defaultValue } from '../components/FieldRenderer.jsx';
import Logbook from '../components/Logbook.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { TLink, useTransition } from '../components/TransitionProvider.jsx';

function validate(template, values) {
  const errors = {};
  template.fields.forEach((f) => {
    const v = values[f.key];
    const isBlank = v === '' || v == null || (f.type === 'rating' && v === 0);
    if (f.required && isBlank) {
      errors[f.key] = 'Required';
    } else if (f.type === 'number' && v !== '' && v != null && Number.isNaN(Number(v))) {
      errors[f.key] = 'Enter a number';
    }
  });
  const custom = template.validate?.(values) || {};
  return { ...errors, ...custom };
}

function normalize(template, values) {
  const out = {};
  template.fields.forEach((f) => {
    const v = values[f.key];
    if (f.type === 'number') out[f.key] = v === '' ? null : Number(v);
    else if (typeof v === 'string') out[f.key] = v.trim();
    else out[f.key] = v;
  });
  return out;
}

export default function EntryForm() {
  const { templateId } = useParams();
  const user = api.getUserSync();
  const userProf = user?.profession || 'trader';
  const activeTemplateId = templateId || userProf;
  const template = getTemplate(activeTemplateId);
  const { go } = useTransition();
  const { t } = useLanguage();
  const root = useRef(null);
  const [date, setDate] = useState(todayKey());
  const [values, setValues] = useState(() =>
    template ? Object.fromEntries(template.fields.map((f) => [f.key, defaultValue(f)])) : {}
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // If user tries to open a different template than their profession, redirect to their profession
  if (templateId && templateId !== userProf) {
    return <Navigate to={`/app/new/${userProf}`} replace />;
  }


  const { contextSafe } = useGSAP(
    () => {
      if (!template || reducedMotion()) return;
      gsap
        .timeline({ delay: introDelay(), defaults: { ease: 'power3.out' } })
        .from('.ef__head > *', { y: 24, opacity: 0, duration: 0.6, stagger: 0.07 })
        .from('.field', { y: 26, opacity: 0, duration: 0.55, stagger: 0.045 }, '-=0.3')
        .from('.ef__actions', { opacity: 0, y: 16, duration: 0.5 }, '-=0.2');
    },
    { scope: root, dependencies: [templateId], revertOnUpdate: true }
  );

  // Fields that failed validation shake.
  const shake = contextSafe((keys) => {
    const first = root.current.querySelector(`[data-key="${keys[0]}"]`);
    first?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    if (reducedMotion()) return;
    keys.forEach((k) => {
      const el = root.current.querySelector(`[data-key="${k}"]`);
      if (el) gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,0.25)' });
    });
  });

  // The "Logged" stamp slams down, the page thuds, then we go back to the dashboard.
  const playStamp = contextSafe(() => {
    if (reducedMotion()) {
      gsap.set('.stamp-overlay', { display: 'grid', opacity: 1 });
      gsap.delayedCall(0.9, () => go('/app'));
      return;
    }
    gsap
      .timeline()
      .set('.stamp-overlay', { display: 'grid' })
      .fromTo('.stamp-overlay', { opacity: 0 }, { opacity: 1, duration: 0.2 })
      .fromTo('.stamp', { scale: 3.2, rotation: -24, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.34, ease: 'power4.in' })
      .to('.ef__paper', { y: 7, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' })
      .fromTo('.stamp__ring', { scale: 0.6, opacity: 0.7 }, { scale: 2.4, opacity: 0, duration: 0.7, ease: 'power2.out' }, '<')
      .to('.stamp', { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1 }, '<0.05')
      .add(() => go('/app'), '+=0.8');
  });

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = validate(template, values);
    setErrors(errs);
    const keys = Object.keys(errs);
    if (keys.length) {
      shake(keys);
      return;
    }
    setSaving(true);
    try {
      await api.createEntry({ templateId, date, values: normalize(template, values) });
      playStamp();
    } catch {
      setSaving(false);
      setErrors({ _form: t('auth.error') });
    }
  };

  if (!template) return <Navigate to="/app/new" replace />;

  const setValue = (key) => (v) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((s) => ({ ...s, [key]: undefined }));
  };

  return (
    <div className="ef" ref={root} style={{ '--cover': template.cover, '--cover-ink': template.coverInk }}>
      <div className="ef__paper">
        <header className="ef__head">
          <Logbook template={template} className="book--mini" />
          <div>
            <h1 className="display">{t('form.entryTitle', { name: template.name })}</h1>
            <p>{template.prompt}</p>
            {template.notice && <p className="ef__notice">{template.notice}</p>}
          </div>
        </header>

        <form onSubmit={submit} noValidate>
          <div className="ef__grid">
            <Field def={{ key: '_date', label: t('form.date'), type: 'date', max: todayKey(), half: true }} value={date} onChange={setDate} />
            {template.fields.map((f) => (
              <Field key={f.key} def={f} value={values[f.key]} onChange={setValue(f.key)} error={errors[f.key]} />
            ))}
          </div>
          {errors._form && (
            <p className="field__error" role="alert">
              {errors._form}
            </p>
          )}
          <div className="ef__actions">
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? t('form.saving') : t('form.save')}
            </button>
            <TLink to="/app" className="btn btn--ghost">
              Cancel
            </TLink>
          </div>
        </form>
      </div>

      <div className="stamp-overlay" aria-hidden="true">
        <div className="stamp">
          <span className="stamp__ring" />
          <strong>{t('form.logged')}</strong>
          <small>{formatNice(date)}</small>
        </div>
      </div>
    </div>
  );
}
