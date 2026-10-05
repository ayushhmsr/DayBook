import { addDays, dayKey, parseKey } from './dates.js';

export function countsByDay(entries) {
  const m = {};
  entries.forEach((e) => {
    m[e.date] = (m[e.date] || 0) + 1;
  });
  return m;
}

export function currentStreak(counts) {
  let d = new Date();
  d.setHours(0, 0, 0, 0);
  if (!counts[dayKey(d)]) d = addDays(d, -1); // today not logged yet: streak is still alive
  let n = 0;
  while (counts[dayKey(d)]) {
    n += 1;
    d = addDays(d, -1);
  }
  return n;
}

export function longestStreak(counts) {
  const keys = Object.keys(counts).filter((k) => counts[k] > 0).sort();
  let best = 0;
  let cur = 0;
  let prev = null;
  for (const k of keys) {
    const dt = parseKey(k);
    cur = prev && Math.round((dt - prev) / 864e5) === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = dt;
  }
  return best;
}

function calc(s, list) {
  const val = (e) => e.values?.[s.field];
  switch (s.type) {
    case 'count':
      return s.field ? list.filter((e) => val(e) === s.equals).length : list.length;
    case 'rate': {
      if (!list.length) return 0;
      return (list.filter((e) => val(e) === s.equals).length / list.length) * 100;
    }
    case 'sum':
      return list.reduce((a, e) => a + (Number(val(e)) || 0), 0);
    case 'avg': {
      const nums = list.map(val).filter((v) => typeof v === 'number' && v > 0);
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    }
    case 'sumDiff':
      return list.reduce((a, e) => {
        const d = (Number(e.values?.[s.to]) || 0) - (Number(e.values?.[s.from]) || 0);
        return a + (d > 0 ? d : 0);
      }, 0);
    case 'words':
      return list.reduce(
        (a, e) => a + String(val(e) || '').trim().split(/\s+/).filter(Boolean).length,
        0
      );
    default:
      return 0;
  }
}

// Turns a template's `stats` config into display-ready numbers for CountUp.
export function computeStats(template, entries) {
  if (!template) return [];
  const list = (entries || []).filter((e) => e.templateId === template.id);
  return (template.stats || []).map((s) => ({
    label: s.label,
    value: calc(s, list),
    decimals: s.decimals ?? 0,
    prefix: s.prefix ?? '',
    suffix: s.suffix ?? '',
    signed: !!s.signed,
    lead: !!s.lead,
  }));
}
