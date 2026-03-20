/**
 * DocumentItem – single document row
 * Clickable to open modal. Supports standard, featured, complete, incomplete variants.
 */
import React from 'react';
import { getIcon } from './documents-data';

export default function DocumentItem({ doc, variant = 'standard', onMarkComplete, onOpen, isCompleting }) {
  const icon = getIcon(doc.icon);

  if (variant === 'incomplete') {
    return (
      <div
        className={`ip-item ip-item--incomplete ip-item--clickable ${isCompleting ? 'ip-item--completing' : ''}`}
        onClick={() => onOpen && onOpen(doc)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onOpen && onOpen(doc)}
      >
        <div className="ip-item__icon">{icon}</div>
        <div className="ip-item__body">
          <span className="ip-item__name">{doc.name}</span>
          {doc.description && <span className="ip-item__desc">{doc.description}</span>}
        </div>
        <div className="ip-item__actions">
          <button
            className="ip-btn ip-btn--complete"
            onClick={e => { e.stopPropagation(); onMarkComplete(doc.id); }}
            aria-label={`Mark ${doc.name} as complete`}
            title="Mark complete"
          >
            <span className="ip-btn__icon">○</span>
            <span className="ip-btn__label">Complete</span>
          </button>
          <span className="ip-item__dl-hint" title="Click to download">⬇</span>
        </div>
      </div>
    );
  }

  if (variant === 'complete') {
    return (
      <div
        className="ip-item ip-item--complete ip-item--clickable"
        onClick={() => onOpen && onOpen(doc)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onOpen && onOpen(doc)}
      >
        <div className="ip-item__icon ip-item__icon--done">✓</div>
        <div className="ip-item__body">
          <span className="ip-item__name ip-item__name--done">{doc.name}</span>
          {doc.completedDate && <span className="ip-item__desc">Completed {doc.completedDate}</span>}
        </div>
        <div className="ip-item__actions">
          <span className="ip-badge ip-badge--done">Done</span>
          <span className="ip-item__dl-hint" title="Click to download">⬇</span>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div
        className="ip-item ip-item--featured ip-item--clickable"
        onClick={() => onOpen && onOpen(doc)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onOpen && onOpen(doc)}
      >
        <div className="ip-item__icon ip-item__icon--featured">{icon}</div>
        <div className="ip-item__body">
          <span className="ip-item__name ip-item__name--featured">{doc.name}</span>
          {doc.description && <span className="ip-item__desc">{doc.description}</span>}
        </div>
        <div className="ip-item__actions">
          <span className="ip-badge ip-badge--required">Required</span>
          <span className="ip-item__dl-hint" title="Click to download">⬇</span>
        </div>
      </div>
    );
  }

  // Standard
  return (
    <div
      className="ip-item ip-item--standard ip-item--clickable"
      onClick={() => onOpen && onOpen(doc)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen && onOpen(doc)}
    >
      <div className="ip-item__icon">{icon}</div>
      <div className="ip-item__body">
        <span className="ip-item__name">{doc.name}</span>
        {doc.description && <span className="ip-item__desc">{doc.description}</span>}
      </div>
      <span className="ip-item__dl-hint" title="Click to download">⬇</span>
    </div>
  );
}
