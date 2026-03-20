/**
 * RoomMeasureWizard
 * Mobile-friendly step-by-step room measurement wizard.
 * Guides the user through photographing and measuring their room,
 * then returns structured data to populate the CAD viewer.
 *
 * Steps:
 *  1 – Welcome
 *  2 – Room photo (wide shot)
 *  3 – Room dimensions (width × length × height)
 *  4 – Windows
 *  5 – Doors
 *  6 – Radiators
 *  7 – Review & generate
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import './room-measure-wizard.css';

const TOTAL_STEPS = 7;

// Unique id helper
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Photo capture button ───────────────────────────────────────────────────────
function PhotoCapture({ label, photo, onCapture, onRetake }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onCapture(url);
  };

  if (photo) {
    return (
      <div className="rmw-photo-preview">
        <img src={photo} alt="Captured room" />
        <button className="rmw-photo-preview__retake" onClick={onRetake}>
          📷 Retake
        </button>
      </div>
    );
  }

  return (
    <label className="rmw-camera-btn">
      <span className="rmw-camera-icon">📷</span>
      <span>{label}</span>
      <span style={{ fontSize: '0.72rem', color: '#5a6285' }}>Tap to open camera</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
      />
    </label>
  );
}

// ── Dimension input with large touch target ────────────────────────────────────
function DimInput({ label, hint, value, onChange, unit, min, step, placeholder }) {
  return (
    <div className="rmw-field">
      <span className="rmw-label">
        {label}
        {hint && <span className="rmw-label-hint">{hint}</span>}
      </span>
      <div className="rmw-input-row">
        <input
          className="rmw-input"
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <span className="rmw-unit">{unit}</span>
      </div>
    </div>
  );
}

// ── Step: Welcome ─────────────────────────────────────────────────────────────
function StepWelcome() {
  return (
    <>
      <div className="rmw-step-icon">📐</div>
      <h2 className="rmw-step-title">Room Measure</h2>
      <p className="rmw-step-sub">
        Follow the steps to photograph and measure your room.
        We'll generate your CAD design automatically.
      </p>

      <div className="rmw-features">
        <div className="rmw-feature-row">
          <span className="rmw-feature-icon">📷</span>
          <div className="rmw-feature-text">
            <strong>Take photos</strong>
            Use your phone camera to capture each wall, window, and door for reference.
          </div>
        </div>
        <div className="rmw-feature-row">
          <span className="rmw-feature-icon">📏</span>
          <div className="rmw-feature-text">
            <strong>Enter measurements</strong>
            Use a tape measure for accuracy. We'll guide you through each dimension.
          </div>
        </div>
        <div className="rmw-feature-row">
          <span className="rmw-feature-icon">🏗</span>
          <div className="rmw-feature-text">
            <strong>Generate CAD design</strong>
            Your measurements populate the 3D CAD viewer with walls, windows, doors & radiators.
          </div>
        </div>
        <div className="rmw-feature-row">
          <span className="rmw-feature-icon">⏱</span>
          <div className="rmw-feature-text">
            <strong>Takes about 3–5 minutes</strong>
            You'll need a tape measure or laser measurer.
          </div>
        </div>
      </div>

      <div className="rmw-tip">
        <strong>Tip:</strong> Stand in the middle of the room for the first photo to capture all four walls.
      </div>
    </>
  );
}

// ── Step: Room Photo ──────────────────────────────────────────────────────────
function StepRoomPhoto({ photo, onCapture, onRetake }) {
  return (
    <>
      <div className="rmw-step-icon">📷</div>
      <h2 className="rmw-step-title">Room Reference Photo</h2>
      <p className="rmw-step-sub">Take a photo standing in one corner, angled to show two walls — this is just a reference image for you to look back at while measuring.</p>

      <PhotoCapture
        label="Take reference photo"
        photo={photo}
        onCapture={onCapture}
        onRetake={onRetake}
      />

      <div className="rmw-tip">
        <strong>Tip:</strong> Stand in a corner and point the camera diagonally across the room. You'll capture two walls, the floor, and the ceiling in one shot. Take more photos of individual walls if needed — you can use your camera roll for reference.
      </div>
    </>
  );
}

// ── Step: Room Dimensions ─────────────────────────────────────────────────────
function StepDimensions({ dims, onChange }) {
  return (
    <>
      <div className="rmw-step-icon">📏</div>
      <h2 className="rmw-step-title">Room Dimensions</h2>
      <p className="rmw-step-sub">Measure wall to wall. Enter values in metres (e.g. 4.2).</p>

      <div className="rmw-form">
        <DimInput
          label="Width" hint="(left wall → right wall)"
          value={dims.width} onChange={v => onChange('width', v)}
          unit="m" min="0.5" step="0.05" placeholder="e.g. 3.6"
        />
        <DimInput
          label="Length" hint="(front wall → back wall)"
          value={dims.length} onChange={v => onChange('length', v)}
          unit="m" min="0.5" step="0.05" placeholder="e.g. 4.8"
        />
        <DimInput
          label="Height" hint="(floor → ceiling)"
          value={dims.height} onChange={v => onChange('height', v)}
          unit="m" min="1" step="0.05" placeholder="e.g. 2.4"
        />
      </div>

      <div className="rmw-tip">
        <strong>Standard heights:</strong> 2.4 m (modern), 2.6 m (older), 3.0 m (Victorian).
        Measure from finished floor to finished ceiling.
      </div>
    </>
  );
}

// ── Step: Windows ─────────────────────────────────────────────────────────────
const WALLS = ['North', 'South', 'East', 'West'];

function WindowCard({ win, idx, onChange, onDelete }) {
  return (
    <div className="rmw-obj-card">
      <div className="rmw-obj-card__header">
        <span className="rmw-obj-card__title">🪟 Window {idx + 1}</span>
        <button className="rmw-obj-card__del" onClick={onDelete}>Remove</button>
      </div>

      {/* Wall */}
      <div className="rmw-field">
        <span className="rmw-label">Wall</span>
        <div className="rmw-wall-pills">
          {WALLS.map(w => (
            <button
              key={w}
              className={`rmw-wall-pill ${win.wall === w ? 'active' : ''}`}
              onClick={() => onChange('wall', w)}
            >{w}</button>
          ))}
        </div>
      </div>

      <div className="rmw-input-grid">
        <DimInput label="Width" value={win.width} onChange={v => onChange('width', v)}
          unit="m" min="0.3" step="0.05" placeholder="1.2" />
        <DimInput label="Height" value={win.height} onChange={v => onChange('height', v)}
          unit="m" min="0.3" step="0.05" placeholder="1.1" />
      </div>

      <DimInput
        label="Distance from left corner" hint="(along the wall)"
        value={win.xPos} onChange={v => onChange('xPos', v)}
        unit="m" min="0" step="0.05" placeholder="0.5"
      />

      <PhotoCapture
        label="Photo of this window (optional)"
        photo={win.photo}
        onCapture={url => onChange('photo', url)}
        onRetake={() => onChange('photo', null)}
      />
    </div>
  );
}

