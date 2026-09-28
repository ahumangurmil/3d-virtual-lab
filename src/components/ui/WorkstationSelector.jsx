import { useState } from 'react';
import { useLab } from '../../context/LabContext';

export function WorkstationSelector() {
  const {
    workstations,
    activeStationId,
    selectStation,
    teleportToStation,
    teleportPlayerTo,
    controlMode,
  } = useLab();

  const [isOpen, setIsOpen] = useState(false);

  const activeWs = workstations.find((ws) => ws.id === activeStationId) || workstations[0];

  const handleSelect = (stationId) => {
    if (controlMode === 'avatar') {
      teleportToStation(stationId);
    } else {
      selectStation(stationId);
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', pointerEvents: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Main Station Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="hud-nav-btn"
          title="Change Workstation Location"
          style={{
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(30, 41, 59, 0.75)',
            borderColor: isOpen ? 'var(--hud-accent)' : 'var(--hud-border)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeWs?.type === 'teacher' ? 'Teacher Demo' : `Station ${activeWs?.stationNumber}: ${activeWs?.name}`}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--hud-text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
        </button>

        {/* Quick Teleport Button */}
        <button
          type="button"
          onClick={() => teleportToStation(activeStationId)}
          className="hud-nav-btn"
          title="Teleport avatar directly in front of this station"
          style={{ padding: '5px 8px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span style={{ fontSize: '11px' }}>Teleport</span>
        </button>

        {/* Classroom Entrance Reset */}
        <button
          type="button"
          onClick={() => teleportPlayerTo(0, 8.5, Math.PI)}
          className="hud-nav-btn"
          title="Return to classroom entrance"
          style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--hud-text-muted)' }}
        >
          Entrance
        </button>
      </div>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          className="hud-glass hud-animate-fade"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '240px',
            padding: '6px',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--hud-text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            Laboratory Workstations
          </div>

          {workstations.map((ws) => {
            const isSelected = ws.id === activeStationId;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleSelect(ws.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isSelected ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
                  color: isSelected ? '#38bdf8' : 'var(--hud-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: ws.type === 'teacher' ? '#f59e0b' : '#38bdf8',
                      flexShrink: 0,
                    }}
                  />
                  <span>{ws.type === 'teacher' ? '★ ' + ws.name : `Station ${ws.stationNumber}: ${ws.name}`}</span>
                </div>
                {isSelected && <span style={{ fontSize: '11px', color: '#38bdf8' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
