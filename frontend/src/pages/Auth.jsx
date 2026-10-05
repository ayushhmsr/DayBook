import { useRef, useState } from 'react';
import { gsap, useGSAP, reducedMotion, introDelay } from '../lib/gsap.js';
import { api } from '../api/journalApi.js';
import { TEMPLATES } from '../data/templates.js';
import Logbook from '../components/Logbook.jsx';
import Brand from '../components/Brand.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTransition } from '../components/TransitionProvider.jsx';

export default function Auth({ initialMode = 'signin' }) {
  const root = useRef(null);
  const firstRun = useRef(true);
  const { go } = useTransition();
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup' | 'verify_otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', profession: 'trader' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';
  const isOtp = mode === 'verify_otp';

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('.auth__stack .book', {
        y: -200,
        rotation: (i) => (i % 2 ? 16 : -16),
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        delay: introDelay(),
        ease: 'back.out(1.5)',
      });
      gsap.from('.auth__panel > *', { y: 22, opacity: 0, duration: 0.6, stagger: 0.07, delay: introDelay() + 0.1, ease: 'power3.out' });
    },
    { scope: root }
  );

  // The name and profession fields slide open when switching to "Create account".
  useGSAP(
    () => {
      const instant = firstRun.current || reducedMotion();
      firstRun.current = false;
      gsap.to('.auth__signup-fields', { height: signup ? 'auto' : 0, opacity: signup ? 1 : 0, duration: instant ? 0 : 0.4, ease: 'power2.inOut' });
    },
    { scope: root, dependencies: [mode] }
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (isOtp) {
      if (!otp.trim()) return setError(t('auth.otpRequired'));
      setBusy(true);
      try {
        await api.verifyEmail({
          email: form.email,
          otp: otp.trim(),
          password: form.password,
          profession: form.profession,
        });
        go('/app');
      } catch (err) {
        setError(err.message || t('auth.error'));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError(t('auth.invalidEmail'));
    if (form.password.length < 6) return setError(t('auth.shortPass'));
    setBusy(true);

    try {
      if (signup) {
        const res = await api.register(form);
        setInfo(res.message || t('auth.otpSub', { email: form.email }));
        setMode('verify_otp');
      } else {
        await api.login(form);
        go('/app');
      }
    } catch (err) {
      // If email exists but unverified, direct to OTP verification
      if (err.status === 403 || err.message?.toLowerCase().includes('not verified')) {
        setError(err.message);
        setMode('verify_otp');
      } else {
        setError(err.message || t('auth.error'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth" ref={root}>
      <aside className="auth__aside" aria-hidden="true">
        <Brand />
        <div className="auth__stack">
          {TEMPLATES.map((t) => (
            <Logbook key={t.id} template={t} />
          ))}
        </div>
      </aside>
      <main className="auth__panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 className="display" style={{ margin: 0 }}>
            {isOtp ? t('auth.otpTitle') : signup ? t('auth.createAccount') : t('auth.welcome')}
          </h1>
          <LanguageToggle />
        </div>
        <p className="auth__sub">
          {isOtp ? t('auth.otpSub', { email: form.email || 'your email' }) : t('auth.sub')}
        </p>

        <form onSubmit={submit} noValidate>
          {isOtp ? (
            <div className="field">
              <label className="field__label" htmlFor="otp">
                {t('auth.otpLabel')}
              </label>
              <input
                id="otp"
                type="text"
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                autoFocus
                autoComplete="one-time-code"
                style={{ fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted, #777)', marginTop: '8px' }}>
                {t('auth.checkInbox')}
              </p>
            </div>
          ) : (
            <>
              <div className="auth__signup-fields">
                <div className="field">
                  <label className="field__label" htmlFor="name">
                    {t('auth.fullName')}
                  </label>
                  <input id="name" type="text" value={form.name} onChange={set('name')} tabIndex={signup ? 0 : -1} autoComplete="name" />
                </div>
                <div className="field" style={{ marginTop: '12px' }}>
                  <span className="field__label">{t('auth.profession')}</span>
                  <div className="chips" role="radiogroup" aria-label="Select profession">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={form.profession === t.id}
                        className={`chip${form.profession === t.id ? ' is-active' : ''}`}
                        onClick={() => setForm((f) => ({ ...f, profession: t.id }))}
                        tabIndex={signup ? 0 : -1}
                      >
                        <span className="tab__dot" style={{ background: t.cover, display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="email">
                  {t('auth.email')}
                </label>
                <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="password">
                  {t('auth.password')}
                </label>
                <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete={signup ? 'new-password' : 'current-password'} />
              </div>
            </>
          )}

          {error && (
            <p className="field__error" role="alert">
              {error}
            </p>
          )}
          {info && !error && (
            <p style={{ color: 'var(--brand-ink, #0052cc)', fontSize: '0.9rem', marginTop: '6px' }} role="status">
              {info}
            </p>
          )}

          <button className="btn btn--primary auth__submit" type="submit" disabled={busy}>
            {busy
              ? t('dash.loading')
              : isOtp
              ? t('auth.verifyOtp')
              : signup
              ? t('auth.signup')
              : t('auth.signin')}
          </button>
        </form>

        {isOtp ? (
          <p className="auth__switch" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="linkbtn"
              onClick={() => {
                setError('');
                setInfo('');
                setMode('signin');
              }}
            >
              ← {t('auth.backToSignin')}
            </button>
          </p>
        ) : (
          <>
            <p className="auth__switch">
              {signup ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
              <button
                type="button"
                className="linkbtn"
                onClick={() => {
                  setError('');
                  setInfo('');
                  setMode(signup ? 'signin' : 'signup');
                }}
              >
                {signup ? t('auth.signin') : t('auth.signup')}
              </button>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

