import { useState } from 'react';
import { useLab } from '../../context/LabContext';

export function LabHUD() {
  const {
    workstations,
    activeStationId,
    selectStation,
    selectedApparatus,
    selectApparatus,
    cameraPreset,
    setCameraPreset,
    controlMode,
    setControlMode,
    playerName,
    setPlayerName,
    teleportToStation,
    teleportPlayerTo,
    updateApparatusState,
    heldApparatusId,
    heldApparatus,
    targetApparatus,
    placementState,
    pickUpApparatus,
    placeApparatus,
    interactionNotice,
    setInteractionNotice,
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

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* ================= TOP HEADER BAR ================= */}
      <header
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Lab Brand & Classroom Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="hud-panel"
            style={{
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              {/* Laboratory Flask Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31L4.19 19A2 2 0 0 0 6 22h12a2 2 0 0 0 1.81-3L14 9.31V2" />
                <path d="M8.5 2h7" />
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
              </svg>
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.2px',
                }}
              >
                Virtual Chemistry Classroom
              </h1>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#64748b',
                  letterSpacing: '0.1px',
                }}
              >
                Scalable Multi-Station Layout • Class 11–12 Practicals
              </p>
            </div>
          </div>

          {/* ================= CONFIGURABLE STUDENT PROFILE CHIP ================= */}
          <div
            className="hud-panel"
            style={{
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'auto',
            }}
          >
            {/* Student avatar icon with active status dot */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  border: '2px solid #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {playerName.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '1.5px solid #ffffff',
                }}
              />
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                  maxLength={24}
                  placeholder="Enter name"
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1.5px solid #0284c7',
                    outline: 'none',
                    color: '#0f172a',
                    width: '130px',
                  }}
                />
                <button
                  type="submit"
                  className="hud-btn active"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Save
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {playerName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(playerName);
                      setIsEditingName(true);
                    }}
                    title="Change Student Name"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#0d9488', letterSpacing: '0.3px' }}>
                  Class 11 Student (Local Avatar)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Workstation & Classroom Navigation Selector */}
        <div
          className="hud-panel"
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {/* Mode Switch: Student Walk vs Overview */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '2px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              className={`hud-btn ${controlMode === 'avatar' ? 'active' : ''}`}
              onClick={() => setControlMode('avatar')}
              title="Walk freely through the laboratory using WASD"
              style={{
                fontSize: '12px',
                padding: '5px 12px',
                border: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="5" r="2" />
                <path d="m9 20 3-6 3 6" />
                <path d="m6 8 6 2 6-2" />
                <path d="M12 10v4" />
              </svg>
              Student Walk
            </button>

            <button
              type="button"
              className={`hud-btn ${controlMode === 'overview' ? 'active' : ''}`}
              onClick={() => {
                selectApparatus(null);
                setControlMode('overview');
                setCameraPreset('classroom');
              }}
              title="Switch to wide overview orbit perspective"
              style={{
                fontSize: '12px',
                padding: '5px 12px',
                border: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Overview
            </button>
          </div>

          <span style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

          {/* Quick Dropdown or Direct Station Jump */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={activeStationId}
              onChange={(e) => {
                const sid = e.target.value;
                if (controlMode === 'avatar') {
                  teleportToStation(sid);
                } else {
                  selectStation(sid);
                }
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Select workstation"
            >
              {workstations.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.type === 'teacher' ? '★ ' + ws.name : `Station ${ws.stationNumber}: ${ws.name}`}
                </option>
              ))}
            </select>

            {/* Quick Teleport Avatar Button */}
            <button
              type="button"
              className="hud-btn"
              onClick={() => teleportToStation(activeStationId)}
              title="Teleport your student avatar right in front of the active workstation"
              style={{ padding: '5px 10px', fontSize: '11px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Teleport Here
            </button>

            {/* Reset to Entrance */}
            <button
              type="button"
              className="hud-btn"
              onClick={() => teleportPlayerTo(0, 8.5, Math.PI)}
              title="Reset avatar position to the classroom entrance aisle"
              style={{ padding: '5px 10px', fontSize: '11px' }}
            >
              Entrance
            </button>
          </div>

          {/* Equipment Focus Mode */}
          {selectedApparatus && (
            <button
              type="button"
              className={`hud-btn ${cameraPreset === 'closeup' && controlMode === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setControlMode('overview');
                setCameraPreset('closeup');
              }}
              title="Close up on selected apparatus"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Focus Item
            </button>
          )}
        </div>
      </header>

      {/* ================= INTERACTIVE EQUIPMENT PROMPT BANNER ================= */}
      {(heldApparatus || targetApparatus) && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            zIndex: 30,
          }}
        >
          {heldApparatus ? (
            <div
              className="hud-panel animate-fade-in"
              style={{
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '24px',
                border: `1.5px solid ${placementState?.isValid ? '#10b981' : '#f59e0b'}`,
                background: 'rgba(15, 23, 42, 0.88)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: placementState?.isValid ? '#10b981' : '#f59e0b',
                  boxShadow: `0 0 10px ${placementState?.isValid ? '#10b981' : '#f59e0b'}`,
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                Carrying: {heldApparatus.name}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>•</span>
              <button
                type="button"
                onClick={placeApparatus}
                disabled={!placementState?.isValid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: placementState?.isValid ? '#10b981' : '#334155',
                  color: placementState?.isValid ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: placementState?.isValid ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                <kbd style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>F</kbd>
                <span>{placementState?.isValid ? `Place on ${placementState.surfaceName}` : (placementState?.reason || 'Look at bench')}</span>
              </button>
            </div>
          ) : targetApparatus ? (
            <div
              className="hud-panel animate-fade-in"
              style={{
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '24px',
                border: '1.5px solid #0284c7',
                background: 'rgba(15, 23, 42, 0.88)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {targetApparatus.name}
              </span>
              {targetApparatus.isPickable ? (
                <button
                  type="button"
                  onClick={() => pickUpApparatus(targetApparatus.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <kbd style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>E</kbd>
                  <span>Pick Up</span>
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Stationary Apparatus</span>
              )}
              <button
                type="button"
                onClick={() => selectApparatus(targetApparatus.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Inspect
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* ================= INTERACTION TOAST FEEDBACK ================= */}
      {interactionNotice && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            zIndex: 40,
          }}
        >
          <div
            className="hud-panel animate-fade-in"
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: interactionNotice.type === 'warning' ? '#fffbeb' : '#f0fdf4',
              border: `1.5px solid ${interactionNotice.type === 'warning' ? '#f59e0b' : '#10b981'}`,
              color: interactionNotice.type === 'warning' ? '#92400e' : '#166534',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            }}
          >
            <span>{interactionNotice.type === 'warning' ? '⚠️' : '✓'}</span>
            <span>{interactionNotice.message}</span>
            <button
              type="button"
              onClick={() => setInteractionNotice(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                marginLeft: '4px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION CONTROLS HINT ================= */}
      <footer
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          pointerEvents: 'auto',
        }}
      >
        <div
          className="hud-panel"
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '12px',
            color: '#475569',
            flexWrap: 'wrap',
          }}
        >
          {controlMode === 'avatar' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <kbd style={{ background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>W</kbd>
                <kbd style={{ background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>A</kbd>
                <kbd style={{ background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>S</kbd>
                <kbd style={{ background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', padding: '2px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>D</kbd>
                <span style={{ fontWeight: 600, color: '#0f172a', marginLeft: '2px' }}>Move</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Shift</kbd>
                <span>Sprint / Run</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Mouse Drag</kbd>
                <span>Look Around</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Scroll</kbd>
                <span>Zoom</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>E</kbd>
                <span>Pick Up</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#10b981', color: '#ffffff', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>F</kbd>
                <span>Place</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '12px' }}>
                  Obstacle Collision Active
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Left Drag</kbd>
                <span>Orbit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Right Drag</kbd>
                <span>Pan</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Scroll</kbd>
                <span>Zoom</span>
              </div>
              <button
                type="button"
                onClick={() => setControlMode('avatar')}
                className="hud-btn active"
                style={{ padding: '3px 10px', fontSize: '11px' }}
              >
                Press WASD to Walk
              </button>
            </>
          )}
        </div>
      </footer>

      {/* ================= APPARATUS INSPECTOR PANEL (RIGHT DRAWER) ================= */}
      {selectedApparatus && (
        <aside
          className="hud-panel animate-fade-in"
          style={{
            position: 'absolute',
            top: '76px',
            right: '16px',
            width: '340px',
            maxHeight: 'calc(100vh - 96px)',
            overflowY: 'auto',
            padding: '18px 20px',
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '14px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: '#0284c7',
                    background: '#e0f2fe',
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  Apparatus Guide
                </span>
                {selectedApparatus.stationName && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#0d9488',
                      background: '#ccfbf1',
                      padding: '2px 7px',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedApparatus.stationName}
                  </span>
                )}
              </div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {selectedApparatus.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => selectApparatus(null)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = '#f1f5f9';
              }}
              title="Close Panel"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#334155', marginBottom: '14px' }}>
            {selectedApparatus.description}
          </p>

          {/* Interactive Pickup / Placement Actions */}
          <div style={{ marginBottom: '16px' }}>
            {selectedApparatus.id === heldApparatusId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={placeApparatus}
                  disabled={!placementState?.isValid}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: placementState?.isValid ? '#059669' : '#cbd5e1',
                    background: placementState?.isValid ? '#10b981' : '#f8fafc',
                    color: placementState?.isValid ? '#ffffff' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: placementState?.isValid ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: placementState?.isValid ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>Place Apparatus on Benchtop [F]</span>
                </button>
                <div style={{ fontSize: '11px', textAlign: 'center', color: placementState?.isValid ? '#059669' : '#d97706', fontWeight: 500 }}>
                  {placementState?.isValid ? `✓ Ready to place on ${placementState.surfaceName}` : `⚠ ${placementState?.reason || 'Look at a bench surface to place'}`}
                </div>
              </div>
            ) : selectedApparatus.isPickable ? (
              <button
                type="button"
                onClick={() => pickUpApparatus(selectedApparatus.id)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #0284c7',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.15s',
                }}
              >
                <span>Pick Up Apparatus [E]</span>
              </button>
            ) : (
              <div
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                Fixed Station Installation (Cannot be moved)
              </div>
            )}
          </div>

          {/* Specs / Status */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Current State:</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: selectedApparatus.id === heldApparatusId ? '#e0f2fe' : '#f1f5f9',
                  color: selectedApparatus.id === heldApparatusId ? '#0284c7' : '#334155',
                }}
              >
                {selectedApparatus.id === heldApparatusId ? 'Held (In Hands)' : 'Placed on Benchtop'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Capacity / Rating:</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedApparatus.capacity}</span>
            </div>

            {selectedApparatus.liquid && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Contents:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: selectedApparatus.liquid.color,
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>
                      {selectedApparatus.liquid.name}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Liquid Volume:</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>
                    {selectedApparatus.liquid.volume} mL / {selectedApparatus.liquid.maxVolume} mL
                  </span>
                </div>

                {selectedApparatus.liquid.ph !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Measured pH:</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>
                      {selectedApparatus.liquid.ph}
                    </span>
                  </div>
                )}

                {selectedApparatus.liquid.temperature !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Temperature:</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>
                      {selectedApparatus.liquid.temperature} °C
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Test tube rack tubes overview */}
            {selectedApparatus.tubes && (
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Test Tubes in Rack:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {selectedApparatus.tubes.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          backgroundColor: t.color,
                          border: '1px solid rgba(0,0,0,0.1)',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: '#334155', fontWeight: 500 }}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Controls (Bunsen Burner Toggle, Liquid Volume) */}
          {selectedApparatus.type === 'bunsen_burner' && (
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                className="hud-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px 16px',
                  background: selectedApparatus.isIgnited ? '#fee2e2' : '#f0fdf4',
                  borderColor: selectedApparatus.isIgnited ? '#fca5a5' : '#86efac',
                  color: selectedApparatus.isIgnited ? '#dc2626' : '#16a34a',
                  fontWeight: 600,
                }}
                onClick={() =>
                  updateApparatusState(selectedApparatus.id, {
                    isIgnited: !selectedApparatus.isIgnited,
                  })
                }
              >
                {selectedApparatus.isIgnited ? 'Extinguish Flame' : 'Ignite Bunsen Flame'}
              </button>
            </div>
          )}

          {selectedApparatus.liquid && (
            <div
              style={{
                marginBottom: '16px',
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 500 }}>Adjust Liquid Volume:</span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>
                  {selectedApparatus.liquid.volume} mL
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={selectedApparatus.liquid.maxVolume}
                step="5"
                value={selectedApparatus.liquid.volume}
                onChange={(e) => {
                  const newVol = Number(e.target.value);
                  updateApparatusState(selectedApparatus.id, {
                    liquid: {
                      ...selectedApparatus.liquid,
                      volume: newVol,
                    },
                  });
                }}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
            </div>
          )}

          {/* Safety Precaution Card */}
          <div
            style={{
              borderLeft: '3px solid #f59e0b',
              background: '#fffbeb',
              padding: '10px 12px',
              borderRadius: '4px 8px 8px 4px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>
                Class 11–12 Lab Safety Note
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.45, color: '#92400e' }}>
              {selectedApparatus.safetyNotes}
            </p>
          </div>

          {/* Focus In 3D Action */}
          <button
            type="button"
            className="hud-btn active"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '9px 16px',
              fontWeight: 600,
            }}
            onClick={() => setCameraPreset('closeup')}
          >
            Focus Camera on Equipment
          </button>
        </aside>
      )}
    </div>
  );
}
