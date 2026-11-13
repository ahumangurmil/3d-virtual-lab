import { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { EXPERIMENT_STATUS } from '../../experiments/experimentTypes';

export function ExperimentPanel() {
  const {
    titrationState,
    startTitration,
    resetTitration,
    executeTitrationStepAction,
    setTitrationStudentReading,
    heldApparatus,
    targetApparatus,
  } = useLab();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [readingInput, setReadingInput] = useState('');
  const [demoAssistEnabled, setDemoAssistEnabled] = useState(false);

  if (!titrationState) return null;

  const {
    title,
    status,
    currentStep,
    totalSteps,
    completedSteps,
    requiredEquipmentStatus,
    hclVolume,
    hclConcentration,
    naohVolume,
    naohConcentration,
    buretteDispensedVolume,
    indicatorAdded,
    endpointDetected,
    lastFeedback,
  } = titrationState;

  const isIdle = status === EXPERIMENT_STATUS.IDLE;
  const isCompleted = status === EXPERIMENT_STATUS.COMPLETED;
  const progressPercent = Math.round(((completedSteps.length) / totalSteps) * 100);
  const equipmentItems = Object.values(requiredEquipmentStatus || {});

  const getStepLabActionGuide = (stepNum) => {
    switch (stepNum) {
      case 1:
        return 'Walk to a student bench and inspect [E] or pick up [F] each of the 5 apparatus items below.';
      case 2:
        return 'Pick up the 25 mL Pipette [F] -> aim at HCl Beaker & press [P] to aspirate -> aim at Conical Flask & press [P] to dispense -> place pipette [F].';
      case 3:
        return 'Pick up Phenolphthalein Bottle [F] -> aim at Conical Flask & press [P] to add 3 drops -> place bottle [F].';
      case 4:
        return 'Pick up NaOH Supply Beaker [F] -> aim at 50 mL Burette & press [P] twice to fill to 50.0 mL -> place beaker [F].';
      case 5:
        return 'Aim at Conical Flask and press [A] (or pick up [F] and place it directly beneath the burette tip).';
      case 6:
        return 'Aim at the 50 mL Burette and press [T] to dispense an initial volume of NaOH.';
      case 7:
        return 'Aim at the Conical Flask and press [S] to physically swirl and mix the solution.';
      case 8:
        return 'Dispense NaOH gradually ([T] 5 mL, then [G] 0.1 mL drops near 25 mL) and swirl ([S]) until persistent faint pink (pH >= 8.2).';
      case 9:
        return 'Aim at the Burette and press [M] or [E] to read the remaining volume, then enter the dispensed mL below.';
      default:
        return '';
    }
  };

  const handleReadingSubmit = (e) => {
    e?.preventDefault();
    if (readingInput.trim()) {
      setTitrationStudentReading(readingInput.trim());
    }
  };

  // ================= COLLAPSED STRIP VIEW =================
  if (isCollapsed) {
    return (
      <div
        className="hud-glass hud-animate-fade"
        style={{
          position: 'absolute',
          top: '68px',
          left: '16px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
          zIndex: 20,
          cursor: 'pointer',
        }}
        onClick={() => setIsCollapsed(false)}
        title="Click to expand experiment guide"
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isCompleted ? '#10b981' : isIdle ? '#94a3b8' : '#38bdf8',
            boxShadow: isCompleted ? '0 0 6px #10b981' : !isIdle ? '0 0 6px #38bdf8' : 'none',
          }}
        />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hud-text-primary)' }}>
          {title}
        </span>
        {!isIdle && (
          <span className="hud-tag cyan" style={{ fontSize: '10px', padding: '1px 6px' }}>
            Step {currentStep ? currentStep.stepNumber : totalSteps}/{totalSteps} ({progressPercent}%)
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--hud-text-muted)',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '2px',
          }}
        >
          ▲ Expand
        </button>
      </div>
    );
  }

  // ================= EXPANDED CARD VIEW =================
  return (
    <div
      id="titration-guide-hud"
      className="hud-glass-panel hud-animate-fade hud-custom-scroll"
      style={{
        position: 'absolute',
        top: '68px',
        left: '16px',
        width: '320px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 88px)',
        overflowY: 'auto',
        pointerEvents: 'auto',
        zIndex: 20,
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--hud-border)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isCompleted ? '#10b981' : isIdle ? '#94a3b8' : '#38bdf8',
              boxShadow: isCompleted ? '0 0 8px #10b981' : !isIdle ? '0 0 8px #38bdf8' : 'none',
            }}
          />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hud-text-primary)' }}>
              {title}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--hud-text-muted)' }}>Class 11–12 Practical</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isIdle && (
            <span className={`hud-tag ${isCompleted ? 'green' : 'cyan'}`}>
              Step {currentStep ? currentStep.stepNumber : totalSteps}/{totalSteps}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            title="Minimize experiment guide to save screen space"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--hud-text-muted)',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: '12px',
            }}
          >
            ▼
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        {/* Progress Bar */}
        {!isIdle && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--hud-text-muted)', marginBottom: '4px' }}>
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div
              style={{
                height: '4px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
            <p style={{ fontSize: '12px', color: 'var(--hud-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              Standard acid–base titration: titrate 25 mL of 0.1 M HCl analyte with standardized 0.1 M NaOH
              titrant using phenolphthalein to detect the neutral endpoint.
            </p>
            <button
              id="btn-start-titration"
              type="button"
              onClick={startTitration}
              className="hud-action-btn primary"
              style={{ width: '100%', padding: '9px 12px' }}
            >
              <span>Start Titration Experiment</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Current Step Instruction Card */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid var(--hud-border)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#38bdf8',
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {isCompleted ? 'Experiment Completed' : `Step ${currentStep?.stepNumber}: ${currentStep?.title}`}
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hud-text-primary)', lineHeight: 1.4 }}>
                {isCompleted
                  ? 'All titration steps and measurements verified successfully!'
                  : currentStep?.instruction}
              </div>

              {!isCompleted && currentStep?.hint && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: 'var(--hud-text-muted)',
                    lineHeight: 1.35,
                  }}
                >
                  💡 {currentStep.hint}
                </div>
              )}
            </div>

            {/* Step 1 Live Equipment Checklist */}
            {!isCompleted && currentStep?.stepNumber === 1 && equipmentItems.length > 0 && (
              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid var(--hud-border)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#94a3b8',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  Required Apparatus ({equipmentItems.filter((eq) => eq.collected).length}/{equipmentItems.length} Verified)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {equipmentItems.map((eq) => (
                    <div
                      key={eq.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: eq.collected ? '#6ee7b7' : 'var(--hud-text-secondary)',
                      }}
                    >
                      <span>
                        {eq.collected ? '✓' : '○'} {eq.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: eq.collected ? '#34d399' : eq.present ? '#fbbf24' : '#94a3b8',
                        }}
                      >
                        {eq.collected ? 'Verified' : eq.present ? 'On bench' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physical 3D Lab Controls Card */}
            {!isCompleted && currentStep && (
              <div
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#38bdf8',
                    fontWeight: 700,
                    marginBottom: '3px',
                  }}
                >
                  Perform In 3D Lab
                </div>
                <div style={{ fontSize: '11px', color: 'var(--hud-text-secondary)', lineHeight: 1.4 }}>
                  {getStepLabActionGuide(currentStep.stepNumber)}
                </div>
              </div>
            )}

            {/* Step 9 Reading Form */}
            {!isCompleted && currentStep?.stepNumber === 9 && (
              <form onSubmit={handleReadingSubmit} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 25.0"
                  value={readingInput}
                  onChange={(e) => setReadingInput(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--hud-border)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#ffffff',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="hud-action-btn success">
                  Submit
                </button>
              </form>
            )}

            {/* Context Awareness: Hands / Target items */}
            {!isCompleted && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--hud-text-muted)' }}>Holding: </span>
                  <span style={{ color: heldApparatus ? '#38bdf8' : 'var(--hud-text-secondary)', fontWeight: 600 }}>
                    {heldApparatus ? heldApparatus.name : 'Hands Empty'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--hud-text-muted)' }}>Target: </span>
                  <span style={{ color: targetApparatus ? '#a78bfa' : 'var(--hud-text-secondary)', fontWeight: 600 }}>
                    {targetApparatus ? targetApparatus.name : 'None'}
                  </span>
                </div>
              </div>
            )}

            {/* Feedback alert callout if present */}
            {lastFeedback?.message && (
              <div
                style={{
                  fontSize: '11px',
                  lineHeight: 1.35,
                  padding: '7px 10px',
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
                      : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${
                    lastFeedback.type === 'error'
                      ? 'rgba(239, 68, 68, 0.35)'
                      : lastFeedback.type === 'warning'
                      ? 'rgba(245, 158, 11, 0.35)'
                      : 'rgba(16, 185, 129, 0.35)'
                  }`,
                  color:
                    lastFeedback.type === 'error'
                      ? '#fca5a5'
                      : lastFeedback.type === 'warning'
                      ? '#fde68a'
                      : '#6ee7b7',
                }}
              >
                <span>{lastFeedback.type === 'warning' ? '⚠' : lastFeedback.type === 'error' ? '✕' : '✓'}</span>
                <span>{lastFeedback.message}</span>
              </div>
            )}

            {/* Telemetry Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                padding: '8px 10px',
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                borderRadius: '6px',
                border: '1px solid var(--hud-border)',
                fontSize: '10px',
                marginBottom: '10px',
              }}
            >
              <div>
                <div style={{ color: 'var(--hud-text-muted)' }}>HCl Analyte</div>
                <div style={{ color: 'var(--hud-text-primary)', fontWeight: 600 }}>
                  {hclVolume.toFixed(1)} mL ({hclConcentration} M)
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--hud-text-muted)' }}>NaOH Burette</div>
                <div style={{ color: 'var(--hud-text-primary)', fontWeight: 600 }}>
                  {naohVolume.toFixed(1)} mL ({naohConcentration} M)
                  {completedSteps.includes(4) ? ` • Used ${buretteDispensedVolume.toFixed(1)} mL` : ''}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--hud-text-muted)' }}>Indicator</div>
                <div style={{ color: indicatorAdded ? '#f472b6' : 'var(--hud-text-muted)', fontWeight: 600 }}>
                  {indicatorAdded ? 'Added' : 'Pending'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--hud-text-muted)' }}>Endpoint</div>
                <div style={{ color: endpointDetected ? '#10b981' : 'var(--hud-text-muted)', fontWeight: 600 }}>
                  {endpointDetected ? 'Reached' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Action Bar (Reset + Optional Demo/Accessibility Mode) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '10px',
                    color: 'var(--hud-text-muted)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  title="Optional instructor/accessibility helper toggle (off by default)"
                >
                  <input
                    type="checkbox"
                    checked={demoAssistEnabled}
                    onChange={(e) => setDemoAssistEnabled(e.target.checked)}
                    style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                  <span>Demo / Accessibility Mode</span>
                </label>

                <button
                  type="button"
                  onClick={resetTitration}
                  className="hud-action-btn"
                  style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--hud-text-muted)' }}
                >
                  Reset
                </button>
              </div>

              {demoAssistEnabled && !isCompleted && currentStep && currentStep.stepNumber !== 9 && (
                <button
                  type="button"
                  onClick={executeTitrationStepAction}
                  className="hud-action-btn primary"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '11px' }}
                  title="Optional accessibility/demo helper for the current step"
                >
                  <span>Demo Assist: Step {currentStep.stepNumber}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
