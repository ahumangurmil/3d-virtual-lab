import { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { EXPERIMENT_STATUS } from '../../experiments/experimentTypes';

/**
 * Compact, Unobtrusive Guided Workflow HUD for Acid–Base Titration.
 * Conforms to HUD theme and non-screen-blocking guidelines.
 */
export function TitrationGuideHUD() {
  const {
    titrationState,
    startTitration,
    resetTitration,
    setTitrationStudentReading,
    heldApparatus,
    targetApparatus,
  } = useLab();

  const [isMinimized, setIsMinimized] = useState(false);
  const [readingInput, setReadingInput] = useState('');

  if (!titrationState) return null;

  const {
    title,
    status,
    currentStep,
    totalSteps,
    completedSteps,
    hclVolume,
    hclConcentration,
    naohVolume,
    naohConcentration,
    indicatorAdded,
    endpointDetected,
    lastFeedback,
  } = titrationState;

  const isIdle = status === EXPERIMENT_STATUS.IDLE;
  const isCompleted = status === EXPERIMENT_STATUS.COMPLETED;
  const progressPercent = Math.round(((completedSteps.length) / totalSteps) * 100);

  const handleReadingSubmit = (e) => {
    e?.preventDefault();
    if (readingInput.trim()) {
      setTitrationStudentReading(readingInput.trim());
    }
  };

  return (
    <div
      id="titration-guide-hud"
      style={{
        position: 'absolute',
        top: '76px',
        left: '16px',
        width: '340px',
        maxWidth: 'calc(100vw - 32px)',
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(51, 65, 85, 0.7)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.36)',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        pointerEvents: 'auto',
        zIndex: 15,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: isMinimized ? 'none' : '1px solid rgba(51, 65, 85, 0.5)',
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isCompleted ? '#10b981' : isIdle ? '#94a3b8' : '#38bdf8',
              boxShadow: isCompleted
                ? '0 0 8px #10b981'
                : !isIdle
                ? '0 0 8px #38bdf8'
                : 'none',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.02em' }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isIdle && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 7px',
                borderRadius: '9999px',
                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                color: isCompleted ? '#34d399' : '#38bdf8',
                border: isCompleted
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              Step {currentStep ? currentStep.stepNumber : totalSteps} / {totalSteps}
            </span>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand Guide' : 'Minimize Guide'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: '14px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isMinimized ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Minimized Quick Line */}
      {isMinimized && currentStep && !isIdle && (
        <div
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            color: '#cbd5e1',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentStep.instruction}
        </div>
      )}

      {/* Expanded Body */}
      {!isMinimized && (
        <div style={{ padding: '12px 14px' }}>
          {/* Progress Bar */}
          {!isIdle && (
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* If Idle: Start screen */}
          {isIdle ? (
            <div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                Standard volumetric titration: titrating 25 mL of 0.1 M HCl analyte with 0.1 M NaOH
                titrant to a persistent phenolphthalein pink endpoint.
              </p>
              <button
                id="btn-start-titration"
                onClick={startTitration}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
                }}
              >
                Start Titration Experiment
              </button>
            </div>
          ) : (
            <div>
              {/* Step Title & Instruction */}
              <div style={{ marginBottom: '10px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#38bdf8',
                    fontWeight: '600',
                    marginBottom: '2px',
                  }}
                >
                  {isCompleted ? 'Experiment Completed' : `Step ${currentStep?.stepNumber}: ${currentStep?.title}`}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#f1f5f9',
                    lineHeight: '1.4',
                  }}
                >
                  {isCompleted
                    ? 'All titration steps and measurements verified successfully!'
                    : currentStep?.instruction}
                </div>
              </div>

              {/* Step Hint */}
              {!isCompleted && currentStep?.hint && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    borderLeft: '2px solid #38bdf8',
                  }}
                >
                  {currentStep.hint}
                </div>
              )}

              {/* Step 9 Reading Input */}
              {!isCompleted && currentStep?.stepNumber === 9 && (
                <form
                  onSubmit={handleReadingSubmit}
                  style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}
                >
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 25.0"
                    value={readingInput}
                    onChange={(e) => setReadingInput(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontWeight: '600',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Submit
                  </button>
                </form>
              )}

              {/* Physical Lab Action Guidance Card */}
              {!isCompleted && currentStep && currentStep.stepNumber !== 9 && (
                <div
                  id="titration-action-guide-card"
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>🔬</span>
                      <span>Perform Action In 3D Lab</span>
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#34d399',
                        fontWeight: '600',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      Student Lab Action
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.45, marginBottom: '8px' }}>
                    {currentStep.stepNumber === 1 && (
                      <div>
                        Verify all 5 items on your workbench: <b>Conical Flask</b>, <b>Burette</b>, <b>Beakers</b> (HCl &amp; NaOH), <b>25 mL Pipette</b>, and <b>Indicator Dropper</b>. Walk up and press <b>[F]</b> to inspect or pick up.
                      </div>
                    )}
                    {currentStep.stepNumber === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div>1. Walk to the <b>25 mL Volumetric Pipette</b> and press <b>[F]</b> to pick it up.</div>
                        <div>2. Target the <b>0.1 M HCl Beaker</b> and press <b>[P]</b> to aspirate 25 mL.</div>
                        <div>3. Move to the <b>Conical Flask</b> and press <b>[P]</b> to dispense.</div>
                      </div>
                    )}
                    {currentStep.stepNumber === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div>1. Walk to the <b>Indicator Dropper Bottle</b> and press <b>[F]</b> to pick it up.</div>
                        <div>2. Target the <b>Conical Flask</b> and press <b>[P]</b> to add 3 drops of phenolphthalein.</div>
                      </div>
                    )}
                    {currentStep.stepNumber === 4 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div>1. Walk to the <b>0.1 M NaOH Beaker</b> and press <b>[F]</b> to pick it up.</div>
                        <div>2. Target the <b>50 mL Burette</b> and press <b>[P]</b> to fill to the 50 mL line.</div>
                      </div>
                    )}
                    {currentStep.stepNumber === 5 && (
                      <div>
                        Position the <b>Conical Flask</b> directly on the retort stand base plate beneath the burette tip. Press <b>[A]</b> to align securely.
                      </div>
                    )}
                    {currentStep.stepNumber === 6 && (
                      <div>
                        Press <b>[T]</b> to open the burette stopcock and begin dispensing standardized 0.1 M NaOH into the conical flask.
                      </div>
                    )}
                    {currentStep.stepNumber === 7 && (
                      <div>
                        Press <b>[S]</b> to swirl the conical flask and observe the transient pink flashes in the drop zone.
                      </div>
                    )}
                    {currentStep.stepNumber === 8 && (
                      <div>
                        Dispense dropwise. When a single drop produces a persistent faint pink color (pH ≥ 8.2), press <b>[T]</b> to close the stopcock.
                      </div>
                    )}
                  </div>

                  {/* Real-time apparatus context */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      borderTop: '1px solid rgba(51, 65, 85, 0.4)',
                      paddingTop: '6px',
                      fontSize: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Carrying:</span>
                      <span style={{ color: heldApparatus ? '#38bdf8' : '#94a3b8', fontWeight: '500' }}>
                        {heldApparatus
                          ? `${heldApparatus.name} ${heldApparatus.liquid?.volume > 0 ? `(${heldApparatus.liquid.volume} mL)` : ''}`
                          : 'Hands empty ([F] to pick up)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Targeting:</span>
                      <span style={{ color: targetApparatus ? '#a78bfa' : '#94a3b8', fontWeight: '500' }}>
                        {targetApparatus ? targetApparatus.name : 'None (look closely at equipment)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mistake / Feedback Callout */}
              {lastFeedback && lastFeedback.message && (
                <div
                  style={{
                    fontSize: '11px',
                    lineHeight: '1.35',
                    padding: '6px 9px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    backgroundColor:
                      lastFeedback.type === 'error'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : lastFeedback.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : lastFeedback.type === 'success'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(56, 189, 248, 0.12)',
                    border:
                      lastFeedback.type === 'error'
                        ? '1px solid rgba(239, 68, 68, 0.35)'
                        : lastFeedback.type === 'warning'
                        ? '1px solid rgba(245, 158, 11, 0.35)'
                        : lastFeedback.type === 'success'
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : '1px solid rgba(56, 189, 248, 0.25)',
                    color:
                      lastFeedback.type === 'error'
                        ? '#fca5a5'
                        : lastFeedback.type === 'warning'
                        ? '#fcd34d'
                        : lastFeedback.type === 'success'
                        ? '#6ee7b7'
                        : '#7dd3fc',
                  }}
                >
                  <span style={{ fontWeight: '700' }}>
                    {lastFeedback.type === 'warning' ? '⚠' : lastFeedback.type === 'error' ? '✕' : 'ℹ'}
                  </span>
                  <span>{lastFeedback.message}</span>
                </div>
              )}

              {/* Compact Titration Metrics Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '6px',
                  padding: '6px 8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '6px',
                  border: '1px solid rgba(51, 65, 85, 0.4)',
                  fontSize: '10px',
                  color: '#94a3b8',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <div style={{ color: '#64748b' }}>HCl Analyte</div>
                  <div style={{ color: '#f8fafc', fontWeight: '600' }}>
                    {hclVolume.toFixed(1)} mL ({hclConcentration} M)
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>NaOH Burette</div>
                  <div style={{ color: '#f8fafc', fontWeight: '600' }}>
                    {naohVolume.toFixed(1)} mL ({naohConcentration} M)
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>Indicator</div>
                  <div style={{ color: indicatorAdded ? '#f472b6' : '#94a3b8', fontWeight: '600' }}>
                    {indicatorAdded ? 'Added' : 'None'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>Endpoint</div>
                  <div style={{ color: endpointDetected ? '#ec4899' : '#94a3b8', fontWeight: '600' }}>
                    {endpointDetected ? 'Reached' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Bottom Controls: Reset */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={resetTitration}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    color: '#94a3b8',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Reset Experiment
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
