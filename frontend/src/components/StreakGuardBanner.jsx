import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { TLink } from './TransitionProvider.jsx';

export default function StreakGuardBanner({ streak = 0, hasLoggedToday = false, profession = 'trader' }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`streak-guard-banner${hasLoggedToday ? ' streak-guard--done' : ' streak-guard--active'}`}>
      <div className="streak-guard__left">
        <div className="streak-guard__icon">
          {hasLoggedToday ? '🛡️' : '🔥'}
        </div>
        <div className="streak-guard__text">
          <div className="streak-guard__head">
            <span className="streak-guard__tag">
              {hasLoggedToday ? 'STREAK PROTECTED' : 'STREAK AT RISK'}
            </span>
            <span className="streak-guard__clock">
              ⏳ {timeLeft || '00:00:00'} until midnight
            </span>
          </div>
          <p className="streak-guard__msg">
            {hasLoggedToday
              ? t('guard.logged', { streak })
              : t('guard.pending', { streak: Math.max(1, streak), time: timeLeft || 'today' })}
          </p>
        </div>
      </div>

      {!hasLoggedToday && (
        <div className="streak-guard__action">
          <TLink to={`/app/new/${profession}`} className="btn btn--small btn--primary streak-guard__btn">
            {t('guard.logNow')} &rarr;
          </TLink>
        </div>
      )}
    </div>
  );
}
