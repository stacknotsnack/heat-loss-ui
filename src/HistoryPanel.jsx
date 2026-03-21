import { useState, useEffect } from 'react';
import { loadCalculations, deleteCalculation } from './calculations';
import './HistoryPanel.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function HistoryPanel({ onLoad, onClose }) {
  const [calcs, setCalcs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    loadCalculations()
      .then(setCalcs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this calculation?')) return;
    try {
      await deleteCalculation(id);
      setCalcs(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="hist-overlay" onClick={onClose}>
      <div className="hist-panel" onClick={e => e.stopPropagation()}>
        <div className="hist-header">
          <div className="hist-title">Saved Calculations</div>
          <button className="hist-close" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="hist-empty">Loading…</div>}
        {error   && <div className="hist-error">{error}</div>}

        {!loading && calcs.length === 0 && (
          <div className="hist-empty">No saved calculations yet. Run a heat loss calculation and save it!</div>
        )}

        <div className="hist-list">
          {calcs.map(c => (
            <div key={c.id} className="hist-item" onClick={() => { onLoad(c.id); onClose(); }}>
              <div className="hist-item-info">
                <div className="hist-item-name">{c.name}</div>
                <div className="hist-item-meta">
                  {c.result?.building?.totalHeatLossW
                    ? <span className="hist-item-watts">{c.result.building.totalHeatLossW}W total</span>
                    : null}
                  <span className="hist-item-date">{formatDate(c.updated_at)}</span>
                </div>
              </div>
              <div className="hist-item-actions">
                <button className="hist-load-btn">Load</button>
                <button className="hist-del-btn" onClick={e => handleDelete(c.id, e)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
