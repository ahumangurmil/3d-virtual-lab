import { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { WorkstationSelector } from './WorkstationSelector';

export function TopNavbar() {
  const {
    playerName,
    setPlayerName,
    titrationState,
    controlMode,
    povMode,
    togglePovMode,
    setControlMode,
    setCameraPreset,
    selectApparatus,
  } = useLab();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSaveName = (e) => {
    e?.preventDefault();
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const isTitrationActive = titrationState && titrationState.status === 'in_progress';

  return (
    <header
      style={{
        position: 'absolute',
        top: '12px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {/* LEFT: Branding & Experiment Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
        <div
          className="hud-glass"
          style={{
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Scientific Flask Icon */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31L4.19 19A2 2 0 0 0 6 22h12a2 2 0 0 0 1.81-3L14 9.31V2" />
              <path d="M8.5 2h7" />
              <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hud-text-primary)', letterSpacing: '-0.2px' }}>
                Virtual Chem Lab
              </span>
              <span className="hud-tag cyan" style={{ fontSize: '9px', padding: '1px 5px' }}>
                Class 11–12
              </span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--hud-text-muted)' }}>
              {isTitrationActive ? 'Experiment: Acid–Base Titration' : 'Interactive 3D Simulation'}
            </div>
          </div>
        </div>

        {/* Workstation Selector (Integrated cleanly into header) */}
        <WorkstationSelector />
      </div>

      {/* RIGHT: Quick Perspective Toggle & Student Profile Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
        {/* POV Quick Toggle */}
        {controlMode === 'avatar' && (
          <button
            type="button"
            className="hud-nav-btn"
            onClick={togglePovMode}
            title={`Switch to ${povMode === 'first-person' ? '3rd-Person Follow' : '1st-Person Eye'} POV`}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{povMode === 'first-person' ? '1st Person' : '3rd Person'}</span>
          </button>
        )}

        {/* Mode Quick Toggle (Walk vs Overview) */}
        <button
          type="button"
          className="hud-nav-btn"
          onClick={() => {
            if (controlMode === 'avatar') {
              selectApparatus(null);
              setControlMode('overview');
              setCameraPreset('classroom');
            } else {
              setControlMode('avatar');
            }
          }}
          title={controlMode === 'avatar' ? 'Switch to Overview Orbit Camera' : 'Switch to Avatar Walk'}
          style={{ fontSize: '11px', padding: '5px 10px' }}
        >
          {controlMode === 'avatar' ? 'Overview' : 'Walk'}
        </button>

        {/* Student Profile Card */}
        <div
          className="hud-glass"
          style={{
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Avatar Icon with Online Status Indicator */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                border: '1.5px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              {playerName.charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                border: '1.5px solid #0f172a',
              }}
            />
          </div>

          {isEditingName ? (
            <form onSubmit={handleSaveName} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                maxLength={24}
                placeholder="Student name"
                style={{
                  padding: '3px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: '1px solid var(--hud-accent)',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  outline: 'none',
                  color: '#ffffff',
                  width: '110px',
                }}
              />
              <button
                type="submit"
                className="hud-action-btn primary"
                style={{ padding: '3px 6px', fontSize: '10px' }}
              >
                Save
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hud-text-primary)' }}>
                  {playerName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(playerName);
                    setIsEditingName(true);
                  }}
                  title="Edit student name"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '1px',
                    color: 'var(--hud-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#2dd4bf' }}>
                Student (Avatar)
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
