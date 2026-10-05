import { useRef, useState } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';
import { BrandMark } from './Brand.jsx';
import { exportLoyaltyCardAsImage, shareLoyaltyPass } from '../utils/exportCard.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function LoyaltyCard({
  user,
  streak = 0,
  longestStreak = 0,
  template,
  previewOnly = false,
}) {
  const cardRef = useRef(null);
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const bestStreak = Math.max(streak, longestStreak);
  const unlocked = bestStreak >= 7;
  const progress = Math.min(7, bestStreak);

  const userName = user?.name || (previewOnly ? 'Alex Morgan' : t('nav.guest'));
  const professionName = template?.name || 'Trader';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDownload = (e) => {
    e?.stopPropagation();
    if (previewOnly) return;
    if (!unlocked) {
      showToast(`🔒 7-day continuous streak required to download! (${progress}/7 days completed)`);
      return;
    }
    showToast(t('dash.loading'));
    const success = exportLoyaltyCardAsImage({
      userName,
      profession: professionName,
      streak: bestStreak,
      unlocked: true,
    });
    if (success) {
      showToast('✓ Master Pass downloaded successfully!');
    }
  };

  const handleShare = async (e) => {
    e?.stopPropagation();
    if (previewOnly) return;
    if (!unlocked) {
      showToast(`🔒 7-day continuous streak required to share! (${progress}/7 days completed)`);
      return;
    }
    const res = await shareLoyaltyPass({
      userName,
      profession: professionName,
      streak: bestStreak,
      unlocked: true,
    });
    if (res.method === 'clipboard') {
      showToast('✓ Achievement copied to clipboard!');
    } else if (res.success) {
      showToast('✓ Shared successfully!');
    }
  };

  const shareText = encodeURIComponent(
    `🏆 I unlocked the 7-Day Consistency Master Pass on Daybook (${professionName} Logbook)! 7 consecutive days of unbroken focus. Check out Daybook:`
  );
  const shareUrl = encodeURIComponent(window.location.origin);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const el = cardRef.current;
      if (!el) return;

      const qx = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const qy = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const shine = el.querySelector('.loyalty-card__shine');
      const qshine = shine ? gsap.quickTo(shine, 'opacity', { duration: 0.3 }) : () => {};

      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        if (clientX === undefined || clientY === undefined) return;
        const px = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const py = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        qx(Math.max(-16, Math.min(16, px * 14)));
        qy(Math.max(-16, Math.min(16, -py * 14)));
        qshine(0.85);
      };

      const onLeave = () => {
        qx(0);
        qy(0);
        qshine(0);
      };

      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', onLeave);
      el.addEventListener('pointerup', onLeave);
      el.addEventListener('pointercancel', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('pointerup', onLeave);
        el.removeEventListener('pointercancel', onLeave);
      };
    },
    { scope: cardRef }
  );

  const cardElement = (
    <div
      ref={cardRef}
      className={`loyalty-card${unlocked ? ' loyalty-card--unlocked' : ' loyalty-card--locked'}`}
      onClick={() => {
        if (previewOnly) return;
        if (unlocked) {
          setShowModal(true);
        } else {
          showToast(`🔒 Complete 7 consecutive days to unlock your Master Pass! (${progress}/7 days completed)`);
        }
      }}
      style={{ '--card-accent': template?.cover || '#0F2A33' }}
    >
      <div className="loyalty-card__shine" aria-hidden="true" />
      <div className="loyalty-card__bg-pattern" aria-hidden="true" />

      <div className="loyalty-card__top">
        <div className="loyalty-card__brand">
          <BrandMark />
          <span className="loyalty-card__brand-name display">Daybook Club</span>
        </div>
        <span className={`loyalty-card__pill${unlocked ? ' loyalty-card__pill--gold' : ''}`}>
          {unlocked ? '★ 7-DAY MASTER PASS' : `${progress}/7 DAYS`}
        </span>
      </div>

      <div className="loyalty-card__body">
        <div className="loyalty-card__emblem" aria-hidden="true">
          {unlocked ? '🏛️' : '⏳'}
        </div>
        <div className="loyalty-card__member">
          <span className="loyalty-card__label">{t('card.certifiedHolder')}</span>
          <span className="loyalty-card__name display">{userName}</span>
          <span className="loyalty-card__prof">
            {professionName.toLowerCase().endsWith('logbook') || professionName.toLowerCase().endsWith('journal')
              ? professionName
              : `${professionName} Logbook`}
          </span>
        </div>
      </div>

      <div className="loyalty-card__stamps" role="group" aria-label="7 day stamps">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const isStamped = day <= progress;
          return (
            <div
              key={day}
              className={`loyalty-stamp${isStamped ? ' loyalty-stamp--done' : ''}`}
              title={`Day ${day}: ${isStamped ? 'Completed' : 'Pending'}`}
            >
              <span className="loyalty-stamp__day">D{day}</span>
              <span className="loyalty-stamp__mark">{isStamped ? '✓' : '○'}</span>
            </div>
          );
        })}
      </div>

      <div className="loyalty-card__footer">
        <span className="loyalty-card__tag">
          {t('card.officialProof')}
        </span>
        <span className="loyalty-card__seal">{unlocked ? t('card.goldVerified') : t('card.inProgress')}</span>
      </div>
    </div>
  );

  // If used in pure preview/showcase mode (e.g. Landing page): render pure card directly
  if (previewOnly) {
    return cardElement;
  }

  return (
    <>
      <div className="loyalty-widget">
        <div className="loyalty-widget__header">
          <div>
            <h3 className="loyalty-widget__title display">
              {unlocked ? t('card.masterTitle') : t('card.passTitle')}
            </h3>
            <p className="loyalty-widget__desc">
              {unlocked
                ? t('card.unlockedDesc')
                : t('card.lockedDesc', { progress, remaining: 7 - progress })}
            </p>
          </div>
          {unlocked && (
            <div className="loyalty-widget__btns" style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn--small btn--primary"
                onClick={() => setShowModal(true)}
              >
                {t('card.inspect')}
              </button>
            </div>
          )}
        </div>

        {cardElement}

        {/* Dashboard authenticated view with direct PNG download */}
        <div className="loyalty-actions">
          <button
            type="button"
            className={`btn btn--small ${unlocked ? 'btn--primary' : 'btn--ghost'}`}
            onClick={handleDownload}
            disabled={!unlocked}
            title={unlocked ? 'Download Master Pass Image (PNG)' : `Locked: 7 continuous days required (${progress}/7 days completed)`}
            style={!unlocked ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
          >
            {unlocked ? t('card.downloadBtn') : `🔒 Download Pass (${progress}/7 Days)`}
          </button>
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={handleShare}
            disabled={!unlocked}
            title={unlocked ? 'Share or Copy Link' : `Locked: 7 continuous days required (${progress}/7 days completed)`}
            style={!unlocked ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
          >
            {unlocked ? t('card.shareBtn') : `🔒 Share`}
          </button>

          <div className="loyalty-socials" style={!unlocked ? { opacity: 0.35, pointerEvents: 'none' } : {}}>
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="loyalty-social-btn"
              title="Share to WhatsApp"
              onClick={(e) => {
                if (!unlocked) {
                  e.preventDefault();
                  showToast('🔒 Complete 7-day streak first!');
                }
              }}
            >
              💬
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="loyalty-social-btn"
              title="Share to X (Twitter)"
              onClick={(e) => {
                if (!unlocked) {
                  e.preventDefault();
                  showToast('🔒 Complete 7-day streak first!');
                }
              }}
            >
              𝕏
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="loyalty-social-btn"
              title="Share to LinkedIn"
              onClick={(e) => {
                if (!unlocked) {
                  e.preventDefault();
                  showToast('🔒 Complete 7-day streak first!');
                }
              }}
            >
              in
            </a>
          </div>

          {toastMsg && <span className="loyalty-toast">{toastMsg}</span>}
        </div>
      </div>

      {showModal && (
        <div className="lightbox-overlay" onClick={() => setShowModal(false)}>
          <div className="loyalty-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={() => setShowModal(false)} aria-label="Close">
              ✕
            </button>
            <div className="loyalty-modal__content">
              <div className="loyalty-modal__celebrate">
                <span className="loyalty-modal__trophy">🏆</span>
                <h2 className="display">{t('card.modalTitle')}</h2>
                <p>
                  {t('card.modalCongrat', {
                    name: userName,
                    profession: professionName.toLowerCase().endsWith('logbook') ? professionName : `${professionName} logbook`,
                  })}
                </p>
              </div>

              <div className="loyalty-card loyalty-card--unlocked loyalty-card--large">
                <div className="loyalty-card__shine" />
                <div className="loyalty-card__top">
                  <div className="loyalty-card__brand">
                    <BrandMark />
                    <span className="loyalty-card__brand-name display">Daybook Club</span>
                  </div>
                  <span className="loyalty-card__pill loyalty-card__pill--gold">★ 7-DAY MASTER PASS</span>
                </div>
                <div className="loyalty-card__body">
                  <div className="loyalty-card__emblem">🏛️</div>
                  <div className="loyalty-card__member">
                    <span className="loyalty-card__label">{t('card.certifiedHolder')}</span>
                    <span className="loyalty-card__name display">{userName}</span>
                    <span className="loyalty-card__prof">
                      {professionName.toLowerCase().endsWith('logbook') || professionName.toLowerCase().endsWith('journal')
                        ? professionName
                        : `${professionName} Logbook`}
                    </span>
                  </div>
                </div>
                <div className="loyalty-card__stamps">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div key={day} className="loyalty-stamp loyalty-stamp--done">
                      <span className="loyalty-stamp__day">D{day}</span>
                      <span className="loyalty-stamp__mark">✓</span>
                    </div>
                  ))}
                </div>
                <div className="loyalty-card__footer">
                  <span className="loyalty-card__tag">{t('card.officialProof')}</span>
                  <span className="loyalty-card__seal">{t('card.goldVerified')}</span>
                </div>
              </div>

              <div className="loyalty-modal__actions">
                <div className="loyalty-modal__btn-row">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleDownload}
                    disabled={!unlocked}
                  >
                    {t('card.downloadBtn')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleShare}
                    disabled={!unlocked}
                  >
                    {t('card.shareBtn')}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setShowModal(false)}>
                    {t('card.close')}
                  </button>
                </div>
                {toastMsg && <span className="loyalty-toast">{toastMsg}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
