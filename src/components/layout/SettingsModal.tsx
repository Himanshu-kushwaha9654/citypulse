import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Sliders, Bell, RefreshCw } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    isDemoMode,
    setIsDemoMode,
    isSimulationPaused,
    setIsSimulationPaused,
    alertPreferences,
    setAlertPreferences,
    showToast
  } = useCityPulse();

  // Local draft state - only committed on Save & Close
  const [draftTraffic, setDraftTraffic] = useState(alertPreferences.trafficThreshold);
  const [draftAqi, setDraftAqi] = useState(alertPreferences.aqiThreshold);

  // Sync draft whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftTraffic(alertPreferences.trafficThreshold);
      setDraftAqi(alertPreferences.aqiThreshold);
    }
  }, [isOpen, alertPreferences.trafficThreshold, alertPreferences.aqiThreshold]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Escape key closes modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleSave = () => {
    setAlertPreferences(prev => ({
      ...prev,
      trafficThreshold: draftTraffic,
      aqiThreshold: draftAqi
    }));
    try {
      const existing = JSON.parse(localStorage.getItem('cp_alert_prefs') || '{}');
      localStorage.setItem('cp_alert_prefs', JSON.stringify({
        ...existing,
        trafficThreshold: draftTraffic,
        aqiThreshold: draftAqi
      }));
    } catch (_) { }
    showToast('Alert thresholds saved', 'success');
    onClose();
  };

  if (!isOpen) return null;

  // ─── Portal to document.body so no parent CSS can clip or trap the modal ───
  return createPortal(
    /* Backdrop - position:fixed, full viewport, above everything */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dashboard Settings"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(26,35,24,0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal shell - flex column; width + maxHeight keep it in viewport */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 48px)',
          background: '#ffffff',
          border: '1px solid #D2DEC9',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(26,35,24,0.15)',
          color: '#1A2318',
          fontFamily: 'inherit',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* ── HEADER (never scrolls away) ── */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #E4ECE0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '14px',
              background: 'rgba(94,115,82,0.12)',
              color: '#5E7352',
              border: '1px solid rgba(94,115,82,0.25)',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#1A2318' }}>
                Dashboard Preferences
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#52604D', fontFamily: 'var(--font-mono)' }}>
                Configure live operational parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              padding: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#52604D',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E4ECE0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#D2DEC9 transparent',
        }}>

          {/* Simulation & Demo Mode card */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#F4F8F2',
            border: '1px solid #D2DEC9',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <h4 style={{ margin: 0, fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1A2318', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={13} color="#5E7352" /> Realtime Telemetry &amp; Simulation
            </h4>

            {/* Pause toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2318' }}>Pause Realtime Simulation</div>
                <div style={{ fontSize: '11px', color: '#52604D', marginTop: '2px' }}>Freeze live metrics and telemetry updates</div>
              </div>
              <button
                onClick={() => {
                  setIsSimulationPaused(!isSimulationPaused);
                  showToast(!isSimulationPaused ? 'Realtime simulation paused' : 'Realtime simulation resumed', 'info');
                }}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '11px',
                  border: isSimulationPaused ? 'none' : '1px solid #D2DEC9',
                  background: isSimulationPaused ? '#b45309' : '#ffffff',
                  color: isSimulationPaused ? '#ffffff' : '#1A2318',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {isSimulationPaused ? 'PAUSED' : 'ACTIVE'}
              </button>
            </div>

            {/* Demo Mode toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderTop: '1px solid #E4ECE0', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2318' }}>Demo Mode</div>
                <div style={{ fontSize: '11px', color: '#52604D', marginTop: '2px' }}>Enable guided civic incident scenarios</div>
              </div>
              <button
                onClick={() => {
                  setIsDemoMode(!isDemoMode);
                  showToast(!isDemoMode ? 'Demo Mode enabled' : 'Demo Mode disabled', 'success');
                }}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '11px',
                  border: isDemoMode ? 'none' : '1px solid #D2DEC9',
                  background: isDemoMode ? '#5E7352' : '#ffffff',
                  color: isDemoMode ? '#ffffff' : '#1A2318',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {isDemoMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Alert Thresholds card */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#F4F8F2',
            border: '1px solid #D2DEC9',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <h4 style={{ margin: 0, fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1A2318', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={13} color="#5E7352" /> Alert Thresholds
            </h4>

            {/* Traffic slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2318' }}>Traffic Congestion Alert</div>
                  <div style={{ fontSize: '11px', color: '#52604D', marginTop: '2px' }}>Trigger when road density exceeds</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: '#96632B', minWidth: '44px', textAlign: 'right' }}>
                  {draftTraffic}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={draftTraffic}
                onChange={(e) => setDraftTraffic(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '9999px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(to right, #96632B ${((draftTraffic - 50) / 50) * 100}%, #D2DEC9 ${((draftTraffic - 50) / 50) * 100}%)`,
                }}
                aria-label="Traffic congestion threshold"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#768570', fontFamily: 'var(--font-mono)' }}>
                <span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            {/* AQI slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #E4ECE0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2318' }}>Air Quality Index Alert</div>
                  <div style={{ fontSize: '11px', color: '#52604D', marginTop: '2px' }}>Trigger when AQI exceeds</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: '#5E7352', minWidth: '68px', textAlign: 'right' }}>
                  {draftAqi} AQI
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={300}
                step={10}
                value={draftAqi}
                onChange={(e) => setDraftAqi(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '9999px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(to right, #5E7352 ${((draftAqi - 50) / 250) * 100}%, #D2DEC9 ${((draftAqi - 50) / 250) * 100}%)`,
                }}
                aria-label="AQI threshold"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#768570', fontFamily: 'var(--font-mono)' }}>
                <span>50</span><span>150</span><span>300</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── FOOTER (never scrolls away) ── */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          padding: '16px 24px 20px',
          borderTop: '1px solid #E4ECE0',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #D2DEC9',
              background: 'transparent',
              color: '#52604D',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E4ECE0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#5E7352',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(94,115,82,0.3)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4D5F43')}
            onMouseLeave={e => (e.currentTarget.style.background = '#5E7352')}
          >
            Save &amp; Close
          </button>
        </div>

      </div>
    </div>,
    document.body   // ← Portal renders directly on <body>, escaping ALL parent constraints
  );
};
