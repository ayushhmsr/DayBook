import { TLink } from './TransitionProvider.jsx';

export function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="4" y="2" width="20" height="24" rx="2" fill="currentColor" />
      <rect x="4" y="2" width="5" height="24" rx="2" fill="#FFD84D" />
      <path d="M13 9h8M13 14h8M13 19h5" stroke="#FAFBF9" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ to = '/' }) {
  return (
    <TLink to={to} className="brand" aria-label="Daybook home">
      <BrandMark />
      <span className="brand__name display">Daybook</span>
    </TLink>
  );
}
