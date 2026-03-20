/**
 * DocumentModal – shows document details with Download and Preview buttons
 * Opens when any document item is clicked
 */
import React, { useEffect, useCallback } from 'react';
import { getIcon } from './documents-data';
import { downloadDocument, previewDocument } from './pdf-generator';

export default function DocumentModal({ doc, onClose }) {
  // Hooks must be called before any early return
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!doc) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [doc, handleKey]);

  if (!doc) return null;

  const handleDownload = () => downloadDocument(doc.generatorId);
  const handlePreview  = () => previewDocument(doc.generatorId);
  const handlePrint    = () => {
    previewDocument(doc.generatorId);
  };

  const icon = getIcon(doc.icon);

  return (
    <div className="dm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={doc.name}>
      <div className="dm-modal" onClick={e => e.stopPropagation()}>

        {/* Close button */}
        <button className="dm-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Icon + Title */}
        <div className="dm-header">
          <div className="dm-icon">{icon}</div>
          <div className="dm-title-block">
            <h2 className="dm-title">{doc.name}</h2>
            <p className="dm-desc">{doc.description || 'Professional installation document'}</p>
          </div>
        </div>

        <div className="dm-divider" />

        {/* Info chips */}
        <div className="dm-chips">
          <span className="dm-chip dm-chip--blue">📄 PDF Template</span>
          <span className="dm-chip dm-chip--grey">MCS Compliant</span>
          <span className="dm-chip dm-chip--grey">A4 Format</span>
          <span className="dm-chip dm-chip--grey">Fillable</span>
        </div>

        {/* Action buttons */}
        <div className="dm-actions">
          <button className="dm-btn dm-btn--primary" onClick={handleDownload}>
            ⬇ Download PDF
          </button>
          <button className="dm-btn dm-btn--secondary" onClick={handlePreview}>
            👁 Preview
          </button>
          <button className="dm-btn dm-btn--ghost" onClick={handlePrint}>
            🖨 Print
          </button>
        </div>

        <p className="dm-hint">
          PDF will be generated and downloaded to your device. Print and complete by hand, or fill in and re-scan.
        </p>
      </div>
    </div>
  );
}
