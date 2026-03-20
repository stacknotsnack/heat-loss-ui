import { useState } from 'react';
import HeatLossCalculator from './heat_loss_app';
import AxisRadiatorCalculator from './axis_radiator_component';
import InformationPage from './information-page';
import CADPage from './cad-page';
import EngineerAvatar from './EngineerAvatar';

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

export default function App() {
  const [tab, setTab]           = useState('heatloss');
  const [radPrefill, setRadPrefill] = useState(null);

  const handleSendToRadiator = ({ heatLoss, roomTemp, roomName }) => {
    setRadPrefill({ heatLoss, roomTemp, roomName });
    setTab('radiator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #dde1ec',
        display: 'flex',
        padding: '0 1.5rem',
        overflowX: 'auto'
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
      </div>

      {tab === 'heatloss'    && <HeatLossCalculator onSendToRadiator={handleSendToRadiator} />}
      {tab === 'radiator'    && <AxisRadiatorCalculator prefillHeatLoss={radPrefill?.heatLoss} prefillRoomTemp={radPrefill?.roomTemp} prefillRoomName={radPrefill?.roomName} />}
      {tab === 'information' && <InformationPage />}
      {tab === 'cad'         && <CADPage />}
    </div>
  );
}
