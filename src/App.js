import { useState } from 'react';
import HeatLossCalculator from './heat_loss_app';
import AxisRadiatorCalculator from './axis_radiator_component';
import InformationPage from './information-page';
import CADPage from './cad-page';
import EngineerAvatar from './EngineerAvatar';
import { AuthProvider, useAuth } from './AuthContext';
import AuthModal from './AuthModal';
import HistoryPanel from './HistoryPanel';
import { loadCalculation } from './calculations';

const TAB_STYLE = (active) => ({
  padding: '0.65rem 1.5rem',
  border: 'none',
  borderBottom: active ? '3px solid #e67e22' : '3px solid transparent',
  background: 'none',
  fontWeight: active ? 700 : 500,
  fontSize: '0.9rem',
  cursor: 'pointer',
  color: active ? '#1a1a2e' : '#666',
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  whiteSpace: 'nowrap'
});

function AppInner() {
  const { user, signOut, loading } = useAuth();
  const [tab, setTab]               = useState('heatloss');
  const [radPrefill, setRadPrefill] = useState(null);
  const [showAuth, setShowAuth]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loadedCalc, setLoadedCalc] = useState(null); // { id, name, rooms }

  const handleSendToRadiator = ({ heatLoss, roomTemp, roomName }) => {
    setRadPrefill({ heatLoss, roomTemp, roomName });
    setTab('radiator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadCalc = async (id) => {
    try {
      const calc = await loadCalculation(id);
      setLoadedCalc({ id: calc.id, name: calc.name, rooms: calc.rooms });
      setTab('heatloss');
    } catch (e) {
      alert('Failed to load calculation: ' + e.message);
    }
  };

  if (loading) return null;

  return (
    <div>
      {/* ── Tab bar ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #dde1ec',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        overflowX: 'auto',
        gap: '0'
      }}>
        <button style={TAB_STYLE(tab === 'heatloss')} onClick={() => setTab('heatloss')}>
          🔥 Heat Loss Calculator
        </button>
        <button style={TAB_STYLE(tab === 'radiator')} onClick={() => setTab('radiator')}>
          <EngineerAvatar size="sm" /> Radiator Selector
        </button>
        <button style={TAB_STYLE(tab === 'information')} onClick={() => setTab('information')}>
          📋 Information &amp; Documents
        </button>
        <button style={TAB_STYLE(tab === 'cad')} onClick={() => setTab('cad')}>
          🏗 CAD &amp; Design
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Auth controls */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <button
              style={{ ...TAB_STYLE(false), color: '#e67e22', fontWeight: 600 }}
              onClick={() => setShowHistory(true)}
            >
              📂 My Calculations
            </button>
            <div style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
            <button
              onClick={signOut}
              style={{
                padding: '0.4rem 0.9rem', border: '1px solid #dde1ec',
                borderRadius: '6px', background: 'none', cursor: 'pointer',
                fontSize: '0.82rem', color: '#666', whiteSpace: 'nowrap'
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            style={{
              padding: '0.45rem 1.1rem',
              background: 'linear-gradient(135deg, #e67e22, #d35400)',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              flexShrink: 0, marginLeft: '0.5rem'
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* ── Pages ── */}
      {tab === 'heatloss'    && (
        <HeatLossCalculator
          onSendToRadiator={handleSendToRadiator}
          user={user}
          loadedCalc={loadedCalc}
          onCalcLoaded={() => setLoadedCalc(null)}
        />
      )}
      {tab === 'radiator'    && (
        <AxisRadiatorCalculator
          prefillHeatLoss={radPrefill?.heatLoss}
          prefillRoomTemp={radPrefill?.roomTemp}
          prefillRoomName={radPrefill?.roomName}
        />
      )}
      {tab === 'information' && <InformationPage />}
      {tab === 'cad'         && <CADPage />}

      {/* ── Modals ── */}
      {showAuth    && <AuthModal onClose={() => setShowAuth(false)} />}
      {showHistory && <HistoryPanel onLoad={handleLoadCalc} onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
