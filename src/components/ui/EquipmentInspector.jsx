import { useLab } from '../../context/LabContext';

export function EquipmentInspector() {
  const {
    selectedApparatus,
    selectApparatus,
    heldApparatusId,
    heldApparatus,
    placementState,
    pickUpApparatus,
    placeApparatus,
    updateApparatusState,
    pourLiquid,
    addReagent,
    measureApparatus,
    heatApparatus,
    setCameraPreset,
    setControlMode,
  } = useLab();

  if (!selectedApparatus) {
    return null;
  }

  const isHeld = selectedApparatus.id === heldApparatusId;

  return (
    <aside
      className="hud-glass-panel hud-animate-slide-right hud-custom-scroll"
      style={{
        position: 'absolute',
        top: '68px',
        right: '16px',
        width: '320px',
        maxHeight: 'calc(100vh - 88px)',
        overflowY: 'auto',
        padding: '16px',
        pointerEvents: 'auto',
        zIndex: 25,
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--hud-border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span className="hud-tag cyan">Apparatus Guide</span>
            {selectedApparatus.stationName && (
              <span className="hud-tag teal">{selectedApparatus.stationName}</span>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--hud-text-primary)' }}>
            {selectedApparatus.name}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => selectApparatus(null)}
          title="Close Inspector (Esc)"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--hud-border)',
            color: 'var(--hud-text-muted)',
            borderRadius: '6px',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--hud-text-muted)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--hud-text-secondary)', margin: '0 0 12px 0' }}>
        {selectedApparatus.description}
      </p>

      {/* Pickup / Placement Quick Action Button */}
      <div style={{ marginBottom: '14px' }}>
        {isHeld ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={placeApparatus}
              disabled={!placementState?.isValid}
              className={`hud-action-btn ${placementState?.isValid ? 'success' : ''}`}
              style={{ width: '100%' }}
            >
              <span>Place on Benchtop [F]</span>
            </button>
            <div
              style={{
                fontSize: '10px',
                textAlign: 'center',
                color: placementState?.isValid ? '#34d399' : '#fbbf24',
                fontWeight: 500,
              }}
            >
              {placementState?.isValid
                ? `Ready to place on ${placementState.surfaceName}`
                : placementState?.reason || 'Look at benchtop surface to place'}
            </div>
          </div>
        ) : selectedApparatus.isPickable ? (
          <button
            type="button"
            onClick={() => pickUpApparatus(selectedApparatus.id)}
            className="hud-action-btn primary"
            style={{ width: '100%' }}
          >
            <span>Pick Up Apparatus [F]</span>
          </button>
        ) : (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--hud-border)',
              fontSize: '11px',
              color: 'var(--hud-text-muted)',
              textAlign: 'center',
            }}
          >
            Fixed Station Apparatus
          </div>
        )}
      </div>

      {/* Apparatus Specifications & State Grid */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid var(--hud-border)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--hud-text-muted)' }}>Status:</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: isHeld ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: isHeld ? '#38bdf8' : 'var(--hud-text-secondary)',
            }}
          >
            {isHeld ? 'Held in Hands' : selectedApparatus.currentSurface || 'On Benchtop'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--hud-text-muted)' }}>Capacity:</span>
          <span style={{ color: 'var(--hud-text-primary)', fontWeight: 600 }}>
            {typeof selectedApparatus.capacity === 'number'
              ? `${selectedApparatus.capacity} mL`
              : selectedApparatus.capacity || 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--hud-text-muted)' }}>Current Volume:</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>
            {selectedApparatus.liquid?.volume ?? selectedApparatus.volume ?? 0} mL
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--hud-text-muted)' }}>Chemical Solution:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {selectedApparatus.liquid?.color && (
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: selectedApparatus.liquid.color,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-block',
                }}
              />
            )}
            <span style={{ color: 'var(--hud-text-primary)', fontWeight: 600 }}>
              {selectedApparatus.liquid?.name ||
                (typeof selectedApparatus.contents === 'string'
                  ? selectedApparatus.contents
                  : 'Empty')}
            </span>
          </div>
        </div>

        {((selectedApparatus.concentration !== undefined && selectedApparatus.concentration !== null) ||
          selectedApparatus.solution?.concentration !== undefined) && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--hud-text-muted)' }}>Concentration:</span>
            <span style={{ color: 'var(--hud-text-primary)', fontWeight: 600 }}>
              {selectedApparatus.concentration ?? selectedApparatus.solution?.concentration} M
            </span>
          </div>
        )}

        {(selectedApparatus.liquid?.ph !== undefined || selectedApparatus.ph !== undefined) && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--hud-text-muted)' }}>Measured pH:</span>
            <span style={{ color: '#f472b6', fontWeight: 600 }}>
              {selectedApparatus.liquid?.ph ?? selectedApparatus.ph}
            </span>
          </div>
        )}

        {(selectedApparatus.liquid?.temperature !== undefined || selectedApparatus.temperature !== undefined) && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--hud-text-muted)' }}>Temperature:</span>
            <span style={{ color: '#fb923c', fontWeight: 600 }}>
              {selectedApparatus.liquid?.temperature ?? selectedApparatus.temperature} °C
            </span>
          </div>
        )}

        {/* Test tube rack tubes overview */}
        {selectedApparatus.tubes && (
          <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid var(--hud-border)' }}>
            <span style={{ color: 'var(--hud-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Rack Tubes:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
              {selectedApparatus.tubes.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: t.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'var(--hud-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bunsen Burner Flame Control */}
      {selectedApparatus.type === 'bunsen_burner' && (
        <div style={{ marginBottom: '14px' }}>
          <button
            type="button"
            className={`hud-action-btn ${selectedApparatus.isIgnited ? 'danger' : 'success'}`}
            style={{ width: '100%', padding: '9px' }}
            onClick={() =>
              updateApparatusState(selectedApparatus.id, {
                isIgnited: !selectedApparatus.isIgnited,
              })
            }
          >
            <span>{selectedApparatus.isIgnited ? 'Extinguish Flame' : 'Ignite Bunsen Flame'}</span>
          </button>
        </div>
      )}

      {/* Liquid Volume Slider */}
      {selectedApparatus.liquid && (
        <div
          style={{
            marginBottom: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid var(--hud-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
            <span style={{ color: 'var(--hud-text-muted)' }}>Adjust Volume:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedApparatus.liquid.volume} mL</span>
          </div>
          <input
            type="range"
            min="0"
            max={selectedApparatus.liquid.maxVolume || selectedApparatus.capacity || 100}
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
            style={{ width: '100%', accentColor: 'var(--hud-accent)', cursor: 'pointer' }}
          />
        </div>
      )}

      {/* Chemistry Actions & Reagent Shortcuts */}
      {(selectedApparatus.capacity || selectedApparatus.liquid) && (
        <div
          style={{
            marginBottom: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--hud-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'var(--hud-text-muted)', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase' }}>
              Experiment Actions
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => heatApparatus(selectedApparatus.id, 5)}
                className="hud-action-btn"
                style={{ padding: '3px 7px', fontSize: '10px', color: '#fb923c' }}
                title="Gently warm solution (+5 °C)"
              >
                +5°C Warm
              </button>
              <button
                type="button"
                onClick={() => measureApparatus(selectedApparatus.id)}
                className="hud-action-btn"
                style={{ padding: '3px 7px', fontSize: '10px', color: '#38bdf8' }}
                title="Measure pH, temperature, and volume [M]"
              >
                Measure [M]
              </button>
            </div>
          </div>

          {/* Quick Transfer Liquid if carrying another container */}
          {heldApparatus && heldApparatus.id !== selectedApparatus.id && (heldApparatus.capacity || heldApparatus.liquid) && (
            <button
              type="button"
              onClick={() => pourLiquid(heldApparatus.id, selectedApparatus.id, 25)}
              className="hud-action-btn"
              style={{
                width: '100%',
                marginBottom: '6px',
                borderColor: 'rgba(52, 211, 153, 0.4)',
                color: '#6ee7b7',
              }}
            >
              <span>Pour 25 mL from {heldApparatus.name}</span>
            </button>
          )}

          {/* Reagents Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
            <button
              type="button"
              onClick={() => addReagent(selectedApparatus.id, 'phenolphthalein', 2)}
              className="hud-action-btn"
              style={{ fontSize: '10px', padding: '5px' }}
              title="Add 2 drops phenolphthalein indicator"
            >
              + Indicator
            </button>
            <button
              type="button"
              onClick={() => addReagent(selectedApparatus.id, 'sodium-hydroxide', 10, 0.1)}
              className="hud-action-btn"
              style={{ fontSize: '10px', padding: '5px' }}
              title="Add 10 mL 0.1 M NaOH"
            >
              + 10mL NaOH
            </button>
            <button
              type="button"
              onClick={() => addReagent(selectedApparatus.id, 'hydrochloric-acid', 10, 0.1)}
              className="hud-action-btn"
              style={{ fontSize: '10px', padding: '5px' }}
              title="Add 10 mL 0.1 M HCl"
            >
              + 10mL HCl
            </button>
            <button
              type="button"
              onClick={() => addReagent(selectedApparatus.id, 'water', 20)}
              className="hud-action-btn"
              style={{ fontSize: '10px', padding: '5px' }}
              title="Add 20 mL deionized water"
            >
              + 20mL H₂O
            </button>
          </div>
        </div>
      )}

      {/* Safety Precaution Card */}
      {selectedApparatus.safetyNotes && (
        <div
          style={{
            borderLeft: '3px solid #f59e0b',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '8px 10px',
            borderRadius: '2px 6px 6px 2px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
              ⚠ Safety Note
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.4, color: '#fde68a' }}>
            {selectedApparatus.safetyNotes}
          </p>
        </div>
      )}

      {/* Focus In 3D Action */}
      <button
        type="button"
        className="hud-action-btn primary"
        style={{ width: '100%', padding: '8px' }}
        onClick={() => {
          setControlMode('overview');
          setCameraPreset('closeup');
        }}
      >
        <span>Focus Camera Closeup</span>
      </button>
    </aside>
  );
}
