export function LabRoom() {
  const benchWidth = 3.2;
  const benchDepth = 1.4;
  const benchHeight = 0.9;
  const topThickness = 0.04;

  return (
    <group>
      {/* ================= FLOOR ================= */}
      {/* Light, clean educational laboratory floor */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial
          color="#dbe3eb"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Floor Tile Grid Seams */}
      <gridHelper
        args={[14, 14, '#94a3b8', '#cbd5e1']}
        position={[0, 0.001, 0]}
      />

      {/* ================= WALLS ================= */}
      {/* Back Wall - Soft Neutral Tone */}
      <mesh position={[0, 2.5, -4.5]} receiveShadow>
        <planeGeometry args={[14, 5.0]} />
        <meshStandardMaterial color="#eef2f6" roughness={0.9} />
      </mesh>

      {/* Back Wall Ceramic White Tile Splashback */}
      <mesh position={[0, 1.3, -4.48]} receiveShadow>
        <planeGeometry args={[14, 2.4]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.25}
          metalness={0.02}
        />
      </mesh>

      {/* Subtle Teal Accent Tile Border */}
      <mesh position={[0, 2.52, -4.47]}>
        <planeGeometry args={[14, 0.05]} />
        <meshStandardMaterial color="#0d9488" roughness={0.3} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 5.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 5.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>

      {/* Clean White Ceiling */}
      <mesh position={[0, 5.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.95} />
      </mesh>

      {/* ================= LABORATORY WORKBENCH ================= */}
      <group position={[0, 0, 0]}>
        {/* Light Chemical-Resistant Countertop (Corian / Modern Epoxy) */}
        <mesh
          position={[0, benchHeight + topThickness / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[benchWidth, topThickness, benchDepth]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.28}
            metalness={0.08}
          />
        </mesh>

        {/* Countertop Soft Slate Edge Trim */}
        <mesh position={[0, benchHeight + topThickness / 2, benchDepth / 2 + 0.005]}>
          <boxGeometry args={[benchWidth + 0.02, topThickness + 0.01, 0.01]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} />
        </mesh>

        {/* Bench Metal Legs (Satin Brushed Aluminum) */}
        {[
          [-benchWidth / 2 + 0.08, benchDepth / 2 - 0.08],
          [benchWidth / 2 - 0.08, benchDepth / 2 - 0.08],
          [-benchWidth / 2 + 0.08, -benchDepth / 2 + 0.08],
          [benchWidth / 2 - 0.08, -benchDepth / 2 + 0.08],
        ].map(([lx, lz], i) => (
          <mesh
            key={i}
            position={[lx, benchHeight / 2, lz]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.024, 0.024, benchHeight, 16]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
        ))}

        {/* Under-Bench Clean Storage Cabinet */}
        <mesh
          position={[-0.85, (benchHeight - 0.1) / 2, -0.05]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.1, benchHeight - 0.1, benchDepth - 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>

        {/* Cabinet Handles & Subtle Teal Trim */}
        <mesh position={[-0.85, (benchHeight - 0.1) * 0.7, benchDepth / 2 - 0.15 + 0.058]}>
          <boxGeometry args={[0.4, 0.014, 0.012]} />
          <meshStandardMaterial color="#0d9488" metalness={0.3} roughness={0.3} />
        </mesh>
        <mesh position={[-0.85, (benchHeight - 0.1) * 0.35, benchDepth / 2 - 0.15 + 0.058]}>
          <boxGeometry args={[0.4, 0.014, 0.012]} />
          <meshStandardMaterial color="#0d9488" metalness={0.3} roughness={0.3} />
        </mesh>

        {/* Benchtop Reagent Rack Shelf (Back of the Table) */}
        <group position={[0, benchHeight + topThickness, -benchDepth / 2 + 0.18]}>
          {/* Lower Shelf Board (Light Neutral) */}
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[benchWidth * 0.9, 0.02, 0.22]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
          </mesh>

          {/* Upper Shelf Board */}
          <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
            <boxGeometry args={[benchWidth * 0.9, 0.02, 0.22]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
          </mesh>

          {/* Shelf Uprights (Satin Metal) */}
          {[-1.2, 0, 1.2].map((sx, idx) => (
            <mesh key={idx} position={[sx, 0.2, 0]} castShadow>
              <boxGeometry args={[0.024, 0.4, 0.22]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}

          {/* Reagent Chemical Bottles on Shelves (Realistic Color Coding) */}
          {[
            { x: -0.9, y: 0.17, color: '#f59e0b', amber: true },
            { x: -0.75, y: 0.17, color: '#3b82f6', amber: false },
            { x: -0.6, y: 0.17, color: '#ec4899', amber: true },
            { x: -0.45, y: 0.17, color: '#10b981', amber: false },
            { x: 0.45, y: 0.17, color: '#8b5cf6', amber: true },
            { x: 0.6, y: 0.17, color: '#f97316', amber: true },
            { x: 0.75, y: 0.17, color: '#e2e8f0', amber: true },
            { x: 0.9, y: 0.17, color: '#0284c7', amber: false },
            // Upper shelf
            { x: -0.35, y: 0.37, color: '#0284c7', amber: false },
            { x: -0.2, y: 0.37, color: '#64748b', amber: true },
            { x: 0.2, y: 0.37, color: '#cbd5e1', amber: true },
            { x: 0.35, y: 0.37, color: '#e2e8f0', amber: false },
          ].map((bottle, bIdx) => (
            <group key={bIdx} position={[bottle.x, bottle.y, 0]}>
              {/* Bottle body */}
              <mesh position={[0, 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.032, 0.032, 0.1, 16]} />
                <meshStandardMaterial
                  color={bottle.amber ? '#92400e' : '#f8fafc'}
                  roughness={bottle.amber ? 0.3 : 0.12}
                  transparent={!bottle.amber}
                  opacity={bottle.amber ? 0.88 : 0.6}
                />
              </mesh>
              {/* Bottle neck & cap */}
              <mesh position={[0, 0.11, 0]} castShadow>
                <cylinderGeometry args={[0.016, 0.016, 0.028, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.4} />
              </mesh>
              {/* White Paper Label */}
              <mesh position={[0, 0.05, 0.033]}>
                <planeGeometry args={[0.042, 0.045]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Bench Utility: Gas Turret Nozzle */}
        <group position={[-0.05, benchHeight + topThickness, -benchDepth / 2 + 0.35]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.018, 0.1, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Dual gas outlets */}
          <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.08, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>

        {/* Workstation Porcelain Sink & Goose-neck Water Tap */}
        <group position={[benchWidth / 2 - 0.28, benchHeight + topThickness, 0]}>
          {/* Porcelain Sink Rim */}
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[0.12, 0.16, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          {/* Sink Basin depression */}
          <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.12, 24, 1, true]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
          {/* Chrome Goose-neck Faucet */}
          <mesh position={[0, 0.14, -0.1]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.24, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.26, -0.05]} rotation={[Math.PI / 4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.009, 0.009, 0.12, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* ================= LABORATORY CEILING LIGHT TROFFERS ================= */}
      {[-2, 2].map((cx, i) => (
        <group key={i} position={[cx, 4.96, 0]}>
          {/* Light Frame */}
          <mesh>
            <boxGeometry args={[1.6, 0.06, 2.4]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
          {/* Daylight Diffuser Panel */}
          <mesh position={[0, -0.035, 0]}>
            <planeGeometry args={[1.5, 2.3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* ================= WALL CHART 1: PERIODIC TABLE (EDUCATIONAL) ================= */}
      <group position={[-2.2, 2.6, -4.47]}>
        {/* Frame / Backing */}
        <mesh>
          <planeGeometry args={[2.0, 1.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Header Bar */}
        <mesh position={[0, 0.48, 0.001]}>
          <planeGeometry args={[1.92, 0.14]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        {/* Representative Periodic Table Block Grid */}
        {[-0.7, -0.42, -0.14, 0.14, 0.42, 0.7].map((colX, cIdx) => (
          <group key={cIdx} position={[colX, -0.05, 0.002]}>
            {[0.3, 0.12, -0.06, -0.24, -0.42].map((rowY, rIdx) => {
              const colors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa'];
              const cellColor = colors[(cIdx + rIdx) % colors.length];
              return (
                <mesh key={rIdx} position={[0, rowY, 0]}>
                  <planeGeometry args={[0.22, 0.12]} />
                  <meshBasicMaterial color={cellColor} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>

      {/* ================= WALL CHART 2: SAFETY & EYEWASH NOTICE ================= */}
      <group position={[2.2, 2.6, -4.47]}>
        {/* Sign Plate */}
        <mesh>
          <planeGeometry args={[1.6, 1.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Safety Green Header */}
        <mesh position={[0, 0.46, 0.001]}>
          <planeGeometry args={[1.52, 0.18]} />
          <meshBasicMaterial color="#16a34a" />
        </mesh>
        {/* ISO Safety Cross Symbol */}
        <mesh position={[0, 0.12, 0.002]}>
          <planeGeometry args={[0.12, 0.34]} />
          <meshBasicMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, 0.12, 0.003]}>
          <planeGeometry args={[0.34, 0.12]} />
          <meshBasicMaterial color="#16a34a" />
        </mesh>
        {/* Safety Rule Text Strip Mockups */}
        {[-0.15, -0.28, -0.41].map((ruleY, rIdx) => (
          <mesh key={rIdx} position={[0, ruleY, 0.002]}>
            <planeGeometry args={[1.35, 0.06]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

