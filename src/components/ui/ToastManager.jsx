import { useEffect } from 'react';
import { useLab } from '../../context/LabContext';

export function ToastManager() {
  const { interactionNotice, setInteractionNotice } = useLab();

  // Auto-dismiss after 4.5 seconds
  useEffect(() => {
    if (!interactionNotice) return;
    const timer = setTimeout(() => {
      setInteractionNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [interactionNotice, setInteractionNotice]);

  if (!interactionNotice) return null;

  const isWarning = interactionNotice.type === 'warning';
  const isError = interactionNotice.type === 'error';

  const bgColor = isError
    ? 'rgba(38, 14, 14, 0.92)'
    : isWarning
    ? 'rgba(40, 26, 12, 0.92)'
    : 'rgba(12, 42, 34, 0.92)';

  const borderColor = isError
    ? 'rgba(239, 68, 68, 0.45)'
    : isWarning
    ? 'rgba(245, 158, 11, 0.45)'
    : 'rgba(16, 185, 129, 0.45)';

  const textColor = isError ? '#fca5a5' : isWarning ? '#fde68a' : '#a7f3d0';
  const icon = isError ? '✕' : isWarning ? '⚠' : '✓';

  return (
    <div
      style={{
        position: 'absolute',
        top: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      <div
        className="hud-animate-fade"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '8px',
          backgroundColor: bgColor,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
          color: textColor,
          fontSize: '12px',
          fontWeight: 500,
          maxWidth: '460px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: isError
              ? 'rgba(239, 68, 68, 0.2)'
              : isWarning
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(16, 185, 129, 0.2)',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>

        <span style={{ lineHeight: 1.35 }}>{interactionNotice.message}</span>

        <button
          type="button"
          onClick={() => setInteractionNotice(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: textColor,
            cursor: 'pointer',
            padding: '2px 4px',
            marginLeft: '4px',
            fontSize: '12px',
            opacity: 0.65,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.65')}
          title="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
