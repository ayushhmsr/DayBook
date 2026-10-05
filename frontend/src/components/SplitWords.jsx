// Splits a string into masked word spans so GSAP can slide each word up.
export default function SplitWords({ text }) {
  return text.split(' ').map((w, i) => (
    <span className="w" key={`${w}-${i}`}>
      <span className="w__in">{w}</span>
    </span>
  ));
}
