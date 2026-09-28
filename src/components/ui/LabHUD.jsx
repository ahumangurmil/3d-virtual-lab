import './hud.css';
import { TopNavbar } from './TopNavbar';
import { ExperimentPanel } from './ExperimentPanel';
import { EquipmentInspector } from './EquipmentInspector';
import { InteractionPrompt } from './InteractionPrompt';
import { CameraControls } from './CameraControls';
import { ToastManager } from './ToastManager';

/**
 * Master Laboratory HUD Container.
 * Modular, clean composition coordinating:
 * - Top navigation bar (Branding, Workstation jump, Profile, View toggles)
 * - Collapsible guided experiment panel (Acid–Base Titration)
 * - Equipment inspector drawer (detailed specs & apparatus actions)
 * - Contextual interaction prompts & crosshair reticle
 * - Camera controls & keyboard shortcuts reference
 * - Toast feedback manager
 */
export function LabHUD() {
  return (
    <div
      id="lab-hud-root"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Top Navigation Bar */}
      <TopNavbar />

      {/* Collapsible Experiment Guide Panel (Acid–Base Titration) */}
      <ExperimentPanel />

      {/* Contextual Interaction Prompts & Aiming Reticle */}
      <InteractionPrompt />

      {/* Right Drawer Equipment Inspector */}
      <EquipmentInspector />

      {/* Action Feedback & Toast Notifications */}
      <ToastManager />

      {/* Bottom Camera Controls & Keyboard Shortcuts Reference */}
      <CameraControls />
    </div>
  );
}
