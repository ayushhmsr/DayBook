const MOTIFS = {
  trader: (
    <svg viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M14 8v38M34 14v38M54 4v36M72 16v30" />
      <rect x="9" y="18" width="10" height="16" fill="currentColor" />
      <rect x="29" y="24" width="10" height="18" />
      <rect x="49" y="10" width="10" height="20" fill="currentColor" />
      <rect x="67" y="22" width="10" height="14" />
    </svg>
  ),
  developer: (
    <svg viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 12 6 30l18 18M56 12l18 18-18 18M46 8 34 52" />
    </svg>
  ),
  driver: (
    <svg viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M8 48C26 48 24 16 42 16s14 32 30 32" strokeDasharray="1 7" />
      <circle cx="8" cy="48" r="5" fill="currentColor" stroke="none" />
      <circle cx="72" cy="48" r="5" fill="currentColor" stroke="none" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M8 14h64M8 28h64M8 42h40" />
    </svg>
  ),
};

export default function Logbook({ template, as: Tag = 'div', className = '' }) {
  return (
    <Tag
      className={`book ${className}`}
      style={{ '--cover': template.cover, '--cover-ink': template.coverInk }}
    >
      <span className="book__pages" aria-hidden="true" />
      <span className="book__face">
        <span className="book__band" aria-hidden="true" />
        <span className="book__motif">{MOTIFS[template.id]}</span>
        <span className="book__name display">{template.name}</span>
        <span className="book__sub">{template.tagline}</span>
      </span>
    </Tag>
  );
}
