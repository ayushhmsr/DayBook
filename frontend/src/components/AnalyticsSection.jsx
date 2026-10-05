import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { formatNice } from '../utils/dates.js';

export default function AnalyticsSection({ template, entries = [] }) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('30d'); // '7d' | '30d' | '90d' | 'all'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter entries according to timeRange
  const filteredEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    if (timeRange === 'all') return [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    return entries
      .filter((e) => e.date >= cutoffStr)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [entries, timeRange]);

  if (!entries || entries.length === 0) {
    return (
      <section className="dash__panel analytics-panel">
        <div className="analytics-header">
          <div>
            <h3 className="dash__h display">{t('analytics.title')}</h3>
            <p className="analytics-sub">{t('analytics.subtitle')}</p>
          </div>
        </div>
        <div className="analytics-empty">
          <span>📊</span>
          <p>{t('analytics.noData')}</p>
        </div>
      </section>
    );
  }

  // --- TRADER DATA PROCESSING ---
  const traderData = useMemo(() => {
    if (template.id !== 'trader') return null;
    let runningPnl = 0;
    const pnlPoints = filteredEntries.map((e) => {
      const pnl = Number(e.values?.pnl) || 0;
      runningPnl += pnl;
      return {
        date: e.date,
        pnl,
        cumulative: runningPnl,
        setup: e.values?.setup || 'Other',
        result: e.values?.result || 'Breakeven',
        instrument: e.values?.instrument || 'Trade',
      };
    });

    // Setups breakdown
    const setupsMap = {};
    filteredEntries.forEach((e) => {
      const s = e.values?.setup || 'General';
      if (!setupsMap[s]) setupsMap[s] = { count: 0, wins: 0, totalPnl: 0 };
      setupsMap[s].count += 1;
      if (e.values?.result === 'Win') setupsMap[s].wins += 1;
      setupsMap[s].totalPnl += Number(e.values?.pnl) || 0;
    });

    const setups = Object.entries(setupsMap).map(([name, data]) => ({
      name,
      count: data.count,
      winRate: Math.round((data.wins / data.count) * 100),
      totalPnl: data.totalPnl,
    }));

    // Plan discipline
    const planned = filteredEntries.filter((e) => e.values?.followedPlan === true);
    const unplanned = filteredEntries.filter((e) => e.values?.followedPlan === false);
    const plannedPnl = planned.reduce((acc, e) => acc + (Number(e.values?.pnl) || 0), 0);
    const unplannedPnl = unplanned.reduce((acc, e) => acc + (Number(e.values?.pnl) || 0), 0);

    return { pnlPoints, runningPnl, setups, plannedPnl, unplannedPnl, plannedCount: planned.length };
  }, [template.id, filteredEntries]);

  // --- DEVELOPER DATA PROCESSING ---
  const devData = useMemo(() => {
    if (template.id !== 'developer') return null;
    let totalHours = 0;
    const daysMap = {};
    const typeMap = {};

    filteredEntries.forEach((e) => {
      const h = Number(e.values?.hours) || 0;
      totalHours += h;
      daysMap[e.date] = (daysMap[e.date] || 0) + h;

      const type = e.values?.type || 'Other';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const hourPoints = Object.entries(daysMap).map(([date, hours]) => ({ date, hours }));
    const types = Object.entries(typeMap).map(([type, count]) => ({
      type,
      count,
      pct: Math.round((count / filteredEntries.length) * 100),
    }));

    return { totalHours, hourPoints, types };
  }, [template.id, filteredEntries]);

  // --- DRIVER DATA PROCESSING ---
  const driverData = useMemo(() => {
    if (template.id !== 'driver') return null;
    let totalKm = 0;
    let totalFuel = 0;
    let totalDriveHours = 0;

    const trips = filteredEntries.map((e) => {
      const odoStart = Number(e.values?.odoStart) || 0;
      const odoEnd = Number(e.values?.odoEnd) || 0;
      const km = odoEnd > odoStart ? odoEnd - odoStart : 0;
      const fuel = Number(e.values?.fuel) || 0;
      const driveHours = Number(e.values?.driveHours) || 0;

      totalKm += km;
      totalFuel += fuel;
      totalDriveHours += driveHours;

      return { date: e.date, km, fuel, driveHours, from: e.values?.from, to: e.values?.to };
    });

    return { totalKm, totalFuel, totalDriveHours, trips };
  }, [template.id, filteredEntries]);

  // --- GENERIC / EVERYDAY DATA PROCESSING ---
  const genericData = useMemo(() => {
    if (template.id !== 'generic') return null;
    let totalWords = 0;
    const moodPoints = filteredEntries.map((e) => {
      const mood = Number(e.values?.mood) || 3;
      const words = (e.values?.body || '').trim().split(/\s+/).filter(Boolean).length;
      totalWords += words;
      return { date: e.date, mood, words, title: e.values?.title || 'Entry' };
    });

    return { totalWords, moodPoints };
  }, [template.id, filteredEntries]);

  // SVG Chart Dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const padX = 50;
  const padY = 30;

  return (
    <section className="dash__panel analytics-panel">
      <div className="analytics-header">
        <div>
          <h3 className="dash__h display">{t('analytics.title')}</h3>
          <p className="analytics-sub">{t('analytics.subtitle')}</p>
        </div>
        <div className="analytics-time-tabs" role="tablist">
          {['7d', '30d', '90d', 'all'].map((r) => (
            <button
              key={r}
              type="button"
              className={`tab tab--time${timeRange === r ? ' is-active' : ''}`}
              onClick={() => setTimeRange(r)}
            >
              {r === '7d' ? t('analytics.7d') : r === '30d' ? t('analytics.30d') : r === '90d' ? t('analytics.90d') : t('analytics.all')}
            </button>
          ))}
        </div>
      </div>

      {/* --- TRADER CHARTS --- */}
      {traderData && (
        <div className="analytics-content">
          <div className="analytics-chart-box">
            <div className="analytics-chart-head">
              <span className="analytics-chart-title">{t('analytics.pnlGrowth')}</span>
              <span className={`analytics-chart-badge ${traderData.runningPnl >= 0 ? 'is-green' : 'is-red'}`}>
                {traderData.runningPnl >= 0 ? `+₹${traderData.runningPnl.toLocaleString('en-IN')}` : `-₹${Math.abs(traderData.runningPnl).toLocaleString('en-IN')}`}
              </span>
            </div>

            {traderData.pnlPoints.length > 0 ? (
              <div className="analytics-svg-wrap">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="analytics-svg" aria-label="PnL Trend Chart">
                  {(() => {
                    const pts = traderData.pnlPoints;
                    const vals = pts.map((p) => p.cumulative);
                    const minVal = Math.min(0, ...vals);
                    const maxVal = Math.max(0, ...vals);
                    const range = maxVal - minVal || 1;

                    const getX = (idx) => padX + (idx / Math.max(1, pts.length - 1)) * (svgWidth - padX * 2);
                    const getY = (val) => svgHeight - padY - ((val - minVal) / range) * (svgHeight - padY * 2);
                    const zeroY = getY(0);

                    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.cumulative)}`).join(' ');
                    const areaPath = `${linePath} L ${getX(pts.length - 1)} ${zeroY} L ${getX(0)} ${zeroY} Z`;

                    return (
                      <>
                        {/* Grid lines */}
                        <line x1={padX} y1={zeroY} x2={svgWidth - padX} y2={zeroY} stroke="#10252d" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.35" />
                        <text x={padX - 8} y={zeroY + 4} textAnchor="end" fontSize="11" fill="#4a5f66" fontWeight="600">₹0</text>
                        <text x={padX - 8} y={getY(maxVal) + 4} textAnchor="end" fontSize="11" fill="#2e7d32" fontWeight="700">₹{Math.round(maxVal)}</text>
                        {minVal < 0 && (
                          <text x={padX - 8} y={getY(minVal) + 4} textAnchor="end" fontSize="11" fill="#c62828" fontWeight="700">₹{Math.round(minVal)}</text>
                        )}

                        {/* Area & Line */}
                        <path d={areaPath} fill={traderData.runningPnl >= 0 ? 'rgba(46, 125, 50, 0.14)' : 'rgba(198, 40, 40, 0.14)'} />
                        <path d={linePath} fill="none" stroke={traderData.runningPnl >= 0 ? '#2e7d32' : '#c62828'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Data Dots */}
                        {pts.map((p, i) => {
                          const cx = getX(i);
                          const cy = getY(p.cumulative);
                          const isHov = hoveredPoint?.index === i;
                          return (
                            <g key={i} onMouseEnter={() => setHoveredPoint({ ...p, index: i, cx, cy })} onMouseLeave={() => setHoveredPoint(null)}>
                              <circle cx={cx} cy={cy} r={isHov ? 6 : 4} fill={p.pnl >= 0 ? '#2e7d32' : '#c62828'} stroke="#fff" strokeWidth="2" cursor="pointer" />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                {hoveredPoint && (
                  <div className="analytics-tooltip" style={{ left: `${(hoveredPoint.cx / svgWidth) * 100}%`, top: `${(hoveredPoint.cy / svgHeight) * 100}%` }}>
                    <strong>{hoveredPoint.instrument} ({hoveredPoint.setup})</strong>
                    <span>Date: {hoveredPoint.date}</span>
                    <span style={{ color: hoveredPoint.pnl >= 0 ? '#2e7d32' : '#c62828', fontWeight: 700 }}>
                      Trade P&L: {hoveredPoint.pnl >= 0 ? `+₹${hoveredPoint.pnl}` : `-₹${Math.abs(hoveredPoint.pnl)}`}
                    </span>
                    <span>Cumulative: ₹{hoveredPoint.cumulative}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Setups Breakdown Table */}
          {traderData.setups.length > 0 && (
            <div className="analytics-breakdown-grid">
              <div className="analytics-card-item">
                <span className="analytics-metric-title">Top Setups & Win Rates</span>
                <div className="analytics-setups-list">
                  {traderData.setups.map((s) => (
                    <div key={s.name} className="analytics-setup-row">
                      <div className="analytics-setup-name">
                        <strong>{s.name}</strong>
                        <span>{s.count} trades ({s.winRate}% Win)</span>
                      </div>
                      <div className="analytics-setup-bar-wrap">
                        <div className="analytics-setup-bar" style={{ width: `${s.winRate}%`, background: s.winRate >= 50 ? '#2e7d32' : '#c62828' }} />
                      </div>
                      <span className={`analytics-setup-pnl ${s.totalPnl >= 0 ? 'is-green' : 'is-red'}`}>
                        {s.totalPnl >= 0 ? `+₹${s.totalPnl}` : `-₹${Math.abs(s.totalPnl)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card-item">
                <span className="analytics-metric-title">Trading Discipline Impact</span>
                <div className="analytics-discipline-box">
                  <div className="analytics-disc-stat">
                    <span>Followed Plan P&L</span>
                    <strong style={{ color: traderData.plannedPnl >= 0 ? '#2e7d32' : '#c62828' }}>
                      {traderData.plannedPnl >= 0 ? `+₹${traderData.plannedPnl}` : `-₹${Math.abs(traderData.plannedPnl)}`}
                    </strong>
                  </div>
                  <div className="analytics-disc-stat">
                    <span>Unplanned / Impulse P&L</span>
                    <strong style={{ color: traderData.unplannedPnl >= 0 ? '#2e7d32' : '#c62828' }}>
                      {traderData.unplannedPnl >= 0 ? `+₹${traderData.unplannedPnl}` : `-₹${Math.abs(traderData.unplannedPnl)}`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- DEVELOPER CHARTS --- */}
      {devData && (
        <div className="analytics-content">
          <div className="analytics-chart-box">
            <div className="analytics-chart-head">
              <span className="analytics-chart-title">{t('analytics.hoursTrend')}</span>
              <span className="analytics-chart-badge is-gold">{devData.totalHours} Total Hours</span>
            </div>
            {devData.hourPoints.length > 0 && (
              <div className="analytics-bar-chart">
                {devData.hourPoints.map((p, i) => {
                  const maxH = Math.max(8, ...devData.hourPoints.map((x) => x.hours));
                  const pct = Math.min(100, Math.round((p.hours / maxH) * 100));
                  return (
                    <div key={i} className="analytics-bar-col" title={`${p.date}: ${p.hours} hours`}>
                      <span className="analytics-bar-val">{p.hours}h</span>
                      <div className="analytics-bar-fill" style={{ height: `${pct}%`, background: '#2B4BDB' }} />
                      <span className="analytics-bar-lbl">{p.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="analytics-card-item" style={{ marginTop: '16px' }}>
            <span className="analytics-metric-title">Work Distribution</span>
            <div className="analytics-chips-dist">
              {devData.types.map((t) => (
                <div key={t.type} className="analytics-dist-item">
                  <span className="analytics-dist-type">{t.type}</span>
                  <div className="analytics-dist-bar-wrap">
                    <div className="analytics-dist-bar" style={{ width: `${t.pct}%`, background: '#ffd84d' }} />
                  </div>
                  <span className="analytics-dist-count">{t.count} ({t.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- DRIVER CHARTS --- */}
      {driverData && (
        <div className="analytics-content">
          <div className="analytics-chart-box">
            <div className="analytics-chart-head">
              <span className="analytics-chart-title">{t('analytics.mileageTrend')}</span>
              <span className="analytics-chart-badge is-gold">{driverData.totalKm.toLocaleString()} km Total</span>
            </div>
            <div className="analytics-bar-chart">
              {driverData.trips.map((p, i) => {
                const maxKm = Math.max(300, ...driverData.trips.map((x) => x.km));
                const pct = Math.min(100, Math.round((p.km / maxKm) * 100));
                return (
                  <div key={i} className="analytics-bar-col" title={`${p.from} -> ${p.to}: ${p.km} km (${p.driveHours}h)`}>
                    <span className="analytics-bar-val">{p.km}km</span>
                    <div className="analytics-bar-fill" style={{ height: `${pct}%`, background: '#F0A12A' }} />
                    <span className="analytics-bar-lbl">{p.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- EVERYDAY / GENERIC CHARTS --- */}
      {genericData && (
        <div className="analytics-content">
          <div className="analytics-chart-box">
            <div className="analytics-chart-head">
              <span className="analytics-chart-title">{t('analytics.moodTrend')}</span>
              <span className="analytics-chart-badge is-gold">{genericData.totalWords.toLocaleString()} Words Written</span>
            </div>
            <div className="analytics-bar-chart">
              {genericData.moodPoints.map((p, i) => {
                const pct = Math.round((p.mood / 5) * 100);
                return (
                  <div key={i} className="analytics-bar-col" title={`${p.date}: ${p.title} (Mood: ${p.mood}/5)`}>
                    <span className="analytics-bar-val">{p.mood}/5</span>
                    <div className="analytics-bar-fill" style={{ height: `${pct}%`, background: '#B9CBC1' }} />
                    <span className="analytics-bar-lbl">{p.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
