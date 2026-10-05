import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`lang-toggle ${className}`} role="group" aria-label="Language selector">
      <button
        type="button"
        className={`lang-toggle__btn${lang === 'en' ? ' is-active' : ''}`}
        onClick={() => setLang('en')}
        title="Switch to English"
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <span className="lang-toggle__divider" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-toggle__btn${lang === 'hi' ? ' is-active' : ''}`}
        onClick={() => setLang('hi')}
        title="हिन्दी में बदलें"
        aria-pressed={lang === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
}
