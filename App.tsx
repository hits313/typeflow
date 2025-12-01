
import React, { Suspense, useRef, useState, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

import EnergyBeam from './components/EnergyBeam';
import AgentVex from './components/AgentVex';
import TypingHud from './components/TypingHud';
import { AgentMood } from './types';

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------
// Scene Controller
// --------------------------------------------------------
const SceneController: React.FC<{ agentRef: React.RefObject<THREE.Group> }> = ({ agentRef }) => {
  const { camera } = useThree();
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5, 
        }
      });

      if (!tl.current) return;

      // CAMERA ANIMATION
      // Start: Looking straight at the beam origin (Top of hero)
      
      // Phase 1: Descent to Arena (Typing area)
      tl.current.to(camera.position, {
        y: -25, // Move down
        z: 8,   // Zoom in slightly
        duration: 2,
        ease: "power2.inOut"
      }, "start");

      // Phase 2: Agent Interaction (Arena)
      // Agent slides into view
      if (agentRef.current) {
          tl.current.to(agentRef.current.position, {
              y: -25, // Match camera Y level
              x: -3,  // Float to left
              duration: 2,
              ease: "power2.out"
          }, "start+=0.5");
          
          tl.current.to(agentRef.current.rotation, {
              y: 0.8, // Look at user
              duration: 2
          }, "start+=0.5");
      }
      
      // Phase 3: Footer (Beam hits bottom)
      tl.current.to(camera.position, {
          y: -50,
          z: 12,
          duration: 2
      }, "footer");

    });

    return () => ctx.revert();
  }, [camera, agentRef]);

  return null;
};

// --------------------------------------------------------
// Main App Component
// --------------------------------------------------------
const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [agentMood, setAgentMood] = useState<AgentMood>('idle');
  const agentRef = useRef<THREE.Group>(null);
  
  // DOM Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  // Setup pinning for the Arena
  useLayoutEffect(() => {
    if (!arenaRef.current) return;

    const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: arenaRef.current,
          start: "center center",
          end: "+=1200", 
          pin: true,
          scrub: true,
          onEnter: () => setGameStarted(true),
          onLeaveBack: () => setGameStarted(false),
        });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, []);

  const scrollToArena = () => {
    arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="relative w-full bg-[#030005] overflow-x-hidden text-white selection:bg-purple-500 selection:text-white">
      
      {/* --- 3D CANVAS (FIXED) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas gl={{ antialias: true, stencil: false, depth: true }} dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={40} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[20, 20, 20]} angle={0.3} penumbra={1} intensity={2} color="#c084fc" />
          <pointLight position={[-10, -20, 10]} intensity={1} color="#a855f7" />
          
          <SceneController agentRef={agentRef} />
          
          {/* Volumetric Beam - Massive Scale */}
          {/* Height 60 to span from top (Y=0) to bottom (Y=-50) */}
          <group position={[0, -25, 0]}> 
             <EnergyBeam />
          </group>

          {/* VEX Agent - Initially High Up/Hidden */}
          <group ref={agentRef} position={[10, 10, 0]}>
             <AgentVex mood={agentMood} />
          </group>
          
          <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

          {/* Clean Post Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.4} />
            <Noise opacity={0.03} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* --- UI SCROLL CONTAINER --- */}
      <div id="scroll-container" ref={scrollContainerRef} className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="h-screen flex flex-col items-center justify-center relative">
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="text-center z-10 relative"
           >
             <div className="mb-8 flex justify-center">
                <div className="px-4 py-2 border border-white/10 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-mono tracking-[0.3em] uppercase text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    System V.2.0 // Online
                </div>
             </div>
             
             {/* Main Title intersecting the beam */}
             <h1 className="text-8xl md:text-[11rem] leading-none font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-purple-900/50 mix-blend-overlay">
               TYPEFLOW
             </h1>
             
             <p className="mt-8 text-sm md:text-base font-mono text-gray-400 tracking-[0.2em] uppercase max-w-md mx-auto">
               Input Stream Synchronization
             </p>

             <button 
                onClick={scrollToArena}
                className="mt-12 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-mono tracking-widest transition-all"
             >
                INITIALIZE
             </button>
           </motion.div>
        </section>

        {/* ARENA (Pinned) */}
        <section ref={arenaRef} className="h-screen w-full flex flex-col items-center justify-center relative">
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 pointer-events-none" />
           
           <h2 className="text-4xl md:text-6xl font-display font-bold mb-10 text-white/10">
               NEURAL SYNC
           </h2>
           
           <TypingHud 
                setAgentMood={setAgentMood}
                onComplete={() => setAgentMood('idle')}
           />
        </section>

        {/* FOOTER - OSMO STYLE */}
        <section className="h-[60vh] flex flex-col justify-end pb-20 relative overflow-hidden">
           <div className="container mx-auto px-6 relative z-10">
               <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                   <div>
                       <div className="text-xs font-mono text-gray-500 mb-2">SERVER STATUS</div>
                       <div className="flex items-center gap-2 text-green-400 font-mono text-xs tracking-widest">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                           </span>
                           OPTIMAL // 12ms
                       </div>
                   </div>
                   
                   <div className="text-right">
                       <ul className="flex gap-8 font-mono text-xs text-gray-500 tracking-widest">
                           <li className="hover:text-white cursor-pointer transition-colors">GITHUB</li>
                           <li className="hover:text-white cursor-pointer transition-colors">X / TWITTER</li>
                           <li className="hover:text-white cursor-pointer transition-colors">DOCS</li>
                       </ul>
                   </div>
               </div>

               {/* Massive Footer Brand intersecting the beam bottom */}
               <h1 className="mt-16 text-[14vw] leading-none font-display font-bold tracking-tighter text-white opacity-10 select-none text-center md:text-left mix-blend-screen">
                   PROTOCOL
               </h1>
           </div>
        </section>

      </div>
    </div>
  );
};

export default App;
