/**
 * CAD & Design Page
 * 3D room visualisation using Three.js with measurement labels and object placement.
 */
import React, { useState, useCallback } from 'react';
import CADViewer from './cad-viewer';
import RoomMeasureWizard from './room-measure-wizard';
import './cad-page.css';

// ── Helper: collapsible panel ─────────────────────────────────────────────────
function Panel({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cad-panel">
      <div className="cad-panel__header" onClick={() => setOpen(o => !o)}>
        {title}
        <span className={`cad-panel__chevron ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && <div className="cad-panel__body">{children}</div>}
    </div>
  );
}

// ── Object type config ────────────────────────────────────────────────────────
const WALL_OBJ_TYPES = [
  { type: 'window',   icon: '🪟', label: 'Window'   },
  { type: 'door',     icon: '🚪', label: 'Door'     },
  { type: 'radiator', icon: '🔥', label: 'Radiator' },
  { type: 'tv',       icon: '📺', label: 'TV Unit'  },
];
const ROOM_OBJ_TYPES = [
  { type: 'sofa',     icon: '🛋', label: 'Sofa'     },
  { type: 'bed',      icon: '🛏', label: 'Bed'      },
  { type: 'table',    icon: '🍽', label: 'Table'    },
  { type: 'chair',    icon: '🪑', label: 'Chair'    },
  { type: 'wardrobe', icon: '🗄', label: 'Wardrobe' },
  { type: 'bath',     icon: '🛁', label: 'Bathtub'  },
];
const ALL_OBJ_TYPES = [...WALL_OBJ_TYPES, ...ROOM_OBJ_TYPES];
const WALLS = ['North', 'South', 'East', 'West'];

const DEFAULT_DIMS = {
  window:   { width: 1.2, height: 1.1, xPos: 0.5, wall: 'North' },
  door:     { width: 0.9, height: 2.1, xPos: 0.5, wall: 'South' },
  radiator: { length: 1000, height: 600, xPos: 0.5, wall: 'North' },
  tv:       { width: 1.4, depth: 0.4,  xPos: 0.5, wall: 'North' },
  sofa:     { width: 2.0, depth: 0.9,  xPos: 1.0, zPos: 1.0, rotY: 0 },
  bed:      { width: 1.4, depth: 2.0,  xPos: 1.0, zPos: 1.0, rotY: 0 },
  table:    { width: 1.2, depth: 0.8,  xPos: 1.5, zPos: 1.5, rotY: 0 },
  chair:    { width: 0.5, depth: 0.5,  xPos: 1.0, zPos: 1.0, rotY: 0 },
  wardrobe: { width: 1.2, depth: 0.6,  xPos: 0.5, zPos: 0.5, rotY: 0 },
  bath:     { width: 1.7, depth: 0.75, xPos: 0.5, zPos: 0.5, rotY: 0 },
};

const isWallType = t => WALL_OBJ_TYPES.some(o => o.type === t);

const VIEW_MODES = [
  { id: 'perspective', label: '3D' },
  { id: 'top',         label: 'Top' },
  { id: 'front',       label: 'Front' },
  { id: 'side',        label: 'Side' },
  { id: '2d',          label: '2D Plan' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function CADPage() {
  // Room dimensions
  const [room, setRoom] = useState({ width: 4, length: 5, height: 2.4 });
  const [roomInput, setRoomInput] = useState({ width: '4', length: '5', height: '2.4' });

  // Placed objects
  const [objects, setObjects]   = useState([]);
  const [selected, setSelected] = useState(null);

  // Add object form
  const [addType, setAddType]   = useState('window');
  const [addForm, setAddForm]   = useState(DEFAULT_DIMS.window);

  // View mode
  const [viewMode, setViewMode] = useState('perspective');

  // Wizard
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = useCallback(({ room: r, objects: objs, roomPhoto }) => {
    setRoom(r);
    setRoomInput({ width: String(r.width), length: String(r.length), height: String(r.height) });
    setObjects(objs);
    setShowWizard(false);
    // store reference photo in state so info overlay can show it
    setWizardPhoto(roomPhoto || null);
  }, []);

  const [wizardPhoto, setWizardPhoto] = useState(null);

  // Stats
  const floorArea  = (room.width * room.length).toFixed(1);
  const volume     = (room.width * room.length * room.height).toFixed(1);
  const wallArea   = (2 * (room.width + room.length) * room.height).toFixed(1);

  // ── Room update ─────────────────────────────────────────────────────────────
  const updateRoom = useCallback(() => {
    const w = parseFloat(roomInput.width);
    const l = parseFloat(roomInput.length);
    const h = parseFloat(roomInput.height);
    if (!isNaN(w) && !isNaN(l) && !isNaN(h) && w > 0 && l > 0 && h > 0) {
      setRoom({ width: w, length: l, height: h });
    }
  }, [roomInput]);

  // ── Add object ──────────────────────────────────────────────────────────────
  const handleAddType = (t) => {
    setAddType(t);
    setAddForm(DEFAULT_DIMS[t]);
  };

  const handleAddObject = () => {
    const id = Date.now();
    setObjects(prev => [...prev, { id, type: addType, ...addForm }]);
  };

  const handleDeleteObject = (id) => {
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selected === id) setSelected(null);
  };

  // Called by CADViewer when furniture is drag-dropped to a new position
  const handleObjectMove = useCallback((id, newXPos, newZPos) => {
    setObjects(prev => prev.map(o =>
      o.id === id ? { ...o, xPos: String(newXPos), zPos: String(newZPos) } : o
    ));
  }, []);

  // ── Export floor plan PDF ───────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header
      doc.setFillColor(13, 71, 161);
      doc.rect(0, 0, 297, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Heat-Calc | CAD Floor Plan Export', 148, 13, { align: 'center' });

      // Room info
      doc.setTextColor(30, 30, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Room Dimensions', 15, 32);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Width: ${room.width} m`, 15, 40);
      doc.text(`Length: ${room.length} m`, 15, 47);
      doc.text(`Height: ${room.height} m`, 15, 54);
      doc.text(`Floor Area: ${floorArea} m²`, 15, 61);
      doc.text(`Volume: ${volume} m³`, 15, 68);
      doc.text(`Wall Area: ${wallArea} m²`, 15, 75);

      // Floor plan box (scaled)
      const scale = Math.min(200 / room.width, 140 / room.length);
      const planW = room.width  * scale;
      const planL = room.length * scale;
      const originX = 60;
      const originY = 30;

      // Floor plan outline
      doc.setDrawColor(13, 71, 161);
      doc.setLineWidth(1);
      doc.setFillColor(230, 235, 255);
      doc.rect(originX, originY, planW, planL, 'FD');

      // Dimension annotations
      doc.setFontSize(9);
      doc.setTextColor(13, 71, 161);
      doc.text(`${room.width} m`, originX + planW / 2, originY - 2, { align: 'center' });
      doc.text(`${room.length} m`, originX + planW + 3, originY + planL / 2, null, 90);

      // Objects
      (objects || []).forEach(obj => {
        const xOff = (obj.xPos || 0) * scale;
        if (obj.type === 'window') {
          const wW = (obj.width  || 1) * scale;
          doc.setFillColor(79, 195, 247);
          doc.rect(originX + xOff + 5, originY, wW, 3, 'F');
        }
        if (obj.type === 'door') {
          const dW = (obj.width || 0.9) * scale;
          doc.setFillColor(141, 110, 99);
          doc.rect(originX + xOff + 5, originY + planL - 3, dW, 3, 'F');
        }
        if (obj.type === 'radiator') {
          const rW = ((obj.length || 1000) / 1000) * scale;
          doc.setFillColor(230, 81, 0);
          doc.rect(originX + xOff + 5, originY + 3, rW, 4, 'F');
        }
      });

      // Legend
      const lx = 15;
      let ly = 95;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 50);
      doc.text('Placed Objects', lx, ly);
      ly += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (objects.length === 0) {
        doc.text('None', lx, ly);
      } else {
        objects.forEach(obj => {
          const dims = obj.type === 'radiator'
            ? `${obj.length || 1000}mm × ${obj.height || 600}mm`
            : `${obj.width || '?'}m × ${obj.height || '?'}m`;
          doc.text(`• ${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}: ${dims}`, lx, ly);
          ly += 6;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 140);
      const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Generated by Heat-Calc · ${now} · For design reference only`, 148, 200, { align: 'center' });

      doc.save(`floor-plan-${room.width}x${room.length}m.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  // ── Object label helper ─────────────────────────────────────────────────────
  const objLabel = (obj) => {
    if (obj.type === 'window')   return `${obj.wall || 'N'} · ${obj.width || 1.2}×${obj.height || 1.1}m`;
    if (obj.type === 'door')     return `${obj.wall || 'S'} · ${obj.width || 0.9}×${obj.height || 2.1}m`;
    if (obj.type === 'radiator') return `${obj.wall || 'N'} · ${obj.length || 1000}×${obj.height || 600}mm`;
    if (obj.type === 'tv')       return `${obj.wall || 'N'} · ${obj.width || 1.4}m wide`;
    if (obj.type === 'sofa')     return `${obj.width || 2.0}×${obj.depth || 0.9}m`;
    if (obj.type === 'bed')      return `${obj.width || 1.4}×${obj.depth || 2.0}m`;
    if (obj.type === 'table')    return `${obj.width || 1.2}×${obj.depth || 0.8}m`;
    if (obj.type === 'wardrobe') return `${obj.width || 1.2}×${obj.depth || 0.6}m`;
    if (obj.type === 'bath')     return `${obj.width || 1.7}×${obj.depth || 0.75}m`;
    return '';
  };

  return (
    <div className="cad-page">

      {/* ── Header ── */}
      <div className="cad-header">
        <div className="cad-header__left">
          <div className="cad-header__icon">🏗</div>
          <div>
            <p className="cad-header__title">CAD &amp; Design</p>
            <p className="cad-header__sub">3D room visualiser · measurements · BS EN 442</p>
          </div>
        </div>

        <div className="cad-header__controls">
          {/* View mode */}
          {VIEW_MODES.map(v => (
            <button
              key={v.id}
              className={`cad-view-btn ${viewMode === v.id ? 'active' : ''}`}
              onClick={() => setViewMode(v.id)}
            >
              {v.label}
            </button>
          ))}

          <div className="cad-sep" />

          <button
            className="cad-export-btn"
            onClick={() => setShowWizard(true)}
            style={{ background: 'linear-gradient(135deg,#2e7d32,#43a047)' }}
          >
            📐 Measure Room
          </button>

          <div className="cad-sep" />

          <button className="cad-export-btn" onClick={handleExport} disabled={!room.width}>
            ⬇ Export PDF
          </button>
        </div>
      </div>

      <div className="cad-main">

        {/* ── Sidebar ── */}
        <div className="cad-sidebar">

          {/* Room Dimensions */}
          <Panel title="Room Dimensions">
            <div className="cad-input-grid">
              <div className="cad-field">
                <span className="cad-label">Width</span>
                <div className="cad-input-row">
                  <input className="cad-input" type="number" min="0.5" step="0.1"
                    value={roomInput.width}
                    onChange={e => setRoomInput(p => ({ ...p, width: e.target.value }))} />
                  <span className="cad-unit">m</span>
                </div>
              </div>
              <div className="cad-field">
                <span className="cad-label">Length</span>
                <div className="cad-input-row">
                  <input className="cad-input" type="number" min="0.5" step="0.1"
                    value={roomInput.length}
                    onChange={e => setRoomInput(p => ({ ...p, length: e.target.value }))} />
                  <span className="cad-unit">m</span>
                </div>
              </div>
              <div className="cad-field">
                <span className="cad-label">Height</span>
                <div className="cad-input-row">
                  <input className="cad-input" type="number" min="1" step="0.05"
                    value={roomInput.height}
                    onChange={e => setRoomInput(p => ({ ...p, height: e.target.value }))} />
                  <span className="cad-unit">m</span>
                </div>
              </div>
            </div>
            <button className="cad-btn-calculate" onClick={updateRoom}>
              ↻ Update Room
            </button>
          </Panel>

          {/* Room Stats */}
          <Panel title="Room Statistics" defaultOpen={true}>
            <div className="cad-stats">
              <div className="cad-stat">
                <span className="cad-stat__val">{floorArea}</span>
                <span className="cad-stat__lbl">Floor m²</span>
              </div>
              <div className="cad-stat">
                <span className="cad-stat__val">{volume}</span>
                <span className="cad-stat__lbl">Volume m³</span>
              </div>
              <div className="cad-stat">
                <span className="cad-stat__val">{wallArea}</span>
                <span className="cad-stat__lbl">Wall m²</span>
              </div>
              <div className="cad-stat">
                <span className="cad-stat__val">{room.height}</span>
                <span className="cad-stat__lbl">Height m</span>
              </div>
            </div>
          </Panel>

          {/* Add Objects */}
          <Panel title="Add Objects">
            {/* Single grouped select — avoids the two-select bug */}
            <div className="cad-field">
              <span className="cad-label">Object Type</span>
              <select className="cad-select" value={addType} onChange={e => handleAddType(e.target.value)}>
                <optgroup label="── Wall Objects ──">
                  {WALL_OBJ_TYPES.map(t => (
                    <option key={t.type} value={t.type}>{t.icon} {t.label}</option>
                  ))}
                </optgroup>
                <optgroup label="── Furniture ──">
                  {ROOM_OBJ_TYPES.map(t => (
                    <option key={t.type} value={t.type}>{t.icon} {t.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Wall selector (wall-mounted objects only) */}
            {isWallType(addType) && (
              <div className="cad-field">
                <span className="cad-label">Wall</span>
                <div className="cad-color-row" style={{ gap: '0.35rem' }}>
                  {WALLS.map(w => (
                    <button key={w}
                      onClick={() => setAddForm(p => ({ ...p, wall: w }))}
                      style={{
                        padding: '0.3rem 0.6rem', borderRadius: 5, fontSize: '0.72rem',
                        fontWeight: addForm.wall === w ? 700 : 400,
                        background: addForm.wall === w ? '#3a4080' : '#1e2136',
                        border: `1px solid ${addForm.wall === w ? '#5b63b8' : '#2e3250'}`,
                        color: addForm.wall === w ? '#fff' : '#8890b8', cursor: 'pointer',
                      }}
                    >{w}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Window / Door dims */}
            {(addType === 'window' || addType === 'door') && (
              <div className="cad-input-grid">
                <div className="cad-field">
                  <span className="cad-label">Width</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="0.3" step="0.1"
                      value={addForm.width || ''}
                      onChange={e => setAddForm(p => ({ ...p, width: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">m</span>
                  </div>
                </div>
                <div className="cad-field">
                  <span className="cad-label">Height</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="0.3" step="0.1"
                      value={addForm.height || ''}
                      onChange={e => setAddForm(p => ({ ...p, height: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Radiator dims */}
            {addType === 'radiator' && (
              <div className="cad-input-grid">
                <div className="cad-field">
                  <span className="cad-label">Length</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="300" step="100"
                      value={addForm.length || ''}
                      onChange={e => setAddForm(p => ({ ...p, length: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">mm</span>
                  </div>
                </div>
                <div className="cad-field">
                  <span className="cad-label">Height</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="300" step="50"
                      value={addForm.height || ''}
                      onChange={e => setAddForm(p => ({ ...p, height: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">mm</span>
                  </div>
                </div>
              </div>
            )}

            {/* Furniture width/depth */}
            {!isWallType(addType) && addType !== 'chair' && (
              <div className="cad-input-grid">
                <div className="cad-field">
                  <span className="cad-label">Width</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="0.3" step="0.1"
                      value={addForm.width || ''}
                      onChange={e => setAddForm(p => ({ ...p, width: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">m</span>
                  </div>
                </div>
                <div className="cad-field">
                  <span className="cad-label">Depth</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="0.3" step="0.1"
                      value={addForm.depth || ''}
                      onChange={e => setAddForm(p => ({ ...p, depth: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Position */}
            {isWallType(addType) ? (
              <div className="cad-field">
                <span className="cad-label">Offset from left corner (m)</span>
                <div className="cad-input-row">
                  <input className="cad-input" type="number" min="0" step="0.1"
                    value={addForm.xPos || 0}
                    onChange={e => setAddForm(p => ({ ...p, xPos: parseFloat(e.target.value) }))} />
                  <span className="cad-unit">m</span>
                </div>
              </div>
            ) : (
              <div className="cad-input-grid">
                <div className="cad-field">
                  <span className="cad-label">From west wall</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="0" step="0.1"
                      value={addForm.xPos || 0}
                      onChange={e => setAddForm(p => ({ ...p, xPos: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">m</span>
                  </div>
                </div>
                <div className="cad-field">
                  <span className="cad-label">From north wall</span>
                  <div className="cad-input-row">
                    <input className="cad-input" type="number" min="0" step="0.1"
                      value={addForm.zPos || 0}
                      onChange={e => setAddForm(p => ({ ...p, zPos: parseFloat(e.target.value) }))} />
                    <span className="cad-unit">m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rotation (furniture only) */}
            {!isWallType(addType) && (
              <div className="cad-field">
                <span className="cad-label">Rotation</span>
                <div className="cad-color-row" style={{ gap: '0.35rem' }}>
                  {[0, 90, 180, 270].map(deg => (
                    <button key={deg}
                      onClick={() => setAddForm(p => ({ ...p, rotY: deg }))}
                      style={{
                        padding: '0.3rem 0.55rem', borderRadius: 5, fontSize: '0.72rem',
                        fontWeight: addForm.rotY === deg ? 700 : 400,
                        background: addForm.rotY === deg ? '#3a4080' : '#1e2136',
                        border: `1px solid ${addForm.rotY === deg ? '#5b63b8' : '#2e3250'}`,
                        color: addForm.rotY === deg ? '#fff' : '#8890b8', cursor: 'pointer',
                      }}
                    >{deg}°</button>
                  ))}
                </div>
              </div>
            )}

            <button className="cad-btn-add" onClick={handleAddObject}>
              + Add {ALL_OBJ_TYPES.find(t => t.type === addType)?.icon} {addType.charAt(0).toUpperCase() + addType.slice(1)}
            </button>
          </Panel>

          {/* Placed Objects */}
          <Panel title={`Objects (${objects.length})`} defaultOpen={true}>
            {objects.length === 0
              ? <p className="cad-empty-note">No objects placed yet</p>
              : (
                <div className="cad-object-list">
                  {objects.map(obj => {
                    const cfg = ALL_OBJ_TYPES.find(t => t.type === obj.type);
                    return (
                      <div
                        key={obj.id}
                        className={`cad-object-item ${selected === obj.id ? 'selected' : ''}`}
                        onClick={() => setSelected(obj.id)}
                      >
                        <span className="cad-object-icon">{cfg?.icon}</span>
                        <span className="cad-object-name">{cfg?.label}</span>
                        <span className="cad-object-dims">{objLabel(obj)}</span>
                        <button className="cad-object-del"
                          onClick={e => { e.stopPropagation(); handleDeleteObject(obj.id); }}
                          aria-label="Delete">✕</button>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </Panel>

        </div>

        {/* ── 3D Viewport ── */}
        <div className="cad-viewport">
          <CADViewer room={room} objects={objects} viewMode={viewMode} onObjectMove={handleObjectMove} />

          {/* Info overlay */}
          <div className="cad-info-overlay">
            <strong>{room.width} × {room.length} × {room.height} m</strong><br />
            Floor: {floorArea} m² · Vol: {volume} m³
          </div>

          {/* Controls hint */}
          <div className="cad-controls-hint">
            Left drag: rotate · Right drag: pan · Scroll: zoom<br />
            🛋 Hover furniture → <strong style={{color:'#c9d1f5'}}>drag to move</strong>
          </div>

          {/* Empty state */}
          {(!room.width || !room.length) && (
            <div className="cad-empty-state">
              <div className="cad-empty-state__icon">🏗</div>
              <div className="cad-empty-state__text">Enter room dimensions</div>
              <div className="cad-empty-state__sub">
                or tap <strong style={{ color: '#43a047' }}>📐 Measure Room</strong> on mobile
              </div>
            </div>
          )}

          {/* Wizard photo thumbnail (shown after wizard completes) */}
          {wizardPhoto && (
            <div style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
              border: '2px solid #43a047', boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              <img src={wizardPhoto} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

      </div>

      {/* ── Room Measure Wizard ── */}
      {showWizard && (
        <RoomMeasureWizard
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
