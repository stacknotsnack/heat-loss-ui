/**
 * Axis Radiator Calculator – React Component
 * Integrates with the Heat Loss Calculator to recommend correctly sized radiators.
 */

import React, { useState, useCallback } from 'react';
import { calculateRadiatorSelection, WATER_TEMP_PARTS } from './axis_radiator_calculator';
import EngineerAvatar from './EngineerAvatar';
import './axis_radiator_styles.css';

// ─── Compliance Badge ─────────────────────────────────────────────────────────
function ComplianceBadge({ status }) {
  const config = {
    PASS:  { label: '✓ PASS',  cls: 'ax-badge ax-badge--pass' },
    CHECK: { label: '⚠ CHECK', cls: 'ax-badge ax-badge--check' },
    FAIL:  { label: '✗ FAIL',  cls: 'ax-badge ax-badge--fail' }
  };
  const c = config[status] || config.FAIL;
  return <span className={c.cls}>{c.label}</span>;
}

// ─── Radiator Card ────────────────────────────────────────────────────────────
function RadiatorCard({ radiator, heatLossW, isRecommended }) {
  if (!radiator) return null;
  const borderClass = {
    PASS:  'ax-card--pass',
    CHECK: 'ax-card--check',
    FAIL:  'ax-card--fail'
  }[radiator.compliance] || '';

  return (
    <div className={`ax-radiator-card ${borderClass} ${isRecommended ? 'ax-radiator-card--recommended' : ''}`}>
      {isRecommended && <div className="ax-recommended-tag">Recommended</div>}
      <div className="ax-card-header">
        <div className="ax-card-model">
          {radiator.model === 'PP' ? 'P+' : radiator.model}
          <span className="ax-card-model-desc"> — {radiator.description}</span>
        </div>
        <ComplianceBadge status={radiator.compliance} />
      </div>
      <div className="ax-card-dims">H{radiator.height} × L{radiator.length}mm · {radiator.sections} sections</div>
      <div className="ax-card-type">Type {radiator.type}</div>

      <div className="ax-card-outputs">
        <div className="ax-output-row">
          <span className="ax-output-label">Rated Output (ΔT50)</span>
          <span className="ax-output-value">{radiator.wattsAt50}W / {radiator.btuAt50} BTU</span>
        </div>
        <div className="ax-output-row ax-output-row--revised">
          <span className="ax-output-label">Revised Output (actual ΔT)</span>
          <span className="ax-output-value ax-output-value--main">{radiator.revisedOutput}W / {radiator.revisedBTU} BTU</span>
        </div>
        <div className="ax-output-row">
          <span className="ax-output-label">Room Heat Loss</span>
          <span className="ax-output-value">{heatLossW}W</span>
        </div>
        <div className="ax-output-row">
          <span className="ax-output-label">Margin</span>
          <span className={`ax-output-value ${radiator.deficit >= 0 ? 'ax-positive' : 'ax-negative'}`}>
            {radiator.deficit >= 0 ? '+' : ''}{radiator.deficit}W ({radiator.oversizingPct}%)
          </span>
        </div>
      </div>

      {radiator.compliance === 'CHECK' && (
        <div className="ax-compliance-note">
          ⚠ Exceeds Part L +15% oversizing limit. Consider a smaller model.
        </div>
      )}
      {radiator.compliance === 'FAIL' && (
        <div className="ax-compliance-note ax-compliance-note--fail">
          ✗ Output insufficient for heat loss requirement.
        </div>
      )}
    </div>
  );
}

