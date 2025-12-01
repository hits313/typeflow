
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Simplex Noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float time = uTime * 0.5;
  
  // Noise for the 'particulate matter' in the beam
  float n = snoise(vec2(uv.x * 10.0, uv.y * 5.0 + time));
  float n2 = snoise(vec2(uv.x * 20.0 - time, uv.y * 15.0));
  
  // Combine noise
  float noise = n * 0.5 + n2 * 0.2;
  
  // Fresnel Edge Softening
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
  
  // Core Gradient
  // uv.y 0 is top (wide), 1 is bottom (narrow) for Cylinder depending on orientation
  // We want top to be from space, bottom to hit earth
  
  vec3 color = mix(uColor1, uColor2, uv.y + noise * 0.2);
  
  // Alpha Logic
  // Fade out at edges (Fresnel-ish but manual for Cylinder)
  // Actually since we use DoubleSide and Additive, simple alpha gradient is cool
  
  float alpha = 0.6;
  
  // Make the beam fade out near the bottom/ground to look like it's penetrating or dispersing
  alpha *= smoothstep(0.0, 0.2, uv.y); // Fade top
  alpha *= smoothstep(1.0, 0.8, uv.y); // Fade bottom
  
  // Horizontal fade for cylindrical softness
  // This is tricky in UV space for a cylinder without looking like a seam
  // So we rely on the AdditiveBlending to create the "Core" brightness naturally when back/front overlap
  
  // Add pulsing intensity
  float pulse = 0.8 + 0.2 * sin(time * 3.0);
  
  // Sparkles
  float sparkle = step(0.98, snoise(vec2(uv.x * 50.0, uv.y * 50.0 + time * 2.0))) * 2.0;
  
  vec3 finalColor = color * pulse + vec3(sparkle);

  gl_FragColor = vec4(finalColor, alpha * (0.3 + noise * 0.2));
}
`;

const EnergyBeam: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
        {/* Massive Cylinder Beam */}
        {/* RadiusTop, RadiusBottom, Height, RadialSegments */}
        <mesh ref={meshRef} position={[0, 0, -2]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[2, 0.2, 60, 32, 1, true]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    uTime: { value: 0 },
                    uColor1: { value: new THREE.Color('#3b0764') }, // Deep Purple
                    uColor2: { value: new THREE.Color('#a855f7') }, // Bright Violet
                }}
            />
        </mesh>
    </group>
  );
};

export default EnergyBeam;
