import { useRef, useState, useEffect } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap.js';
import { processImageFile } from '../utils/image.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export const defaultValue = (def) =>
  def.type === 'toggle' ? false : def.type === 'rating' ? 0 : def.type === 'image' ? null : '';

export default function Field({ def, value, onChange, error }) {
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { t, lang } = useLanguage();
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(() => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const { contextSafe } = useGSAP({ scope: ref });
  const id = `f-${def.key}`;
  const labelId = `${id}-label`;

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const pop = contextSafe((el) => {
    if (reducedMotion()) return;
    gsap.fromTo(el, { scale: 0.7 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' });
  });

  const toggleVoice = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!voiceSupported) {
      alert(t('voice.unsupported'));
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    try {
      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent || '');
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = !isMobile;
      recognition.interimResults = !isMobile;

      // Base text prior to this recording session
      const baseText = typeof value === 'string' ? value.trim() : '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let fullSpoken = '';
        if (isMobile) {
          // On mobile Android/iOS, pick the final transcript cleanly to avoid engine buffer duplication
          for (let i = 0; i < event.results.length; i++) {
            const chunk = event.results[i][0]?.transcript || '';
            if (chunk.trim()) {
              fullSpoken = chunk.trim();
            }
          }
        } else {
          // On desktop, concatenate continuous chunks
          for (let i = 0; i < event.results.length; i++) {
            const chunk = event.results[i][0]?.transcript || '';
            if (chunk.trim()) {
              fullSpoken += (fullSpoken ? ' ' : '') + chunk.trim();
            }
          }
        }

        const cleanSpoken = fullSpoken.trim();
        if (cleanSpoken) {
          const combined = baseText ? `${baseText} ${cleanSpoken}` : cleanSpoken;
          onChange(combined);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
    } catch {
      /* ignore */
    } finally {
      setProcessing(false);
    }
  };

  const grouped = ['rating', 'toggle'].includes(def.type) || (def.type === 'select' && def.options.length <= 4);

  let control;
  if (def.type === 'image') {
    control = (
      <div className="img-upload">
        {value ? (
          <div className="img-upload__preview-box">
            <img src={value} alt="Uploaded attachment" className="img-upload__img" />
            <div className="img-upload__actions">
              <button
                type="button"
                className="btn btn--small btn--ghost img-upload__remove"
                onClick={() => {
                  onChange(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                ✕ {t('upload.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`img-upload__dropzone${dragging ? ' is-dragging' : ''}${processing ? ' is-processing' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="img-upload__prompt">
              <span className="img-upload__icon" aria-hidden="true">
                📷
              </span>
              <div>
                <strong>{processing ? 'Processing image…' : t('upload.drop')}</strong>
                <span className="img-upload__hint">{t('upload.click')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else if (def.type === 'textarea') {
    control = (
      <textarea
        id={id}
        rows={def.rows || 3}
        value={value}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
    );
  } else if (def.type === 'combo') {
    const listId = `${id}-list`;
    control = (
      <div className="combo-field">
        <input
          id={id}
          type="text"
          list={listId}
          value={value || ''}
          placeholder={def.placeholder || 'Select preset or type custom…'}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
        />
        {def.options && (
          <datalist id={listId}>
            {def.options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        )}
        {def.options && def.options.length > 0 && (
          <div className="chips chips--mini" role="group" aria-label="Suggested presets" style={{ marginTop: '8px' }}>
            {def.options.map((o) => (
              <button
                key={o}
                type="button"
                className={`chip chip--sm${value === o ? ' is-active' : ''}`}
                onClick={(e) => {
                  onChange(value === o ? '' : o);
                  pop(e.currentTarget);
                }}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  } else if (def.type === 'select' && def.options.length > 4) {
    control = (
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error}>
        <option value="">Choose…</option>
        {def.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (def.type === 'select') {
    control = (
      <div className="chips" role="radiogroup" aria-labelledby={labelId}>
        {def.options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            className="chip"
            onClick={(e) => {
              onChange(value === o ? '' : o);
              pop(e.currentTarget);
            }}
          >
            {o}
          </button>
        ))}
      </div>
    );
  } else if (def.type === 'rating') {
    control = (
      <div className="rating" role="radiogroup" aria-labelledby={labelId}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5`}
            className={`rating__dot${n <= value ? ' is-on' : ''}`}
            onClick={(e) => {
              onChange(value === n ? 0 : n);
              pop(e.currentTarget);
            }}
          >
            {n}
          </button>
        ))}
      </div>
    );
  } else if (def.type === 'toggle') {
    control = (
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-labelledby={labelId}
        className="switch"
        onClick={() => onChange(!value)}
      >
        <span className="switch__knob" />
        <span className="switch__text">{value ? 'Yes' : 'No'}</span>
      </button>
    );
  } else {
    control = (
      <input
        id={id}
        type={def.type === 'number' ? 'number' : def.type === 'date' ? 'date' : 'text'}
        inputMode={def.type === 'number' ? 'decimal' : undefined}
        step={def.type === 'number' ? 'any' : undefined}
        max={def.max}
        value={value}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
    );
  }

  const hasVoice = voiceSupported && ['textarea', 'text', 'combo'].includes(def.type);

  return (
    <div ref={ref} className={`field${def.half ? ' field--half' : ''}${error ? ' field--error' : ''}`} data-key={def.key}>
      <div className="field__header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
        {grouped ? (
          <span className="field__label" id={labelId} style={{ margin: 0 }}>
            {def.label}
            {def.unit && <span className="field__unit"> ({def.unit})</span>}
            {def.required && <span className="field__req"> *</span>}
          </span>
        ) : (
          <label className="field__label" htmlFor={id} style={{ margin: 0 }}>
            {def.label}
            {def.unit && <span className="field__unit"> ({def.unit})</span>}
            {def.required && <span className="field__req"> *</span>}
          </label>
        )}
        {hasVoice && (
          <button
            type="button"
            className={`voice-btn${isListening ? ' voice-btn--active' : ''}`}
            onClick={toggleVoice}
            title={isListening ? t('voice.stop') : t('voice.dictate')}
            aria-label="Voice Dictation"
          >
            <span className="voice-btn__dot">{isListening ? '🔴' : '🎙️'}</span>
            <span className="voice-btn__txt">{isListening ? t('voice.listening') : t('voice.dictate')}</span>
          </button>
        )}
      </div>
      {control}
      {def.help && !error && <p className="field__help">{def.help}</p>}
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