function StepWindows({ windows, onAdd, onUpdate, onDelete }) {
  return (
    <>
      <div className="rmw-step-icon">🪟</div>
      <h2 className="rmw-step-title">Windows</h2>
      <p className="rmw-step-sub">Add each window in the room. Measure width × height and note which wall it's on.</p>

      <div className="rmw-objects">
        {windows.map((w, i) => (
          <WindowCard
            key={w.id} win={w} idx={i}
            onChange={(field, val) => onUpdate(w.id, field, val)}
            onDelete={() => onDelete(w.id)}
          />
        ))}
      </div>

      <button className="rmw-add-btn" onClick={onAdd}>
        + Add Window
      </button>
    </>
  );
}

// ── Step: Doors ───────────────────────────────────────────────────────────────
function DoorCard({ door, idx, onChange, onDelete }) {
  return (
    <div className="rmw-obj-card">
      <div className="rmw-obj-card__header">
        <span className="rmw-obj-card__title">🚪 Door {idx + 1}</span>
        <button className="rmw-obj-card__del" onClick={onDelete}>Remove</button>
      </div>

      <div className="rmw-field">
        <span className="rmw-label">Wall</span>
        <div className="rmw-wall-pills">
          {WALLS.map(w => (
            <button
              key={w}
              className={`rmw-wall-pill ${door.wall === w ? 'active' : ''}`}
              onClick={() => onChange('wall', w)}
            >{w}</button>
          ))}
        </div>
      </div>

      <div className="rmw-input-grid">
        <DimInput label="Width" value={door.width} onChange={v => onChange('width', v)}
          unit="m" min="0.6" step="0.05" placeholder="0.9" />
        <DimInput label="Height" value={door.height} onChange={v => onChange('height', v)}
          unit="m" min="1.8" step="0.05" placeholder="2.1" />
      </div>

      <DimInput
        label="Distance from left corner" hint="(along the wall)"
        value={door.xPos} onChange={v => onChange('xPos', v)}
        unit="m" min="0" step="0.05" placeholder="0.5"
      />

      <PhotoCapture
        label="Photo of this door (optional)"
        photo={door.photo}
        onCapture={url => onChange('photo', url)}
        onRetake={() => onChange('photo', null)}
      />
    </div>
  );
}

