/**
 * Information & Documents Page
 * Comprehensive documentation hub for heat pump installations and compliance.
 * Three sections: Heat Pump Survey | DNO Commissioning | Lead Management
 */
import React, { useState, useMemo } from 'react';
import DocumentSection from './document-section';
import DocumentList from './document-list';
import DocumentModal from './document-modal';
import {
  SECTION1_DOCUMENTS,
  SECTION2_DOCUMENTS,
  SECTION3_COMPLETE,
  SECTION3_INCOMPLETE
} from './documents-data';
import './information-page.css';

const TABS = [
  { id: 'survey',       label: '📋 Heat Pump Survey',          short: 'Survey'      },
  { id: 'dno',          label: '🔌 DNO Commissioning',         short: 'DNO'         },
  { id: 'management',   label: '📊 Lead Management',           short: 'Management'  },
];

export default function InformationPage() {
  const [activeTab, setActiveTab] = useState('survey');
  const [search, setSearch]       = useState('');

  // Section 3 interactive state
  const [incompleteList, setIncompleteList] = useState(SECTION3_INCOMPLETE);
  const [completeList,   setCompleteList]   = useState(SECTION3_COMPLETE);
  const [completingId,   setCompletingId]   = useState(null);
  const [selectedDoc,    setSelectedDoc]    = useState(null);

  const handleMarkComplete = (id) => {
    setCompletingId(id);
    setTimeout(() => {
      const item = incompleteList.find(d => d.id === id);
      if (item) {
        setCompleteList(prev => [
          { ...item, status: 'complete', completedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
          ...prev
        ]);
        setIncompleteList(prev => prev.filter(d => d.id !== id));
      }
      setCompletingId(null);
    }, 400);
  };

  // Search filtering for sections 1 & 2
  const filtered1 = useMemo(() =>
    SECTION1_DOCUMENTS.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const filtered2 = useMemo(() =>
    SECTION2_DOCUMENTS.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="ip-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="ip-header">
        <div className="ip-header__inner">
          <div className="ip-header__text">
            <h1 className="ip-header__title">Information &amp; Documents</h1>
            <p className="ip-header__sub">Required documentation for heat pump installation and compliance</p>
          </div>
          <div className="ip-header__stats">
            <div className="ip-stat">
              <span className="ip-stat__val">{SECTION1_DOCUMENTS.length}</span>
              <span className="ip-stat__lbl">Survey Docs</span>
            </div>
            <div className="ip-stat">
              <span className="ip-stat__val">{SECTION2_DOCUMENTS.length}</span>
              <span className="ip-stat__lbl">DNO Docs</span>
            </div>
            <div className="ip-stat">
              <span className="ip-stat__val">{incompleteList.length}</span>
              <span className="ip-stat__lbl">Pending</span>
            </div>
            <div className="ip-stat ip-stat--done">
              <span className="ip-stat__val">{completeList.length}</span>
              <span className="ip-stat__lbl">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────── */}
      <div className="ip-tabs" role="tablist" aria-label="Document sections">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`ip-tab ${activeTab === tab.id ? 'ip-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="ip-tab__full">{tab.label}</span>
            <span className="ip-tab__short">{tab.short}</span>
          </button>
        ))}
      </div>

      {/* ── Search Bar (Sections 1 & 2) ─────────────────────────── */}
      {(activeTab === 'survey' || activeTab === 'dno') && (
        <div className="ip-search-row">
          <div className="ip-search-wrap">
            <span className="ip-search__icon">🔍</span>
            <input
              type="text"
              className="ip-search"
              placeholder="Search documents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search documents"
            />
            {search && (
              <button className="ip-search__clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>
      )}

      {/* ── Tab Panels ─────────────────────────────────────────── */}
      <div className="ip-body">

        {/* ── Section 1: Heat Pump Survey ───────────── */}
        {activeTab === 'survey' && (
          <div className="ip-panel" role="tabpanel">
            <DocumentSection
              title="Heat Pump Survey"
              subtitle="All documents required for a complete heat pump survey and installation pack"
              documents={filtered1}
              variant="standard"
              accentColor="#1565c0"
              onOpen={setSelectedDoc}
            />
            {filtered1.length === 0 && search && (
              <p className="ip-no-results">No documents matching "{search}"</p>
            )}
          </div>
        )}

        {/* ── Section 2: DNO Commissioning ─────────── */}
        {activeTab === 'dno' && (
          <div className="ip-panel" role="tabpanel">
            <DocumentSection
              title="DNO Commissioning Form"
              subtitle="Documents required for DNO notification and commissioning sign-off"
              documents={filtered2}
              variant="standard"
              accentColor="#0d47a1"
              onOpen={setSelectedDoc}
            />
            {filtered2.length === 0 && search && (
              <p className="ip-no-results">No documents matching "{search}"</p>
            )}
          </div>
        )}

        {/* ── Section 3: Lead Management ───────────── */}
        {activeTab === 'management' && (
          <div className="ip-panel" role="tabpanel">
            <div className="ip-management-header">
              <h2 className="ip-management-title">Heat-Calc Lead Management</h2>
              <p className="ip-management-sub">Track document completion status for this installation</p>
              <div className="ip-progress-bar">
                <div
                  className="ip-progress-bar__fill"
                  style={{ width: `${(completeList.length / (completeList.length + incompleteList.length)) * 100}%` }}
                />
              </div>
              <div className="ip-progress-label">
                {completeList.length} of {completeList.length + incompleteList.length} documents complete
              </div>
            </div>

            {/* Incomplete — expanded by default */}
            <div className="ip-collapsible-wrapper">
              <CollapsibleGroup
                title="Incomplete Forms"
                count={incompleteList.length}
                defaultOpen={true}
                accentColor="#e53935"
                countColor="#e53935"
              >
                {incompleteList.length === 0
                  ? <p className="ip-all-done">🎉 All forms completed!</p>
                  : <DocumentList
                      documents={incompleteList}
                      variant="incomplete"
                      onMarkComplete={handleMarkComplete}
                      onOpen={setSelectedDoc}
                      completingId={completingId}
                    />
                }
              </CollapsibleGroup>
            </div>

            {/* Complete — collapsed by default */}
            <div className="ip-collapsible-wrapper">
              <CollapsibleGroup
                title="Complete Forms"
                count={completeList.length}
                defaultOpen={false}
                accentColor="#43a047"
                countColor="#43a047"
              >
                <DocumentList documents={completeList} variant="complete" onOpen={setSelectedDoc} />
              </CollapsibleGroup>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="ip-footer">
        <p>Documentation requirements based on MCS Standards and Building Regulations · Last updated March 2026</p>
      </div>

      {/* ── Document Modal ──────────────────────────────────────── */}
      {selectedDoc && (
        <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}

// ── Collapsible Group (internal, Section 3 only) ──────────────────────────────
function CollapsibleGroup({ title, count, defaultOpen, accentColor, countColor, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ip-group" style={{ borderLeftColor: accentColor }}>
      <button
        className="ip-group__header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="ip-group__title-row">
          <span className="ip-group__title">{title}</span>
          <span className="ip-group__count" style={{ background: countColor }}>
            {count}
          </span>
        </div>
        <span className="ip-group__chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="ip-group__body">
          {children}
        </div>
      )}
    </div>
  );
}
