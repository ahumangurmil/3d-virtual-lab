import { useState } from 'react';
import { useLab } from '../../context/LabContext';

export function CameraControls() {
  const {
    controlMode,
    setControlMode,
    povMode,
    togglePovMode,
    cameraPreset,
    setCameraPreset,
    selectedApparatus,
    selectApparatus,
  } = useLab();

  const [showKeyGuide, setShowKeyGuide] = useState(false);

  return (
    <>
      {/* Bottom Floating Control Bar */}
      <div
        className="hud-glass hud-animate-fade"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          pointerEvents: 'auto',
          zIndex: 20,
        }}
      >
        {/* Walk / Orbit Mode Selector */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            className={`hud-nav-btn ${controlMode === 'avatar' ? 'active' : ''}`}
            onClick={() => setControlMode('avatar')}
            title="Walk through the laboratory using WASD"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="2" />
              <path d="m9 20 3-6 3 6" />
              <path d="m6 8 6 2 6-2" />
              <path d="M12 10v4" />
            </svg>
            <span>Avatar Walk</span>
          </button>

          <button
            type="button"
            className={`hud-nav-btn ${controlMode === 'overview' ? 'active' : ''}`}
            onClick={() => {
              selectApparatus(null);
              setControlMode('overview');
              setCameraPreset('classroom');
            }}
            title="Overview orbit view"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Orbit Overview</span>
          </button>
        </div>

        {/* 1st / 3rd Person Toggle (only in avatar walk mode) */}
        {controlMode === 'avatar' && (
          <button
            type="button"
            className="hud-nav-btn"
            onClick={togglePovMode}
            title={`Switch to ${povMode === 'first-person' ? '3rd-Person Follow' : '1st-Person Eye'} POV`}
            style={{ padding: '4px 9px', fontSize: '11px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{povMode === 'first-person' ? '1st Person' : '3rd Person'}</span>
          </button>
        )}

        {/* Focus Item button if an apparatus is selected */}
        {selectedApparatus && (
          <button
            type="button"
            className={`hud-nav-btn ${cameraPreset === 'closeup' && controlMode === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setControlMode('overview');
              setCameraPreset('closeup');
            }}
            style={{ padding: '4px 9px', fontSize: '11px', borderColor: 'rgba(56, 189, 248, 0.4)' }}
            title="Focus camera closeup on selected item"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ color: '#38bdf8' }}>Focus Item</span>
          </button>
        )}

        <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--hud-border)' }} />

        {/* Pointer Lock & Navigation Tip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--hud-text-muted)', fontSize: '11px' }}>
          {controlMode === 'avatar' ? (
            povMode === 'first-person' ? (
              <span>
                Look: <strong style={{ color: 'var(--hud-text-primary)' }}>Click canvas</strong> • Free cursor:{' '}
                <kbd className="hud-kbd">Esc</kbd>
              </span>
            ) : (
              <span>
                Move: <kbd className="hud-kbd">WASD</kbd> • Orbit: <strong style={{ color: 'var(--hud-text-primary)' }}>Drag</strong>
              </span>
            )
          ) : (
            <span>
              Orbit: <strong style={{ color: 'var(--hud-text-primary)' }}>Left Drag</strong> • Pan:{' '}
              <strong style={{ color: 'var(--hud-text-primary)' }}>Right Drag</strong>
            </span>
          )}
        </div>

        {/* Key Guide Toggle */}
        <button
          type="button"
          onClick={() => setShowKeyGuide(!showKeyGuide)}
          className="hud-nav-btn"
          title="View Keyboard Shortcuts & Laboratory Controls"
          style={{
            padding: '3px 8px',
            fontSize: '11px',
            backgroundColor: showKeyGuide ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            borderColor: showKeyGuide ? '#38bdf8' : 'var(--hud-border)',
            color: showKeyGuide ? '#7dd3fc' : 'var(--hud-text-muted)',
          }}
        >
          <span>⌨ Shortcuts</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Popover Modal */}
      {showKeyGuide && (
        <div
          className="hud-glass-panel hud-animate-fade"
          style={{
            position: 'absolute',
            bottom: '62px',
            left: '16px',
            width: '320px',
            padding: '14px 16px',
            pointerEvents: 'auto',
            zIndex: 25,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hud-text-primary)' }}>
              Keyboard & Laboratory Controls
            </span>
            <button
              type="button"
              onClick={() => setShowKeyGuide(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--hud-text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd cyan">W A S D</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Walk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd">Shift</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Sprint</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd cyan">E</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Inspect Item</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd green">F</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Pick Up / Place</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd green">P</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Pour / Aspirate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd cyan">T</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Turn Stopcock</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd pink">S</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Swirl Flask</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd purple">A</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Align Burette</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd cyan">M</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Measure pH/Temp</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="hud-kbd">Esc</kbd>
              <span style={{ color: 'var(--hud-text-secondary)' }}>Release Cursor</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--hud-border)',
              fontSize: '10px',
              color: 'var(--hud-text-muted)',
              lineHeight: 1.4,
            }}
          >
            Tip: In First-Person mode, clicking the 3D room locks your mouse for smooth looking. Press{' '}
            <kbd className="hud-kbd">Esc</kbd> anytime to free your cursor to click buttons or inspector panels.
          </div>
        </div>
      )}
    </>
  );
}
