import * as THREE from 'three';

/**
 * Modular Equipment & Storage Areas for the Virtual Chemistry Classroom.
 * Includes:
 * 1. Chemical Glassware Wall Cabinets
 * 2. Chemical Reagent Storage & Dispensary
 * 3. Emergency Safety Station (Drench Shower, Eye Wash, Fire Extinguisher)
 * 4. Fume Hood Preparation Unit
 * 5. Analytical Balance & Precision Weighing Counter
 * 6. Rear Student Cubby Shelves & Lab Coat Racks
 * 7. Hazardous Chemical & Broken Glass Disposal Bins
 */
export function EquipmentStorage() {
  return (
    <group name="classroom-storage-and-facilities">
      {/* ==================================================================== */}
      {/* 1. GLASSWARE STORAGE CABINETS (Left Wall: x = -10.3, z = -1.5 to 2.5) */}
      {/* ==================================================================== */}
      <group position={[-10.4, 0, 0]}>
        {/* Main Cabinet Frame (Clean laboratory powder-coated steel) */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 2.6, 4.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Dark accent base plinth */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.72, 0.12, 4.02]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Glass Sliding Door Panels */}
        {[-1.35, -0.45, 0.45, 1.35].map((gx, gIdx) => (
          <mesh key={gIdx} position={[0.36, 1.4, gx]}>
            <planeGeometry args={[0.82, 2.1]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              transparent
              opacity={0.38}
              roughness={0.08}
              transmission={0.88}
              ior={1.52}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* Cabinet Door Aluminum Frames */}
        {[-1.8, -0.9, 0, 0.9, 1.8].map((fx, fIdx) => (
          <mesh key={fIdx} position={[0.36, 1.4, fx]}>
            <boxGeometry args={[0.015, 2.15, 0.024]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Glassware Shelves (Rows of stored beakers & flasks visible through glass) */}
        {[0.6, 1.1, 1.6, 2.1].map((shY, sIdx) => (
          <group key={sIdx} position={[0.1, shY, 0]}>
            {/* Shelf Board */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.02, 3.8]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
            </mesh>
            {/* Row of stored glassware silhouettes */}
            {[-1.5, -1.1, -0.7, -0.3, 0.1, 0.5, 0.9, 1.3].map((itemZ, iIdx) => (
              <mesh key={iIdx} position={[0, 0.08, itemZ]}>
                <cylinderGeometry args={[0.035, 0.045, 0.14, 16]} />
                <meshPhysicalMaterial
                  color="#f8fafc"
                  transparent
                  opacity={0.5}
                  roughness={0.1}
                  transmission={0.8}
                  ior={1.52}
                />
              </mesh>
            ))}
          </group>
        ))}
        {/* Header Label Plaque */}
        <mesh position={[0.36, 2.5, 0]}>
          <planeGeometry args={[2.4, 0.12]} />
          <meshBasicMaterial color="#0d9488" />
        </mesh>
      </group>

      {/* ==================================================================== */}
      {/* 2. EMERGENCY SAFETY SHOWER & EYEWASH (Left Wall: x = -10.4, z = -7.5) */}
      {/* ==================================================================== */}
      <group position={[-10.4, 0, -7.5]}>
        {/* High-visibility yellow safety floor boundary */}
        <mesh position={[0.35, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial color="#eab308" transparent opacity={0.25} />
        </mesh>
        <mesh position={[0.35, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.54, 32]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>

        {/* Vertical Supply Pipe (Safety Green) */}
        <mesh position={[0.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 3.6, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.3} />
        </mesh>
        {/* Overhead Drench Shower Head */}
        <mesh position={[0.55, 3.1, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.3} />
        </mesh>
        <mesh position={[0.85, 2.95, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.18, 0.1, 24]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Emergency Pull Rod & Ring */}
        <mesh position={[0.85, 2.4, 0.12]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.9, 8]} />
          <meshStandardMaterial color="#eab308" roughness={0.2} />
        </mesh>
        <mesh position={[0.85, 1.95, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.006, 8, 16]} />
          <meshStandardMaterial color="#eab308" roughness={0.2} />
        </mesh>

        {/* Dual Eyewash Bowl Unit */}
        <group position={[0.45, 1.0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.14, 24]} />
            <meshStandardMaterial color="#eab308" roughness={0.3} />
          </mesh>
          {/* Eyewash Twin Nozzles */}
          {[-0.05, 0.05].map((nx, nIdx) => (
            <mesh key={nIdx} position={[0, 0.1, nx]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
              <meshStandardMaterial color="#16a34a" roughness={0.3} />
            </mesh>
          ))}
          {/* Hand Push Flag Switch */}
          <mesh position={[0.2, 0.05, 0.1]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.01]} />
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </mesh>
        </group>

        {/* Wall Safety Sign: Emergency Shower & Eyewash */}
        <group position={[0.01, 2.2, -0.6]}>
          <mesh>
            <planeGeometry args={[0.5, 0.6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.15, 0.002]}>
            <planeGeometry args={[0.46, 0.24]} />
            <meshBasicMaterial color="#16a34a" />
          </mesh>
          {/* Cross Symbol */}
          <mesh position={[0, 0.15, 0.004]}>
            <planeGeometry args={[0.06, 0.18]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.15, 0.005]}>
            <planeGeometry args={[0.18, 0.06]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Wall Mounted Fire Extinguisher */}
        <group position={[0.12, 0.85, 0.75]}>
          {/* Red Cylinder Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.45, 18]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
          {/* Dome Top */}
          <mesh position={[0, 0.23, 0]}>
            <sphereGeometry args={[0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
          {/* Brass Valve & Gauge */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.08, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Black Discharge Hose */}
          <mesh position={[0.06, 0.22, 0.06]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.24, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Wall Mounting Bracket */}
          <mesh position={[-0.08, 0.15, 0]}>
            <boxGeometry args={[0.04, 0.3, 0.12]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 3. CHEMICAL REAGENT DISPENSARY (Left Wall: x = -10.4, z = 5.5)      */}
      {/* ==================================================================== */}
      <group position={[-10.4, 0, 5.5]}>
        {/* Dispensary Counter */}
        <mesh position={[0.1, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.9, 2.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Chemical Resistant Top */}
        <mesh position={[0.1, 0.92, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.04, 2.45]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.25} />
        </mesh>
        {/* Wall Racks with Reagent Jars */}
        {[1.3, 1.8, 2.3].map((rY, rIdx) => (
          <group key={rIdx} position={[0.12, rY, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.02, 2.2]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>
            {/* Amber and clear chemical jars */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((jx, jIdx) => (
              <mesh key={jIdx} position={[0, 0.07, jx]}>
                <cylinderGeometry args={[0.04, 0.04, 0.12, 14]} />
                <meshStandardMaterial
                  color={jIdx % 2 === 0 ? '#92400e' : '#f8fafc'}
                  roughness={0.2}
                  transparent={jIdx % 2 !== 0}
                  opacity={jIdx % 2 === 0 ? 0.9 : 0.6}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 4. LABORATORY FUME HOOD (Right Wall: x = 10.4, z = -7.5)             */}
      {/* ==================================================================== */}
      <group position={[10.4, 0, -7.5]}>
        {/* Fume Hood Base Cabinet */}
        <mesh position={[-0.3, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.9, 2.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Acid / Corrosive Storage Doors */}
        <mesh position={[-0.73, 0.45, 0]}>
          <planeGeometry args={[0.01, 0.8]} />
          <meshStandardMaterial color="#0d9488" />
        </mesh>

        {/* Fume Hood Enclosure Upper Chamber */}
        <mesh position={[-0.3, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 1.8, 2.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Internal Working Chamber Void (Visual cutout) */}
        <mesh position={[-0.5, 1.6, 0]}>
          <boxGeometry args={[0.45, 1.2, 1.9]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Glass Sliding Sash Window */}
        <mesh position={[-0.73, 1.8, 0]}>
          <planeGeometry args={[1.9, 1.0]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.9}
            ior={1.52}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Sash Aluminum Frame Bottom Handle */}
        <mesh position={[-0.73, 1.3, 0]}>
          <boxGeometry args={[0.02, 0.03, 1.92]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>

        {/* Exhaust Ventilation Duct to Ceiling */}
        <mesh position={[-0.3, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.4, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Fume Hood Control Panel & Airflow Indicator */}
        <group position={[-0.73, 1.15, 0.85]}>
          <mesh>
            <planeGeometry args={[0.16, 0.28]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>
          {/* Airflow Normal Green LED */}
          <mesh position={[0, 0.06, 0.005]}>
            <circleGeometry args={[0.016, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 5. ANALYTICAL BALANCE & WEIGHING BENCH (Right Wall: x = 10.4, z = 0)  */}
      {/* ==================================================================== */}
      <group position={[10.4, 0, 0]}>
        {/* Heavy Vibration-Damped Granite Countertop */}
        <mesh position={[-0.35, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.9, 3.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[-0.35, 0.92, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.05, 3.65]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.1} />
        </mesh>

        {/* 2 Precision Digital Analytical Balances with Glass Draft Shields */}
        {[-0.9, 0.9].map((bx, bIdx) => (
          <group key={bIdx} position={[-0.35, 0.95, bx]}>
            {/* Balance Base */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[0.3, 0.08, 0.35]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Digital LED Display */}
            <mesh position={[-0.12, 0.05, 0.18]} rotation={[0.4, 0, 0]}>
              <planeGeometry args={[0.1, 0.04]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
            {/* Glass Draft Shield Enclosure */}
            <mesh position={[0, 0.22, -0.02]}>
              <boxGeometry args={[0.26, 0.26, 0.26]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.05}
                transmission={0.92}
                ior={1.52}
              />
            </mesh>
            {/* Stainless Weighing Pan */}
            <mesh position={[0, 0.14, -0.02]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.008, 20]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        ))}

        {/* Wash Bottles and Weighing Boat Trays */}
        <group position={[-0.35, 0.95, 0]}>
          {/* Wash Bottle (PE translucent) */}
          <mesh position={[0, 0.12, -0.08]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.18, 16]} />
            <meshStandardMaterial color="#f1f5f9" transparent opacity={0.7} roughness={0.3} />
          </mesh>
          {/* Curved Gooseneck Jet Spout */}
          <mesh position={[0, 0.24, -0.06]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 6. REAR ENTRANCE & STUDENT BAG CUBBIES (Back Wall: z = 11.6)         */}
      {/* ==================================================================== */}
      <group position={[0, 0, 11.6]}>
        {/* Double Entrance Doors (Center z = 11.9) */}
        <group position={[0, 1.4, 0.35]}>
          {/* Door Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.4, 2.8, 0.08]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Left Door Leaf */}
          <mesh position={[-0.56, 0, 0.02]} castShadow>
            <boxGeometry args={[1.08, 2.7, 0.04]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          {/* Right Door Leaf */}
          <mesh position={[0.56, 0, 0.02]} castShadow>
            <boxGeometry args={[1.08, 2.7, 0.04]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          {/* Safety Vision Glass Panels */}
          {[-0.56, 0.56].map((dx, dIdx) => (
            <mesh key={dIdx} position={[dx, 0.4, 0.04]}>
              <planeGeometry args={[0.3, 0.9]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.45}
                transmission={0.85}
                ior={1.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
          {/* Stainless Push Bars */}
          {[-0.56, 0.56].map((dx, dIdx) => (
            <mesh key={dIdx} position={[dx, -0.1, 0.06]}>
              <boxGeometry args={[0.4, 0.03, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
          {/* Exit Sign Above Doors */}
          <mesh position={[0, 1.55, 0.05]}>
            <planeGeometry args={[0.65, 0.22]} />
            <meshBasicMaterial color="#16a34a" />
          </mesh>
        </group>

        {/* Student Bag / Backpack Cubby Storage Unit (Left of door: x = -5.0) */}
        <group position={[-5.0, 0, 0]}>
          {/* Cubby Frame (12 compartments: 4 cols x 3 rows) */}
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 1.8, 0.45]} />
            <meshStandardMaterial color="#e2d8cc" roughness={0.5} />
          </mesh>
          {/* Internal Divider Grid */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.22, 0.12, 0.46]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          {/* Plaque: Student Personal Belongings */}
          <mesh position={[0, 1.96, 0.23]}>
            <planeGeometry args={[1.8, 0.12]} />
            <meshBasicMaterial color="#0d9488" />
          </mesh>
        </group>

        {/* Student Lab Coat Racks (Right of door: x = 5.0) */}
        <group position={[5.0, 0, 0]}>
          {/* Wall Backing Board */}
          <mesh position={[0, 1.7, 0.1]}>
            <boxGeometry args={[3.0, 0.18, 0.03]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} />
          </mesh>
          {/* Coat Hooks & Hanging White Lab Coats */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((cx, cIdx) => (
            <group key={cIdx} position={[cx, 1.7, 0.13]}>
              {/* Metal Hook */}
              <mesh castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
              </mesh>
              {/* Suspended White Lab Coat */}
              <mesh position={[0, -0.55, 0.04]} castShadow>
                <boxGeometry args={[0.35, 0.95, 0.08]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.7} />
              </mesh>
            </group>
          ))}
          {/* Plaque: Lab Coats Required */}
          <mesh position={[0, 1.95, 0.12]}>
            <planeGeometry args={[1.8, 0.12]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 7. CHEMICAL WASTE & BROKEN GLASS DISPOSAL (Right-Back: x = 8.5, z = 10.5) */}
      {/* ==================================================================== */}
      <group position={[8.5, 0, 10.5]}>
        {/* Yellow Hazardous Organic Waste Bin */}
        <group position={[-0.6, 0.38, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.18, 0.75, 20]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.05, 20]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
        </group>

        {/* Blue Broken Glass Disposal Box */}
        <group position={[0, 0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.7, 0.42]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.44, 0.04, 0.44]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>

        {/* Red Biohazard / Sharps Bin */}
        <group position={[0.6, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.6, 0.35]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
        </group>

        {/* Demarcation Floor Strip */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 1.0]} />
          <meshBasicMaterial color="#eab308" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}
