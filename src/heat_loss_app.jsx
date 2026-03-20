/**
 * Heat Loss Calculator – React Frontend
 * Supports Simplified (free) and Professional (pro) modes
 * Requires: React 18+, a running heat_loss_backend.js on PORT 5000
 */

import React, { useState, useEffect, useCallback } from 'react';
import './heat_loss_app.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DEFAULT_ROOM = {
  name: 'Living Room',
  width: 5,
  depth: 4,
  height: 2.4,
  insideTemp: 21,
  outsideTemp: 0,
  ach: 1.5,
  walls: [{ materialId: 'cavity_unins', area: 30, label: 'External Wall' }],
  windows: [{ materialId: 'double_glaz_standard', area: 3, label: 'Window' }],
  doors: [{ materialId: 'door_composite_standard', area: 2, label: 'External Door' }],
  roofs: [{ materialId: 'pitched_100mm_ins', area: 20, label: 'Roof' }],
  floors: [{ materialId: 'susp_timber_unins', area: 20, label: 'Floor' }]
};

const ELEMENT_TYPES = ['walls', 'windows', 'doors', 'roofs', 'floors'];

const ELEMENT_LABELS = {
  walls: 'Walls',
  windows: 'Windows & Glazing',
  doors: 'Doors',
  roofs: 'Roof / Ceiling',
  floors: 'Floor'
};

const ELEMENT_ICONS = {
  walls: '🧱',
  windows: '🪟',
  doors: '🚪',
  roofs: '🏠',
  floors: '⬜'
};

