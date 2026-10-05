// Each template is a schema. The form, the entry list and the stats are all
// rendered from this file, so adding a profession means adding one object here.
//
// Field types: text | number | textarea | select | rating | toggle | date
// Selects with 4 or fewer options render as chips.

const money = (n) => `${n >= 0 ? '+' : '-'}₹${Math.abs(n).toLocaleString('en-IN')}`;

export const TEMPLATES = [
  {
    id: 'trader',
    name: 'Trader',
    tagline: 'Setups, results, mistakes',
    description:
      'Log the setup, the result and the mistake while it is fresh. Win rate, net P&L and plan discipline update on their own.',
    prompt: 'What did you take, how did it end, and did you stick to the plan?',
    cover: '#0F2A33',
    coverInk: '#FFD84D',
    accent: '#FFD84D',
    fields: [
      { key: 'instrument', label: 'Instrument', type: 'text', required: true, placeholder: 'NIFTY 50, BTC/USDT, RELIANCE', half: true },
      { key: 'side', label: 'Side', type: 'select', options: ['Long', 'Short'], required: true, half: true },
      { key: 'setup', label: 'Setup', type: 'combo', options: ['Breakout', 'Pullback', 'Reversal', 'Range', 'News', 'VWAP', 'ORB', 'FVG'], placeholder: 'Pick preset or type custom setup…', half: true },
      { key: 'result', label: 'Result', type: 'select', options: ['Win', 'Loss', 'Breakeven'], required: true, half: true },
      { key: 'entry', label: 'Entry price', type: 'number', half: true },
      { key: 'exit', label: 'Exit price', type: 'number', half: true },
      { key: 'pnl', label: 'Net P&L', type: 'number', unit: '₹', required: true, half: true, help: 'Use a minus sign for a loss.' },
      { key: 'confidence', label: 'Confidence before entry', type: 'rating', half: true },
      { key: 'followedPlan', label: 'Followed my plan', type: 'toggle' },
      { key: 'chartImage', label: 'Chart screenshot / Trade proof', type: 'image', help: 'Upload your TradingView or broker chart snapshot' },
      { key: 'mistake', label: 'Mistake, if any', type: 'textarea', placeholder: 'Entered early, moved the stop, sized up…' },
      { key: 'lesson', label: 'Lesson for the next trade', type: 'textarea' },
    ],
    preview: [
      ['Instrument', 'NIFTY 50'],
      ['Side', 'Long'],
      ['Setup', 'Pullback'],
      ['Net P&L', '+₹1,840'],
      ['Followed my plan', 'Yes'],
      ['Chart', 'Attached 📷'],
    ],
    stats: [
      { label: 'Trades', type: 'count' },
      { label: 'Win rate', type: 'rate', field: 'result', equals: 'Win', suffix: '%', lead: true },
      { label: 'Net P&L', type: 'sum', field: 'pnl', prefix: '₹', signed: true },
      { label: 'Followed plan', type: 'rate', field: 'followedPlan', equals: true, suffix: '%' },
    ],
    summarize: (v) => ({
      title: v.instrument || 'Trade',
      meta: [v.side, v.result, v.pnl != null ? money(v.pnl) : null, v.chartImage ? '📷 Chart' : null].filter(Boolean),
    }),
  },
  {
    id: 'developer',
    name: 'Developer',
    tagline: 'Shipped, blocked, next',
    description:
      'A daily work log that doubles as your standup and weekly review: what shipped, what blocked you, what is next.',
    prompt: 'What did you ship today, and what is in your way?',
    cover: '#2B4BDB',
    coverInk: '#FFFFFF',
    accent: '#9DB0FF',
    fields: [
      { key: 'project', label: 'Project', type: 'text', required: true, placeholder: 'Checkout flow', half: true },
      { key: 'type', label: 'Type of work', type: 'select', options: ['Feature', 'Bug fix', 'Code review', 'Learning', 'Refactor', 'Meeting'], required: true, half: true },
      { key: 'hours', label: 'Hours', type: 'number', unit: 'h', required: true, half: true },
      { key: 'focus', label: 'Focus level', type: 'rating', half: true },
      { key: 'shipped', label: 'What I shipped', type: 'textarea', required: true, placeholder: 'Merged the cart summary, fixed the Safari scroll bug…' },
      { key: 'screenshot', label: 'Screenshot / Architecture diagram / PR preview', type: 'image', help: 'Attach a UI screenshot, terminal output or diagram' },
      { key: 'blockers', label: 'Blockers', type: 'textarea' },
      { key: 'tomorrow', label: 'Plan for tomorrow', type: 'textarea' },
    ],
    preview: [
      ['Project', 'Checkout flow'],
      ['Type of work', 'Feature'],
      ['Hours', '5.5 h'],
      ['Focus level', '4 of 5'],
      ['Shipped', 'Cart summary merged'],
      ['Blockers', 'Waiting on API schema'],
    ],
    stats: [
      { label: 'Entries', type: 'count' },
      { label: 'Hours logged', type: 'sum', field: 'hours', suffix: ' h', decimals: 1, lead: true },
      { label: 'Average focus', type: 'avg', field: 'focus', suffix: '/5', decimals: 1 },
      { label: 'Bug fixes', type: 'count', field: 'type', equals: 'Bug fix' },
    ],
    summarize: (v) => ({
      title: v.project || 'Work log',
      meta: [v.type, v.hours != null ? `${v.hours} h` : null, v.focus ? `focus ${v.focus}/5` : null, v.screenshot ? '📷 Screen' : null].filter(Boolean),
    }),
  },
  {
    id: 'driver',
    name: 'Truck driver',
    tagline: 'Route, odometer, rest',
    description:
      'A personal trip log: route, odometer, drive and rest hours, fuel and anything that went wrong on the road.',
    notice: 'This is your own record. It does not replace a legally required ELD or duty log.',
    prompt: 'Where did you go, how far, and how was the road?',
    cover: '#F0A12A',
    coverInk: '#10252D',
    accent: '#F0A12A',
    fields: [
      { key: 'from', label: 'From', type: 'text', required: true, placeholder: 'Pune', half: true },
      { key: 'to', label: 'To', type: 'text', required: true, placeholder: 'Nagpur', half: true },
      { key: 'odoStart', label: 'Odometer at start', type: 'number', unit: 'km', required: true, half: true },
      { key: 'odoEnd', label: 'Odometer at end', type: 'number', unit: 'km', required: true, half: true },
      { key: 'driveHours', label: 'Driving time', type: 'number', unit: 'h', half: true },
      { key: 'restHours', label: 'Rest time', type: 'number', unit: 'h', half: true },
      { key: 'fuel', label: 'Fuel filled', type: 'number', unit: 'L', half: true },
      { key: 'cargo', label: 'Cargo', type: 'text', half: true },
      { key: 'preTrip', label: 'Pre-trip vehicle check done', type: 'toggle' },
      { key: 'receiptImage', label: 'Trip photo / Fuel slip / Toll receipt', type: 'image', help: 'Upload fuel bill, delivery challan or trip photo' },
      { key: 'issues', label: 'Issues on the road', type: 'textarea', placeholder: 'Tyre pressure, long queue at the toll, diversion…' },
    ],
    validate: (v) => {
      const a = Number(v.odoStart);
      const b = Number(v.odoEnd);
      if (v.odoStart !== '' && v.odoEnd !== '' && b < a) {
        return { odoEnd: 'End reading must be higher than the start reading' };
      }
      return {};
    },
    preview: [
      ['Route', 'Pune to Nagpur'],
      ['Odometer', '182,440 to 183,115 km'],
      ['Driving time', '9.5 h'],
      ['Rest time', '3 h'],
      ['Fuel filled', '140 L'],
      ['Pre-trip check', 'Done'],
    ],
    stats: [
      { label: 'Trips', type: 'count' },
      { label: 'Distance driven', type: 'sumDiff', from: 'odoStart', to: 'odoEnd', suffix: ' km', lead: true },
      { label: 'Driving hours', type: 'sum', field: 'driveHours', suffix: ' h', decimals: 1 },
      { label: 'Fuel filled', type: 'sum', field: 'fuel', suffix: ' L' },
    ],
    summarize: (v) => {
      const km = v.odoEnd != null && v.odoStart != null ? v.odoEnd - v.odoStart : null;
      return {
        title: `${v.from || '?'} to ${v.to || '?'}`,
        meta: [km != null ? `${km} km` : null, v.driveHours != null ? `${v.driveHours} h driving` : null, v.receiptImage ? '📷 Receipt' : null].filter(Boolean),
      };
    },
  },
  {
    id: 'generic',
    name: 'Everyday',
    tagline: 'Title, mood, free writing',
    description: 'For anything else. A title, a mood and room to write.',
    prompt: 'What is on your mind today?',
    cover: '#B9CBC1',
    coverInk: '#10252D',
    accent: '#B9CBC1',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'A slow Sunday' },
      { key: 'mood', label: 'Mood', type: 'rating', half: true },
      { key: 'tags', label: 'Tags', type: 'text', placeholder: 'family, health, ideas', half: true },
      { key: 'photo', label: 'Photo of the day / Snapshot', type: 'image', help: 'Attach a memory, snapshot or drawing' },
      { key: 'body', label: 'Entry', type: 'textarea', rows: 8, required: true },
    ],
    preview: [
      ['Title', 'A slow Sunday'],
      ['Mood', '4 of 5'],
      ['Tags', 'family, ideas'],
      ['Entry', 'Finally cleared the backlog…'],
    ],
    stats: [
      { label: 'Entries', type: 'count', lead: true },
      { label: 'Average mood', type: 'avg', field: 'mood', suffix: '/5', decimals: 1 },
      { label: 'Words written', type: 'words', field: 'body' },
    ],
    summarize: (v) => ({
      title: v.title || 'Entry',
      meta: [v.mood ? `mood ${v.mood}/5` : null, v.tags || null, v.photo ? '📷 Photo' : null].filter(Boolean),
    }),
  },
];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id);