function StepDoors({ doors, onAdd, onUpdate, onDelete }) {
  return (
    <>
      <div className="rmw-step-icon">🚪</div>
      <h2 className="rmw-step-title">Doors</h2>
      <p className="rmw-step-sub">Add each door. Standard door is 0.9 m wide × 2.1 m tall.</p>

      <div className="rmw-objects">
        {doors.map((d, i) => (
          <DoorCard
            key={d.id} door={d} idx={i}
            onChange={(field, val) => onUpdate(d.id, field, val)}
            onDelete={() => onDelete(d.id)}
          />
        ))}
      </div>

      <button className="rmw-add-btn" onClick={onAdd}>
        + Add Door
      </button>
    </>
  );
}

// ── Step: Radiators ───────────────────────────────────────────────────────────
function RadiatorCard({ rad, idx, onChange, onDelete }) {
  return (
    <div className="rmw-obj-card">
      <div className="rmw-obj-card__header">
        <span className="rmw-obj-card__title">🔥 Radiator {idx + 1}</span>
        <button className="rmw-obj-card__del" onClick={onDelete}>Remove</button>
      </div>

      <div className="rmw-field">
        <span className="rmw-label">Wall</span>
        <div className="rmw-wall-pills">
          {WALLS.map(w => (
            <button
              key={w}
              className={`rmw-wall-pill ${rad.wall === w ? 'active' : ''}`}
              onClick={() => onChange('wall', w)}
            >{w}</button>
          ))}
        </div>
      </div>

      <div className="rmw-input-grid">
        <DimInput label="Length" value={rad.length} onChange={v => onChange('length', v)}
          unit="mm" min="300" step="100" placeholder="1000" />
        <DimInput label="Height" value={rad.height} onChange={v => onChange('height', v)}
          unit="mm" min="300" step="50" placeholder="600" />
      </div>

      <DimInput
        label="Distance from left corner" hint="(along the wall)"
        value={rad.xPos} onChange={v => onChange('xPos', v)}
        unit="m" min="0" step="0.05" placeholder="0.5"
      />

      <div className="rmw-tip" style={{ marginTop: '0.25rem' }}>
        <strong>Common sizes:</strong> 600×600mm, 1000×600mm, 1400×600mm, 1800×600mm
      </div>
    </div>
  );
}

function StepRadiators({ radiators, onAdd, onUpdate, onDelete }) {
  return (
    <>
      <div className="rmw-step-icon">🔥</div>
      <h2 className="rmw-step-title">Radiators</h2>
      <p className="rmw-step-sub">Measure each radiator (length × height in mm). Usually found under windows.</p>

      <div className="rmw-objects">
        {radiators.map((r, i) => (
          <RadiatorCard
            key={r.id} rad={r} idx={i}
            onChange={(field, val) => onUpdate(r.id, field, val)}
            onDelete={() => onDelete(r.id)}
          />
        ))}
      </div>

      <button className="rmw-add-btn" onClick={onAdd}>
        + Add Radiator
      </button>
    </>
  );
}

