import { useLab } from '../../context/LabContext';

export function InteractionPrompt() {
  const {
    controlMode,
    povMode,
    targetApparatus,
    heldApparatus,
    placementState,
    selectApparatus,
    pickUpApparatus,
    placeApparatus,
    pourLiquid,
    turnBuretteStopcock,
    swirlConicalFlask,
    alignFlaskUnderBurette,
  } = useLab();

  const isFirstPerson = controlMode === 'avatar' && povMode === 'first-person';

  return (
    <>
      {/* Precision First-Person Reticle */}
      {isFirstPerson && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: targetApparatus ? '8px' : '5px',
            height: targetApparatus ? '8px' : '5px',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            borderRadius: '50%',
            backgroundColor: targetApparatus ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)',
            boxShadow: targetApparatus
              ? '0 0 8px rgba(56, 189, 248, 0.95), 0 0 16px rgba(56, 189, 248, 0.4)'
              : '0 0 3px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 30,
          }}
        />
      )}

      {/* Contextual Interaction Prompt: Targeting Object */}
      {targetApparatus && !heldApparatus && (
        <div
          className="hud-animate-fade"
          style={{
            position: 'absolute',
            top: 'calc(50% + 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 9px',
              borderRadius: '6px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              color: '#ffffff',
              fontSize: '11px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {/* Target Item Name Label */}
            <span style={{ color: '#94a3b8', fontWeight: 600, marginRight: '2px' }}>
              {targetApparatus.name}:
            </span>

            {/* [E] Inspect */}
            <button
              type="button"
              onClick={() => selectApparatus(targetApparatus.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                padding: '1px 2px',
              }}
              title={`Inspect details of ${targetApparatus.name}`}
            >
              <kbd className="hud-kbd cyan">E</kbd>
              <span>Inspect</span>
            </button>

            {/* [F] Pick Up (if pickable) */}
            {targetApparatus.isPickable && (
              <>
                <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
                <button
                  type="button"
                  onClick={() => pickUpApparatus(targetApparatus.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '1px 2px',
                  }}
                  title={`Pick up ${targetApparatus.name}`}
                >
                  <kbd className="hud-kbd green">F</kbd>
                  <span>Pick Up</span>
                </button>
              </>
            )}

            {/* [T] Turn Burette Stopcock */}
            {targetApparatus.type === 'burette_50' && (
              <>
                <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
                <button
                  type="button"
                  onClick={() => turnBuretteStopcock(10)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '1px 2px',
                  }}
                  title="Turn Burette Stopcock to dispense titrant [T]"
                >
                  <kbd className="hud-kbd cyan">T</kbd>
                  <span>Stopcock</span>
                </button>
              </>
            )}

            {/* [S] Swirl & [A] Align for Conical Flask */}
            {targetApparatus.type === 'conical_flask_250' && (
              <>
                <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
                <button
                  type="button"
                  onClick={() => swirlConicalFlask(targetApparatus.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f472b6',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '1px 2px',
                  }}
                  title="Swirl flask to mix solution [S]"
                >
                  <kbd className="hud-kbd pink">S</kbd>
                  <span>Swirl</span>
                </button>

                <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
                <button
                  type="button"
                  onClick={() => alignFlaskUnderBurette()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#c4b5fd',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '1px 2px',
                  }}
                  title="Position conical flask directly beneath burette [A]"
                >
                  <kbd className="hud-kbd purple">A</kbd>
                  <span>Align</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contextual Interaction Prompt: Holding Apparatus (Valid Placement) */}
      {heldApparatus && placementState?.isValid && (
        <div
          className="hud-animate-fade"
          style={{
            position: 'absolute',
            top: 'calc(50% + 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 9px',
              borderRadius: '6px',
              backgroundColor: 'rgba(6, 78, 59, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              color: '#ffffff',
              fontSize: '11px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            <button
              type="button"
              onClick={placeApparatus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                border: 'none',
                padding: '0',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              <kbd className="hud-kbd green">F</kbd>
              <span>Place {heldApparatus.name} on {placementState.surfaceName || 'Benchtop'}</span>
            </button>

            {/* If also targeting another container, offer Pour / Aspirate */}
            {targetApparatus && (targetApparatus.capacity || targetApparatus.liquid) && (
              <>
                <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>•</span>
                <button
                  type="button"
                  onClick={() => pourLiquid(heldApparatus.id, targetApparatus.id, 25)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#7dd3fc',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                  title={
                    heldApparatus.type === 'pipette_25'
                      ? 'Aspirate / Dispense 25 mL [P]'
                      : `Transfer liquid into ${targetApparatus.name} [P]`
                  }
                >
                  <kbd className="hud-kbd cyan">P</kbd>
                  <span>
                    {heldApparatus.type === 'pipette_25'
                      ? (heldApparatus.liquid?.volume || 0) < 5
                        ? 'Aspirate 25 mL'
                        : 'Dispense 25 mL'
                      : 'Transfer Liquid'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contextual Interaction Prompt: Holding Apparatus (Invalid Surface Warning) */}
      {heldApparatus && !placementState?.isValid && (
        <div
          className="hud-animate-fade"
          style={{
            position: 'absolute',
            top: 'calc(50% + 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            pointerEvents: 'none',
            maxWidth: '320px',
            width: 'max-content',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(40, 20, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(248, 113, 113, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              color: '#fca5a5',
              fontSize: '11px',
              lineHeight: 1.25,
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#f87171', fontWeight: 700 }}>⊘</span>
            <span>{placementState?.reason || 'Look at a laboratory benchtop to place.'}</span>
          </div>
        </div>
      )}
    </>
  );
}
