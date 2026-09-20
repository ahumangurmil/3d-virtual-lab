import { useLab } from '../../context/LabContext';

export function LabHUD() {
  const {
    selectedApparatus,
    selectApparatus,
    cameraPreset,
    setCameraPreset,
    updateApparatusState,
  } = useLab();

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
        {/* Lab Brand & Title */}
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
              3D Virtual Chemistry Laboratory
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
              Interactive Practical Workstation • Class 11–12
            </p>
          </div>
        </div>

        {/* Camera Perspective Controls */}
        <div
          className="hud-panel"
          style={{
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
            Camera:
          </span>

          <button
            type="button"
            className={`hud-btn ${cameraPreset === 'workbench' ? 'active' : ''}`}
            onClick={() => setCameraPreset('workbench')}
            title="Standard workbench perspective"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Workbench
          </button>

          <button
            type="button"
            className={`hud-btn ${cameraPreset === 'overview' ? 'active' : ''}`}
            onClick={() => setCameraPreset('overview')}
            title="Wide laboratory overview perspective"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            Overview
          </button>

          <button
            type="button"
            className={`hud-btn ${cameraPreset === 'closeup' ? 'active' : ''}`}
            onClick={() => setCameraPreset('closeup')}
            title="Equipment focus perspective"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Focus View
          </button>
        </div>
      </header>

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
            gap: '16px',
            fontSize: '12px',
            color: '#475569',
          }}
        >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <kbd style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 6px', borderRadius: '4px', color: '#0284c7', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>Click Item</kbd>
            <span>Inspect</span>
          </div>
        </div>
      </footer>

      {/* ================= RIGHT INSPECTION DRAWER / INFO PANEL ================= */}
      {selectedApparatus && (
        <aside
          className="hud-panel"
          style={{
            position: 'absolute',
            top: '80px',
            right: '16px',
            width: '320px',
            maxHeight: 'calc(100vh - 110px)',
            overflowY: 'auto',
            padding: '20px',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                Apparatus Guide
              </span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
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
          <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#334155', marginBottom: '16px' }}>
            {selectedApparatus.description}
          </p>

          {/* Specifications Table */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
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

          {/* Interactive Apparatus Controls */}
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
                  updateApparatusState(selectedApparatus.id, { isIgnited: !selectedApparatus.isIgnited })
                }
              >
                <span style={{ fontSize: '15px' }}>{selectedApparatus.isIgnited ? '🔥' : '⚡'}</span>
                {selectedApparatus.isIgnited ? 'Extinguish Burner Flame' : 'Ignite Bunsen Burner'}
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
                  marginBottom: '6px',
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
            }}
            onClick={() => setCameraPreset('closeup')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Focus Camera on Apparatus
          </button>
        </aside>
      )}
    </div>
  );
}