// ── Step: Review ──────────────────────────────────────────────────────────────
function StepReview({ data }) {
  const { dims, roomPhoto, windows, doors, radiators } = data;

  return (
    <>
      <div className="rmw-step-icon">✅</div>
      <h2 className="rmw-step-title">Review &amp; Generate</h2>
      <p className="rmw-step-sub">Check your measurements, then generate the 3D CAD design.</p>

      {/* Room photo thumbnail */}
      {roomPhoto && (
        <div className="rmw-review-section">
          <div className="rmw-review-section__header">📷 Room Photo</div>
          <img className="rmw-review-photo" src={roomPhoto} alt="Room" />
        </div>
      )}

      {/* Dimensions */}
      <div className="rmw-review-section">
        <div className="rmw-review-section__header">📏 Dimensions</div>
        <div className="rmw-review-row">
          <span className="rmw-review-row__label">Width</span>
          <span className="rmw-review-row__val">{dims.width || '—'} m</span>
        </div>
        <div className="rmw-review-row">
          <span className="rmw-review-row__label">Length</span>
          <span className="rmw-review-row__val">{dims.length || '—'} m</span>
        </div>
        <div className="rmw-review-row">
          <span className="rmw-review-row__label">Height</span>
          <span className="rmw-review-row__val">{dims.height || '—'} m</span>
        </div>
        <div className="rmw-review-row">
          <span className="rmw-review-row__label">Floor area</span>
          <span className="rmw-review-row__val">
            {dims.width && dims.length
              ? `${(parseFloat(dims.width) * parseFloat(dims.length)).toFixed(1)} m²`
              : '—'}
          </span>
        </div>
      </div>

      {/* Windows */}
      {windows.length > 0 && (
        <div className="rmw-review-section">
          <div className="rmw-review-section__header">🪟 Windows ({windows.length})</div>
          {windows.map((w, i) => (
            <div className="rmw-review-row" key={w.id}>
              <span className="rmw-review-row__label">Window {i + 1} · {w.wall || 'North'} wall</span>
              <span className="rmw-review-row__val">{w.width || 1.2}×{w.height || 1.1} m</span>
            </div>
          ))}
        </div>
      )}

      {/* Doors */}
      {doors.length > 0 && (
        <div className="rmw-review-section">
          <div className="rmw-review-section__header">🚪 Doors ({doors.length})</div>
          {doors.map((d, i) => (
            <div className="rmw-review-row" key={d.id}>
              <span className="rmw-review-row__label">Door {i + 1} · {d.wall || 'South'} wall</span>
              <span className="rmw-review-row__val">{d.width || 0.9}×{d.height || 2.1} m</span>
            </div>
          ))}
        </div>
      )}

      {/* Radiators */}
      {radiators.length > 0 && (
        <div className="rmw-review-section">
          <div className="rmw-review-section__header">🔥 Radiators ({radiators.length})</div>
          {radiators.map((r, i) => (
            <div className="rmw-review-row" key={r.id}>
              <span className="rmw-review-row__label">Radiator {i + 1} · {r.wall || 'North'} wall</span>
              <span className="rmw-review-row__val">{r.length || 1000}×{r.height || 600} mm</span>
            </div>
          ))}
        </div>
      )}

      <div className="rmw-tip">
        <strong>Ready?</strong> Tap "Generate CAD" to populate the 3D viewer with your measurements.
        You can always adjust the values in the CAD sidebar afterwards.
      </div>
    </>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function RoomMeasureWizard({ onComplete, onClose }) {
  const [step, setStep] = useState(1);

  // Shared state
  const [roomPhoto, setRoomPhoto] = useState(null);
  const [dims, setDims] = useState({ width: '', length: '', height: '' });
  const [windows,   setWindows]   = useState([]);
  const [doors,     setDoors]     = useState([]);
  const [radiators, setRadiators] = useState([]);

  // Lock body scroll when wizard is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Dimension change ─────────────────────────────────────────────────────────
  const handleDimChange = useCallback((field, val) => {
    setDims(p => ({ ...p, [field]: val }));
  }, []);

  // ── Window CRUD ──────────────────────────────────────────────────────────────
  const addWindow    = () => setWindows(p => [...p, { id: uid(), wall: 'North', width: '1.2', height: '1.1', xPos: '0.5', photo: null }]);
  const updateWindow = (id, field, val) => setWindows(p => p.map(w => w.id === id ? { ...w, [field]: val } : w));
  const deleteWindow = (id) => setWindows(p => p.filter(w => w.id !== id));

  // ── Door CRUD ────────────────────────────────────────────────────────────────
  const addDoor    = () => setDoors(p => [...p, { id: uid(), wall: 'South', width: '0.9', height: '2.1', xPos: '0.5', photo: null }]);
  const updateDoor = (id, field, val) => setDoors(p => p.map(d => d.id === id ? { ...d, [field]: val } : d));
  const deleteDoor = (id) => setDoors(p => p.filter(d => d.id !== id));

  // ── Radiator CRUD ────────────────────────────────────────────────────────────
  const addRadiator    = () => setRadiators(p => [...p, { id: uid(), wall: 'North', length: '1000', height: '600', xPos: '0.5' }]);
  const updateRadiator = (id, field, val) => setRadiators(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));
  const deleteRadiator = (id) => setRadiators(p => p.filter(r => r.id !== id));

  // ── Navigation ───────────────────────────────────────────────────────────────
  const canNext = useCallback(() => {
    if (step === 3) {
      const w = parseFloat(dims.width);
      const l = parseFloat(dims.length);
      const h = parseFloat(dims.height);
      return w > 0 && l > 0 && h > 0;
    }
    return true;
  }, [step, dims]);

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep(s => Math.max(s - 1, 1));

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const room = {
      width:  parseFloat(dims.width)  || 4,
      length: parseFloat(dims.length) || 5,
      height: parseFloat(dims.height) || 2.4,
    };

    const toFloat = v => parseFloat(v) || 0;

    const objects = [
      ...windows.map(w => ({
        id: w.id, type: 'window',
        width:  toFloat(w.width),
        height: toFloat(w.height),
        xPos:   toFloat(w.xPos),
        wall:   w.wall,
      })),
      ...doors.map(d => ({
        id: d.id, type: 'door',
        width:  toFloat(d.width),
        height: toFloat(d.height),
        xPos:   toFloat(d.xPos),
        wall:   d.wall,
      })),
      ...radiators.map(r => ({
        id: r.id, type: 'radiator',
        length: toFloat(r.length),
        height: toFloat(r.height),
        xPos:   toFloat(r.xPos),
        wall:   r.wall,
      })),
    ];

    onComplete({ room, objects, roomPhoto });
  }, [dims, windows, doors, radiators, roomPhoto, onComplete]);

  // ── Step labels (for topbar) ─────────────────────────────────────────────────
  const STEP_NAMES = ['Welcome', 'Photo', 'Dimensions', 'Windows', 'Doors', 'Radiators', 'Review'];

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="rmw-overlay" role="dialog" aria-modal="true" aria-label="Room Measure Wizard">

      {/* Top bar */}
      <div className="rmw-topbar">
        <button className="rmw-close-btn" onClick={onClose} aria-label="Close wizard">✕</button>
        <span className="rmw-topbar__title">📐 Room Measure</span>
        <span className="rmw-topbar__step">{step} / {TOTAL_STEPS} · {STEP_NAMES[step - 1]}</span>
      </div>

      {/* Progress */}
      <div className="rmw-progress">
        <div className="rmw-progress__fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Scrollable content */}
      <div className="rmw-body">
        {step === 1 && <StepWelcome />}
        {step === 2 && (
          <StepRoomPhoto
            photo={roomPhoto}
            onCapture={setRoomPhoto}
            onRetake={() => setRoomPhoto(null)}
          />
        )}
        {step === 3 && (
          <StepDimensions dims={dims} onChange={handleDimChange} />
        )}
        {step === 4 && (
          <StepWindows
            windows={windows}
            onAdd={addWindow}
            onUpdate={updateWindow}
            onDelete={deleteWindow}
          />
        )}
        {step === 5 && (
          <StepDoors
            doors={doors}
            onAdd={addDoor}
            onUpdate={updateDoor}
            onDelete={deleteDoor}
          />
        )}
        {step === 6 && (
          <StepRadiators
            radiators={radiators}
            onAdd={addRadiator}
            onUpdate={updateRadiator}
            onDelete={deleteRadiator}
          />
        )}
        {step === 7 && (
          <StepReview data={{ dims, roomPhoto, windows, doors, radiators }} />
        )}
      </div>

      {/* Footer nav */}
      <div className="rmw-footer">
        {step > 1 && (
          <button className="rmw-btn rmw-btn--back" onClick={back}>← Back</button>
        )}

        {step < TOTAL_STEPS && (
          <button
            className="rmw-btn rmw-btn--next"
            onClick={next}
            disabled={!canNext()}
            style={{ opacity: canNext() ? 1 : 0.45 }}
          >
            {step === 1 ? 'Get Started →' : 'Next →'}
          </button>
        )}

        {step === TOTAL_STEPS && (
          <button className="rmw-btn rmw-btn--generate" onClick={handleGenerate}>
            🏗 Generate CAD Design
          </button>
        )}
      </div>

    </div>
  );
}