const TIER_CONFIG = {
  worst: { label: 'Highest Loss', color: '#e74c3c', bg: '#fdf0f0' },
  moderate: { label: 'Moderate',    color: '#f39c12', bg: '#fefaf0' },
  best:  { label: 'Most Efficient', color: '#27ae60', bg: '#f0fdf4' }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newRoom(name = '') {
  return { ...JSON.parse(JSON.stringify(DEFAULT_ROOM)), name: name || `Room ${Date.now()}` };
}

function formatCurrency(val) {
  return `£${Number(val).toFixed(2)}`;
}

function formatWatts(val) {
  if (val >= 1000) return `${(val / 1000).toFixed(2)} kW`;
  return `${Number(val).toFixed(0)} W`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Dropdown to pick a material from a category */
function MaterialSelect({ category, value, onChange, uValueData }) {
  const materials = uValueData[category] || [];
  const current = materials.find(m => m.id === value);
  return (
    <select className="hl-select" value={value} onChange={e => onChange(e.target.value)}>
      {materials.map(m => (
        <option key={m.id} value={m.id}>
          {m.label} {m.uValue !== undefined ? `(U=${m.uValue})` : ''}
        </option>
      ))}
    </select>
  );
}

/** Single building element row */
function ElementRow({ type, element, index, uValueData, mode, onChange, onRemove }) {
  const category = type;
  return (
    <div className="hl-element-row">
      <div className="hl-element-row__label">
        <input
          className="hl-input hl-input--label"
          value={element.label}
          onChange={e => onChange(index, 'label', e.target.value)}
          placeholder="Label"
        />
      </div>
      <div className="hl-element-row__material">
        <MaterialSelect
          category={category}
          value={element.materialId}
          onChange={val => onChange(index, 'materialId', val)}
          uValueData={uValueData}
        />
      </div>
      <div className="hl-element-row__area">
        <input
          type="number"
          className="hl-input hl-input--area"
          value={element.area}
          min="0.1"
          step="0.1"
          onChange={e => onChange(index, 'area', parseFloat(e.target.value) || 0)}
        />
        <span className="hl-unit">m²</span>
      </div>
      <button className="hl-btn hl-btn--icon hl-btn--remove" onClick={() => onRemove(index)}
        title="Remove element" aria-label="Remove element">
        ✕
      </button>
    </div>
  );
}

/** Collapsible section for one element type in the room form */
function ElementSection({ type, elements, uValueData, mode, onAdd, onChange, onRemove }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="hl-element-section">
      <button className="hl-element-section__header" onClick={() => setOpen(o => !o)}>
        <span>{ELEMENT_ICONS[type]} {ELEMENT_LABELS[type]}</span>
        <span className="hl-element-section__count">{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
        <span className="hl-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="hl-element-section__body">
          {elements.length === 0 && (
            <p className="hl-empty-hint">No {ELEMENT_LABELS[type].toLowerCase()} added yet.</p>
          )}
          {elements.map((el, idx) => (
            <ElementRow
              key={idx}
              type={type}
              element={el}
              index={idx}
              uValueData={uValueData}
              mode={mode}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
          <button className="hl-btn hl-btn--add-element" onClick={onAdd}>
            + Add {ELEMENT_LABELS[type].replace(' & Glazing', '').replace(/s$/, '')}
          </button>
        </div>
      )}
    </div>
  );
}

/** Form card for a single room */
function RoomForm({ room, index, uValueData, mode, onChange, onRemove }) {
  const update = useCallback((field, value) => {
    onChange(index, { ...room, [field]: value });
  }, [room, index, onChange]);

  const updateElement = useCallback((type, elemIndex, field, value) => {
    const updated = room[type].map((el, i) => i === elemIndex ? { ...el, [field]: value } : el);
    onChange(index, { ...room, [type]: updated });
  }, [room, index, onChange]);

  const addElement = useCallback((type) => {
    const defaults = {
      walls:   { materialId: 'cavity_unins', area: 10, label: 'Wall' },
      windows: { materialId: 'double_glaz_standard', area: 1.5, label: 'Window' },
      doors:   { materialId: 'door_composite_standard', area: 2, label: 'Door' },
      roofs:   { materialId: 'pitched_200mm_ins', area: room.width * room.depth, label: 'Roof' },
      floors:  { materialId: 'concrete_100mm_ins', area: room.width * room.depth, label: 'Floor' }
    };
    onChange(index, { ...room, [type]: [...room[type], defaults[type]] });
  }, [room, index, onChange]);

  const removeElement = useCallback((type, elemIndex) => {
    onChange(index, { ...room, [type]: room[type].filter((_, i) => i !== elemIndex) });
  }, [room, index, onChange]);

  return (
    <div className="hl-room-form">
      <div className="hl-room-form__header">
        <input
          className="hl-input hl-input--room-name"
          value={room.name}
          onChange={e => update('name', e.target.value)}
          placeholder="Room name"
        />
        <button className="hl-btn hl-btn--icon hl-btn--danger" onClick={() => onRemove(index)}
          title="Remove room" aria-label="Remove room">
          🗑
        </button>
      </div>

      {/* ── Dimensions ── */}
      <div className="hl-section-title">Dimensions</div>
      <div className="hl-grid hl-grid--3">
        <label className="hl-label">
          Width (m)
          <input type="number" className="hl-input" value={room.width} min="0.5" step="0.1"
            onChange={e => update('width', parseFloat(e.target.value) || 0)} />
        </label>
        <label className="hl-label">
          Depth (m)
          <input type="number" className="hl-input" value={room.depth} min="0.5" step="0.1"
            onChange={e => update('depth', parseFloat(e.target.value) || 0)} />
        </label>
        <label className="hl-label">
          Height (m)
          <input type="number" className="hl-input" value={room.height} min="1" step="0.05"
            onChange={e => update('height', parseFloat(e.target.value) || 0)} />
        </label>
      </div>
      <div className="hl-dimension-summary">
        Volume: <strong>{(room.width * room.depth * room.height).toFixed(1)} m³</strong>
        &nbsp;·&nbsp; Floor area: <strong>{(room.width * room.depth).toFixed(1)} m²</strong>
      </div>

      {/* ── Temperature & Ventilation ── */}
      <div className="hl-section-title">Temperature &amp; Ventilation</div>
      <div className="hl-grid hl-grid--3">
        <label className="hl-label">
          Inside (°C)
          <input type="number" className="hl-input" value={room.insideTemp} min="5" max="35" step="0.5"
            onChange={e => update('insideTemp', parseFloat(e.target.value) || 0)} />
        </label>
        <label className="hl-label">
          Outside (°C)
          <input type="number" className="hl-input" value={room.outsideTemp} min="-20" max="20" step="0.5"
            onChange={e => update('outsideTemp', parseFloat(e.target.value) || 0)} />
        </label>
        <label className="hl-label">
          ACH (air changes/hr)
          <input type="number" className="hl-input" value={room.ach} min="0.1" max="10" step="0.1"
            onChange={e => update('ach', parseFloat(e.target.value) || 0)} />
        </label>
      </div>
      <div className="hl-temp-delta">
        ΔT = <strong>{(room.insideTemp - room.outsideTemp).toFixed(1)} K</strong>
      </div>

      {/* ── Building Elements ── */}
      <div className="hl-section-title">Building Elements</div>
      {ELEMENT_TYPES.map(type => (
        <ElementSection
          key={type}
          type={type}
          elements={room[type]}
          uValueData={uValueData}
          mode={mode}
          onAdd={() => addElement(type)}
          onChange={(elemIdx, field, value) => updateElement(type, elemIdx, field, value)}
          onRemove={elemIdx => removeElement(type, elemIdx)}
        />
      ))}
    </div>
  );
}

// ─── Results Components ────────────────────────────────────────────────────────

/** Stat card for the headline metrics strip */
function StatCard({ label, value, sub, highlight }) {
  return (
    <div className={`hl-stat-card ${highlight ? 'hl-stat-card--highlight' : ''}`}>
      <div className="hl-stat-card__value">{value}</div>
      {sub && <div className="hl-stat-card__sub">{sub}</div>}
      <div className="hl-stat-card__label">{label}</div>
    </div>
  );
}

/** Bar showing element type breakdown */
function HeatLossBar({ elements, ventilation, total }) {
  const COLORS = {
    wall: '#e74c3c', window: '#e67e22', door: '#f1c40f',
    roof: '#3498db', floor: '#9b59b6', ventilation: '#1abc9c'
  };

  const segments = [...(elements || [])].reduce((acc, el) => {
    const existing = acc.find(a => a.type === el.type);
    if (existing) existing.loss += el.heatLoss;
    else acc.push({ type: el.type, loss: el.heatLoss });
    return acc;
  }, []);

  if (ventilation > 0) segments.push({ type: 'ventilation', loss: ventilation });

  return (
    <div className="hl-heat-bar">
      {segments.map(seg => (
        <div
          key={seg.type}
          className="hl-heat-bar__segment"
          style={{
            width: `${((seg.loss / total) * 100).toFixed(1)}%`,
            background: COLORS[seg.type] || '#95a5a6'
          }}
          title={`${seg.type}: ${seg.loss.toFixed(0)}W (${((seg.loss/total)*100).toFixed(1)}%)`}
        />
      ))}
      <div className="hl-heat-bar__legend">
        {segments.map(seg => (
          <span key={seg.type} className="hl-heat-bar__legend-item">
            <span className="hl-heat-bar__dot" style={{ background: COLORS[seg.type] || '#95a5a6' }} />
            {seg.type} {((seg.loss/total)*100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}

/** Expandable room result card */
function RoomResultCard({ roomResult, rankInfo, mode }) {
  const [expanded, setExpanded] = useState(false);
  const tier = TIER_CONFIG[rankInfo?.tier || 'moderate'];

  return (
    <div className="hl-room-result" style={{ borderLeft: `4px solid ${tier.color}`, background: tier.bg }}>
      <button className="hl-room-result__header" onClick={() => setExpanded(e => !e)}>
        <div className="hl-room-result__title">
          <span className="hl-rank-badge" style={{ background: tier.color }}>#{rankInfo?.rank}</span>
          <span className="hl-room-result__name">{roomResult.name}</span>
          <span className="hl-tier-badge" style={{ color: tier.color }}>{tier.label}</span>
        </div>
        <div className="hl-room-result__summary">
          <span className="hl-room-result__heat">{formatWatts(roomResult.totals.totalHeatLossW)}</span>
          <span className="hl-room-result__cost">{formatCurrency(roomResult.costs.annualCostGBP)}/yr</span>
          <span className="hl-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="hl-room-result__body">
          {/* Metrics grid */}
          <div className="hl-grid hl-grid--4 hl-result-grid">
            <div className="hl-result-metric">
              <span className="hl-result-metric__val">{formatWatts(roomResult.totals.totalHeatLossW)}</span>
              <span className="hl-result-metric__lbl">Total Heat Loss</span>
            </div>
            <div className="hl-result-metric">
              <span className="hl-result-metric__val">{roomResult.totals.totalHeatLossBTU.toFixed(0)}</span>
              <span className="hl-result-metric__lbl">BTU/hr</span>
            </div>
            <div className="hl-result-metric">
              <span className="hl-result-metric__val">{formatCurrency(roomResult.costs.dailyCostGBP)}</span>
              <span className="hl-result-metric__lbl">Daily Cost</span>
            </div>
            <div className="hl-result-metric">
              <span className="hl-result-metric__val">{roomResult.performance.efficiencyWperM3.toFixed(1)} W/m³</span>
              <span className="hl-result-metric__lbl">Room Efficiency</span>
            </div>
          </div>

          {/* Ventilation split */}
          <div className="hl-vent-row">
            <span>Fabric: <strong>{formatWatts(roomResult.totals.fabricHeatLossW)}</strong></span>
            <span>Ventilation: <strong>{formatWatts(roomResult.totals.ventilationHeatLossW)}</strong>
              <em> ({roomResult.totals.ventilationPercent}%)</em>
            </span>
            <span>Temp drop: <strong>{roomResult.performance.tempDropRateMinPerDegree.toFixed(1)} min/°C</strong></span>
          </div>

          {/* Heat loss bar */}
          <HeatLossBar
            elements={roomResult.elements}
            ventilation={roomResult.totals.ventilationHeatLossW}
            total={roomResult.totals.totalHeatLossW}
          />

          {/* Element table (Professional mode only) */}
          {mode === 'professional' && (
            <table className="hl-element-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Material</th>
                  <th>U-Value</th>
                  <th>Area</th>
                  <th>Heat Loss</th>
                  <th>% Fabric</th>
                </tr>
              </thead>
              <tbody>
                {roomResult.elements.map((el, idx) => (
                  <tr key={idx}>
                    <td><span className="hl-type-tag hl-type-tag--{el.type}">{ELEMENT_ICONS[el.type] || '·'} {el.type}</span></td>
                    <td>{el.materialLabel}</td>
                    <td className="hl-uval">{el.uValue}</td>
                    <td>{el.area} m²</td>
                    <td><strong>{formatWatts(el.heatLoss)}</strong></td>
                    <td>
                      <div className="hl-mini-bar">
                        <div className="hl-mini-bar__fill" style={{ width: `${el.percentOfFabric}%` }} />
                        <span>{el.percentOfFabric}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Cost breakdown */}
          <div className="hl-cost-breakdown">
            <div className="hl-cost-breakdown__item">
              <span>Daily</span><strong>{formatCurrency(roomResult.costs.dailyCostGBP)}</strong>
            </div>
            <div className="hl-cost-breakdown__item">
              <span>Monthly</span><strong>{formatCurrency(roomResult.costs.monthlyCostGBP)}</strong>
            </div>
            <div className="hl-cost-breakdown__item hl-cost-breakdown__item--annual">
              <span>Annual</span><strong>{formatCurrency(roomResult.costs.annualCostGBP)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Full results panel */
function ResultsPanel({ result, mode }) {
  const rankMap = {};
  (result.ranking || []).forEach(r => { rankMap[r.roomId] = r; });

  return (
    <div className="hl-results">
      <div className="hl-results__header">
        <h2 className="hl-results__title">
          Heat Loss Analysis
          <span className={`hl-mode-badge hl-mode-badge--${mode}`}>
            {mode === 'professional' ? '⚡ Professional' : 'Simplified'}
          </span>
        </h2>
        <div className="hl-results__id">ID: {result.calculationId?.slice(0, 8)}</div>
      </div>

      {/* ── Building Totals ── */}
      <div className="hl-totals-strip">
        <StatCard
          label="Total Heat Loss"
          value={formatWatts(result.building.totalHeatLossW)}
          sub={`${result.building.totalHeatLossKW} kW · ${result.building.totalHeatLossBTU.toFixed(0)} BTU/hr`}
          highlight
        />
        <StatCard
          label="Annual Cost"
          value={formatCurrency(result.building.annualCostGBP)}
          sub={`${formatCurrency(result.building.monthlyCostGBP)}/month`}
        />
        <StatCard
          label="Daily Cost"
          value={formatCurrency(result.building.dailyCostGBP)}
          sub="at current tariff"
        />
        <StatCard
          label="Rooms Assessed"
          value={result.building.roomCount}
        />
      </div>

      {/* ── Room Results ── */}
      <div className="hl-results__section-title">Room-by-Room Breakdown</div>
      <div className="hl-room-results-list">
        {result.rooms.map(room => (
          <RoomResultCard
            key={room.roomId}
            roomResult={room}
            rankInfo={rankMap[room.roomId]}
            mode={mode}
          />
        ))}
      </div>

      {/* ── AI Analysis (Professional) ── */}
      {mode === 'professional' && result.aiAnalysis && (
        <div className="hl-ai-analysis">
          <div className="hl-ai-analysis__header">
            <span className="hl-ai-badge">✦ AI Analysis</span>
            <span className="hl-ai-sub">Powered by Claude AI</span>
          </div>
          <div className="hl-ai-analysis__body">
            {result.aiAnalysis.split('\n').map((line, i) => {
              if (line.startsWith('###')) return <h4 key={i} className="hl-ai-h3">{line.replace(/^###\s*/, '')}</h4>;
              if (line.startsWith('##'))  return <h3 key={i} className="hl-ai-h2">{line.replace(/^##\s*/, '')}</h3>;
              if (line.startsWith('#'))   return <h2 key={i} className="hl-ai-h1">{line.replace(/^#\s*/, '')}</h2>;
              if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="hl-ai-bold">{line.replace(/\*\*/g, '')}</strong>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="hl-ai-para">{line}</p>;
            })}
          </div>
        </div>
      )}

      {/* ── Cost assumptions footer ── */}
      <div className="hl-assumptions">
        <strong>Cost Assumptions:</strong> £0.20/kWh · 10 hrs/day heating · 210 day season
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HeatLossCalculator() {
  const [mode, setMode] = useState('simplified');
  const [rooms, setRooms] = useState([{ ...JSON.parse(JSON.stringify(DEFAULT_ROOM)) }]);
  const [uValueData, setUValueData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  // Load U-value data and check API health
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(r => r.json())
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'));

    fetch(`${API_BASE}/api/u-values`)
      .then(r => r.json())
      .then(data => {
        const byCategory = {};
        (data.categories || []).forEach(cat => { byCategory[cat.category] = cat.materials; });
        setUValueData(byCategory);
      })
      .catch(err => {
        console.error('Failed to load U-values:', err);
        setError('Could not load material database. Is the backend running?');
      });
  }, []);

  const updateRoom = useCallback((index, updatedRoom) => {
    setRooms(prev => prev.map((r, i) => i === index ? updatedRoom : r));
  }, []);

  const addRoom = useCallback(() => {
    setRooms(prev => [...prev, newRoom(`Room ${prev.length + 1}`)]);
  }, []);

  const removeRoom = useCallback((index) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
  }, []);

  const calculate = useCallback(async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const resp = await fetch(`${API_BASE}/api/heat-loss/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, rooms })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${resp.status}`);
      }

      const data = await resp.json();
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document.querySelector('.hl-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, rooms]);

  return (
    <div className="hl-app">
      {/* ── Header ── */}
      <header className="hl-header">
        <div className="hl-header__inner">
          <div className="hl-logo">
            <span className="hl-logo__icon">🔥</span>
            <div>
              <div className="hl-logo__title">HeatCalc Pro</div>
              <div className="hl-logo__sub">Professional Heat Loss Calculator</div>
            </div>
          </div>
          <div className="hl-header__status">
            <span className={`hl-api-dot hl-api-dot--${apiStatus}`} />
            <span className="hl-api-label">
              {apiStatus === 'ok' ? 'API Connected' : apiStatus === 'error' ? 'API Offline' : 'Connecting…'}
            </span>
          </div>
        </div>
      </header>

      <main className="hl-main">
        {/* ── Mode Selector ── */}
        <section className="hl-mode-section">
          <h2 className="hl-section-title hl-section-title--large">Select Calculation Mode</h2>
          <div className="hl-mode-cards">
            {['simplified', 'professional'].map(m => (
              <label key={m} className={`hl-mode-card ${mode === m ? 'hl-mode-card--active' : ''}`}>
                <input type="radio" name="mode" value={m} checked={mode === m}
                  onChange={() => setMode(m)} className="hl-mode-radio" />
                <div className="hl-mode-card__inner">
                  <div className="hl-mode-card__icon">{m === 'simplified' ? '📊' : '⚡'}</div>
                  <div className="hl-mode-card__name">
                    {m === 'simplified' ? 'Simplified' : 'Professional'}
                    {m === 'simplified'
                      ? <span className="hl-free-badge">FREE</span>
                      : <span className="hl-pro-badge">PRO</span>}
                  </div>
                  <div className="hl-mode-card__desc">
                    {m === 'simplified'
                      ? 'Basic heat loss calculation with simple material selection. Ideal for quick estimates.'
                      : 'Full element breakdown, U-value display, sensitivity analysis, and Claude AI professional report.'}
                  </div>
                  <ul className="hl-mode-card__features">
                    {m === 'simplified' ? (
                      <>
                        <li>✓ Q = U × A × ΔT calculation</li>
                        <li>✓ 50+ materials database</li>
                        <li>✓ Annual cost estimate</li>
                        <li>✓ Multi-room support</li>
                      </>
                    ) : (
                      <>
                        <li>✓ All Simplified features</li>
                        <li>✓ U-value breakdown table</li>
                        <li>✓ Temperature drop rate</li>
                        <li>✓ Claude AI analysis &amp; recommendations</li>
                      </>
                    )}
                  </ul>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* ── Room Forms ── */}
        <section className="hl-rooms-section">
          <div className="hl-rooms-section__header">
            <h2 className="hl-section-title hl-section-title--large">Room Configuration</h2>
            <button className="hl-btn hl-btn--add-room" onClick={addRoom}>
              + Add Room
            </button>
          </div>

          {rooms.length === 0 && (
            <div className="hl-empty-rooms">
              <p>No rooms added. Click <strong>+ Add Room</strong> to get started.</p>
            </div>
          )}

          <div className="hl-rooms-grid">
            {rooms.map((room, idx) => (
              <RoomForm
                key={idx}
                room={room}
                index={idx}
                uValueData={uValueData}
                mode={mode}
                onChange={updateRoom}
                onRemove={removeRoom}
              />
            ))}
          </div>
        </section>

        {/* ── Calculate Button ── */}
        <div className="hl-calculate-row">
          {error && <div className="hl-error-banner">{error}</div>}
          <button
            className={`hl-btn hl-btn--calculate ${mode === 'professional' ? 'hl-btn--pro' : ''}`}
            onClick={calculate}
            disabled={loading || rooms.length === 0 || apiStatus === 'error'}
          >
            {loading
              ? <><span className="hl-spinner" /> Calculating{mode === 'professional' ? ' & Analysing with AI' : ''}…</>
              : <>🔥 Calculate Heat Loss {mode === 'professional' ? '(Professional)' : ''}</>
            }
          </button>
        </div>

        {/* ── Results ── */}
        {result && <ResultsPanel result={result} mode={mode} />}
      </main>

      <footer className="hl-footer">
        <p>Heat Loss Calculator · Q = U × A × ΔT · Based on CIBSE Guide A &amp; Building Regulations Part L</p>
        <p className="hl-footer__disclaimer">
          Results are indicative estimates. Consult a qualified energy assessor for regulated works.
        </p>
      </footer>
    </div>
  );
}
