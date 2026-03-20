/**
 * DocumentSection – a titled section with a document list
 * Optional collapsible behaviour
 */
import React, { useState } from 'react';
import DocumentList from './document-list';

export default function DocumentSection({
  title,
  subtitle,
  documents,
  variant = 'standard',
  collapsible = false,
  defaultOpen = true,
  count,
  onMarkComplete,
  onOpen,
  completingId,
  accentColor
}) {
  const [open, setOpen] = useState(defaultOpen);

  const displayCount = count !== undefined ? count : documents?.length || 0;

  return (
    <div className="ip-section" style={accentColor ? { borderTopColor: accentColor } : {}}>
      <div
        className={`ip-section__header ${collapsible ? 'ip-section__header--clickable' : ''}`}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? open : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => e.key === 'Enter' && setOpen(o => !o) : undefined}
      >
        <div className="ip-section__title-row">
          <h2 className="ip-section__title">{title}</h2>
          <span className="ip-section__count">{displayCount} item{displayCount !== 1 ? 's' : ''}</span>
        </div>
        {subtitle && <p className="ip-section__subtitle">{subtitle}</p>}
        {collapsible && (
          <span className="ip-section__chevron" aria-hidden="true">
            {open ? '▲' : '▼'}
          </span>
        )}
      </div>

      {(!collapsible || open) && (
        <div className="ip-section__body">
          <DocumentList
            documents={documents}
            variant={variant}
            onMarkComplete={onMarkComplete}
            onOpen={onOpen}
            completingId={completingId}
          />
        </div>
      )}
    </div>
  );
}
