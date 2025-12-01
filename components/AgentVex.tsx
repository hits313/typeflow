
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { COLORS } from '../constants';
import { AgentMood } from '../types';

interface AgentVexProps {
  mood: AgentMood;
  targetPosition?: THREE.Vector3;
}

const AgentVex: React.FC<AgentVexProps> = ({ mood, targetPosition }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  // Mood-based Colors
  const targetColor = useRef(new THREE.Color(COLORS.neonViolet));
  const visorIntensity = useRef(1);

  useEffect(() => {
    switch (mood) {
      case 'idle':
        targetColor.current.set(COLORS.neonViolet);
        visorIntensity.current = 1.2;
        break;
      case 'focus':
        targetColor.current.set(COLORS.cyan);
        visorIntensity.current = 2.0;
        break;
      case 'streak':
        targetColor.current.set(COLORS.gold);
        visorIntensity.current = 4.0;
        break;
      case 'error':
        targetColor.current.set(COLORS.error);
        visorIntensity.current = 5.0;
        break;
    }
  }, [mood]);

  useFrame((state, delta) => {
    if (!groupRef.current || !visorRef.current) return;

    // Smooth Visor Color Transition
    const material = visorRef.current.material as THREE.MeshStandardMaterial;
    material.color.lerp(targetColor.current, delta * 5);
    material.emissive.lerp(targetColor.current, delta * 5);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, visorIntensity.current, delta * 2);

    // Head Tracking logic
    if (headRef.current) {
        // Default look at mouse
        const lookTarget = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 10);
        
        // Override if targetPosition is provided (for cards)
        if (targetPosition) {
             lookTarget.copy(targetPosition);
        }
        
        const currentQuaternion = headRef.current.quaternion.clone();
        headRef.current.lookAt(lookTarget);
        const targetQuaternion = headRef.current.quaternion.clone();
        
        // Smooth rotation
        headRef.current.quaternion.copy(currentQuaternion.slerp(targetQuaternion, delta * 3));
    }
  });

  const MetallicMaterial = (
    <meshStandardMaterial 
      color="#1a1a1a" 
      metalness={0.8} 
      roughness={0.2} 
    />
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={headRef}>
            
            {/* --- CRANIUM (Main Head) --- */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.2, 1.4, 1.4]} />
              {MetallicMaterial}
            </mesh>

            {/* --- VISOR (Glowing Eye) --- */}
            <mesh ref={visorRef} position={[0, 0.1, 0.65]}>
                <boxGeometry args={[1.0, 0.3, 0.2]} />
                <meshStandardMaterial 
                    color={COLORS.neonViolet}
                    emissive={COLORS.neonViolet}
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>

            {/* --- FACE PLATE (Lower Jaw) --- */}
            <mesh position={[0, -0.5, 0.75]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[0.8, 0.6, 0.1]} />
                <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* --- SIDE EARS/ANTENNA --- */}
            <mesh position={[0.7, 0, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.8]} />
                {MetallicMaterial}
            </mesh>
            <mesh position={[-0.7, 0, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.8]} />
                {MetallicMaterial}
            </mesh>
            
            {/* --- TOP SENSOR --- */}
            <mesh position={[0, 0.8, 0]}>
                 <cylinderGeometry args={[0.2, 0.4, 0.2, 8]} />
                 <meshStandardMaterial color="#222" metalness={1} />
            </mesh>

        </group>

        {/* --- FLOATING ARMOR PLATES (Detached) --- */}
        <group>
            {/* Left Plate */}
            <mesh position={[-1.2, -0.5, 0.5]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.4, 1.2, 0.1]} />
                <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
            {/* Right Plate */}
            <mesh position={[1.2, -0.5, 0.5]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.4, 1.2, 0.1]} />
                <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
        </group>
      </Float>
    </group>
  );
};

export default AgentVex;
