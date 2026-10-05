const pad = (n) => String(n).padStart(2, '0');

// Entries store their date as a plain 'YYYY-MM-DD' string (local day), which
// avoids timezone bugs and maps cleanly to a String field in MongoDB.
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => dayKey(new Date());
export const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};
export const formatNice = (k) =>
  parseKey(k).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