// ─── Calculation Steps ────────────────────────────────────────────────────────
function CalcSteps({ steps, correctionFactor, exponentN }) {
  return (
    <div className="ax-steps">
      <div className="ax-steps-title">Step-by-Step Calculation</div>
      {steps.map((step, idx) => (
        <div className="ax-step" key={idx}>
          <div className="ax-step-number">{idx + 1}</div>
          <div className="ax-step-content">
            <div className="ax-step-label">{step.label}</div>
            <code className="ax-step-formula">{step.formula} = <strong>{step.result}</strong></code>
          </div>
        </div>
      ))}
      <div className="ax-cf-highlight">
        <div className="ax-cf-label">Correction Factor (BS EN 442, n = {exponentN})</div>
        <div className="ax-cf-value">{correctionFactor.toFixed(3)}</div>
        <div className="ax-cf-sub">Corrected Output = Base ΔT50 × CF</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AxisRadiatorCalculator({ prefillHeatLoss, prefillRoomTemp }) {
  const [heatLoss, setHeatLoss]     = useState(prefillHeatLoss || '');
  const [roomTemp, setRoomTemp]     = useState(prefillRoomTemp || 21);
  const [waterPart, setWaterPart]   = useState('L');
  const [maxLength, setMaxLength]   = useState('');
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  const calculate = useCallback(() => {
    setError('');
    setResult(null);
    try {
      const res = calculateRadiatorSelection(
        parseFloat(heatLoss),
        parseFloat(roomTemp),
        waterPart,
        maxLength ? parseFloat(maxLength) : null
      );
      setResult(res);
      setTimeout(() => document.querySelector('.ax-results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.message);
    }
  }, [heatLoss, roomTemp, waterPart, maxLength]);

  const part = WATER_TEMP_PARTS[waterPart];

  return (
    <div className="ax-app">
      {/* ── Header ── */}
      <div className="ax-header">
        <div className="ax-header-inner">
          <div className="ax-logo">
            <EngineerAvatar size="xl" style={{ border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
            <div>
              <div className="ax-logo-title">Radiator Selector</div>
              <div className="ax-logo-sub">Speed Compact · Plus · Double · Triple</div>
            </div>
          </div>
          <div className="ax-header-formula">Q = U × A × ΔT → CF = ΔT<sub>actual</sub> / 50</div>
        </div>
      </div>

      <div className="ax-body">
        {/* ── Input Form ── */}
        <div className="ax-form-card">
          <div className="ax-form-title">Radiator Selection Inputs</div>

          <div className="ax-form-grid">
            {/* Heat Loss */}
            <label className="ax-label">
              Room Heat Loss (W)
              <div className="ax-input-wrap">
                <input
                  type="number"
                  className="ax-input"
                  value={heatLoss}
                  min="50"
                  step="10"
                  placeholder="e.g. 1000"
                  onChange={e => setHeatLoss(e.target.value)}
                />
                <span className="ax-input-unit">W</span>
              </div>
              {heatLoss && <span className="ax-input-sub">{Math.round(parseFloat(heatLoss) * 3.412)} BTU/hr</span>}
            </label>

            {/* Room Temp */}
            <label className="ax-label">
              Design Room Temperature (°C)
              <div className="ax-input-wrap">
                <input
                  type="number"
                  className="ax-input"
                  value={roomTemp}
                  min="0"
                  max="35"
                  step="0.5"
                  onChange={e => setRoomTemp(e.target.value)}
                />
                <span className="ax-input-unit">°C</span>
              </div>
            </label>

            {/* Max Wall Length */}
            <label className="ax-label">
              Max Wall Length (mm) <span className="ax-label-opt">optional</span>
              <div className="ax-input-wrap">
                <input
                  type="number"
                  className="ax-input"
                  value={maxLength}
                  min="300"
                  max="3000"
                  step="100"
                  placeholder="e.g. 1200"
                  onChange={e => setMaxLength(e.target.value)}
                />
                <span className="ax-input-unit">mm</span>
              </div>
              {maxLength && <span className="ax-input-sub">Only radiators ≤ {maxLength}mm wide shown</span>}
            </label>

            {/* Water Part */}
            <label className="ax-label ax-label--full">
              Water Temperature Part
              <select className="ax-select" value={waterPart} onChange={e => setWaterPart(e.target.value)}>
                {Object.entries(WATER_TEMP_PARTS).map(([key, val]) => (
                  <option key={key} value={key}>
                    Part {key} — Flow {val.flow}°C / Return {val.return}°C — {val.description}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Water temp preview */}
          <div className="ax-temp-preview">
            <div className="ax-temp-chip ax-temp-chip--flow">
              <span className="ax-chip-label">Flow</span>
              <span className="ax-chip-val">{part.flow}°C</span>
            </div>
            <div className="ax-temp-arrow">→</div>
            <div className="ax-temp-chip ax-temp-chip--mean">
              <span className="ax-chip-label">Mean</span>
              <span className="ax-chip-val">{(part.flow + part.return) / 2}°C</span>
            </div>
            <div className="ax-temp-arrow">→</div>
            <div className="ax-temp-chip ax-temp-chip--return">
              <span className="ax-chip-label">Return</span>
              <span className="ax-chip-val">{part.return}°C</span>
            </div>
            {roomTemp && (
              <>
                <div className="ax-temp-arrow">·</div>
                <div className="ax-temp-chip ax-temp-chip--dt">
                  <span className="ax-chip-label">ΔT</span>
                  <span className="ax-chip-val">
                    {((part.flow + part.return) / 2 - parseFloat(roomTemp)).toFixed(1)} K
                  </span>
                </div>
                <div className="ax-temp-chip ax-temp-chip--cf">
                  <span className="ax-chip-label">CF</span>
                  <span className="ax-chip-val">
                    {(((part.flow + part.return) / 2 - parseFloat(roomTemp)) / 50).toFixed(3)}
                  </span>
                </div>
              </>
            )}
          </div>

          {error && <div className="ax-error">{error}</div>}

          <button className="ax-btn-calculate" onClick={calculate}
            disabled={!heatLoss || !roomTemp}>
            <EngineerAvatar size="sm" style={{ border: '2px solid rgba(255,255,255,0.5)' }} /> Find Radiator
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="ax-results">
            {/* Calculation Steps */}
            <CalcSteps steps={result.steps} correctionFactor={result.calculation.correctionFactor} exponentN={result.calculation.exponentN} />

            {/* Recommended */}
            <div className="ax-section-title">Recommended Radiator</div>
            {result.recommended
              ? <RadiatorCard radiator={result.recommended} heatLossW={result.inputs.heatLossW} isRecommended />
              : <div className="ax-no-result">No suitable radiator found. Consider splitting the load across multiple radiators.</div>
            }

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <>
                <div className="ax-section-title">Alternative Options</div>
                <div className="ax-alternatives-grid">
                  {result.alternatives.map((alt, idx) => (
                    <RadiatorCard key={idx} radiator={alt} heatLossW={result.inputs.heatLossW} />
                  ))}
                </div>
              </>
            )}

            {/* Best per panel type */}
            <div className="ax-section-title">
              Best Fit by Panel Type
              {result.inputs.maxLength && <span className="ax-section-sub"> — within {result.inputs.maxLength}mm wall length</span>}
            </div>
            <div className="ax-alternatives-grid">
              {Object.entries(result.bestPerModel).map(([model, rad]) =>
                rad ? (
                  <RadiatorCard key={model} radiator={rad} heatLossW={result.inputs.heatLossW} />
                ) : (
                  <div key={model} className="ax-no-result-small">
                    <strong>{model === 'PP' ? 'P+' : model}</strong> — no suitable size{result.inputs.maxLength ? ` within ${result.inputs.maxLength}mm` : ''}
                  </div>
                )
              )}
            </div>

            {/* Part L Summary */}
            <div className="ax-partl-box">
              <div className="ax-partl-title">Building Regulations Part L Summary</div>
              <div className="ax-partl-grid">
                <div className="ax-partl-item">
                  <span className="ax-partl-label">Compliance Status</span>
                  {result.recommended
                    ? <ComplianceBadge status={result.recommended.compliance} />
                    : <span className="ax-badge ax-badge--fail">FAIL</span>}
                </div>
                <div className="ax-partl-item">
                  <span className="ax-partl-label">Max Allowed Oversizing</span>
                  <span className="ax-partl-value">+15%</span>
                </div>
                <div className="ax-partl-item">
                  <span className="ax-partl-label">Actual Oversizing</span>
                  <span className="ax-partl-value">
                    {result.recommended ? `${result.recommended.oversizingPct}%` : 'N/A'}
                  </span>
                </div>
                <div className="ax-partl-item">
                  <span className="ax-partl-label">Passing Models Found</span>
                  <span className="ax-partl-value">{result.allPassing}</span>
                </div>
              </div>
              <div className="ax-partl-note">
                Part L requires radiators to meet heat loss and not exceed +15% oversizing to avoid excessive heat output and fuel consumption.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
