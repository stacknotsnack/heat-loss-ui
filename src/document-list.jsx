import React from 'react';
import DocumentItem from './document-item';

export default function DocumentList({ documents, variant = 'standard', onMarkComplete, onOpen, completingId }) {
  if (!documents || documents.length === 0) {
    return <p className="ip-empty">No documents in this section.</p>;
  }
  return (
    <div className="ip-list">
      {documents.map(doc => (
        <DocumentItem
          key={doc.id}
          doc={doc}
          variant={doc.featured ? 'featured' : variant}
          onMarkComplete={onMarkComplete}
          onOpen={onOpen}
          isCompleting={completingId === doc.id}
        />
      ))}
    </div>
  );
}
