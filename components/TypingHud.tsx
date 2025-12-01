
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { GamePhase } from '../types';

interface TypingHudProps {
  setAgentMood: (mood: any) => void;
  onComplete: () => void;
}

const TypingHud: React.FC<TypingHudProps> = ({ setAgentMood, onComplete }) => {
  const { 
    phase, 
    words, 
    currentWordIndex, 
    currentInput, 
    stats, 
    timeLeft,
    handleKeyDown, 
    reset 
  } = useTypingEngine();
  
  // Focus trap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyDown]);

  // Sync Agent Mood
  useEffect(() => {
    if (phase === GamePhase.IDLE) setAgentMood('idle');
    else if (phase === GamePhase.RUNNING) {
      if (stats.streak > 10) setAgentMood('streak');
      else setAgentMood('focus');
    }
  }, [phase, stats.streak, setAgentMood]);

  // Visible words buffer (Current - 1, Current, Current + 3)
  const visibleWords = words.slice(Math.max(0, currentWordIndex - 1), currentWordIndex + 4);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 relative z-20 flex flex-col items-center">
      
      {/* HUD Header: Timer & WPM */}
      <div className="flex items-center gap-12 mb-12">
         {/* Timer */}
         <div className="flex flex-col items-center">
             <div className="text-[10px] font-mono tracking-widest text-gray-500 mb-1">T-MINUS</div>
             <div className={`text-4xl font-display font-bold tabular-nums ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                 00:{timeLeft.toString().padStart(2, '0')}
             </div>
         </div>
         
         {/* Separator */}
         <div className="h-12 w-[1px] bg-white/10" />

         {/* Stats */}
         <div className="flex gap-8">
             <div className="flex flex-col items-center">
                 <div className="text-[10px] font-mono tracking-widest text-gray-500 mb-1">VELOCITY</div>
                 <div className="text-2xl font-mono text-purple-400">{stats.wpm} <span className="text-xs text-gray-600">WPM</span></div>
             </div>
             <div className="flex flex-col items-center">
                 <div className="text-[10px] font-mono tracking-widest text-gray-500 mb-1">PRECISION</div>
                 <div className="text-2xl font-mono text-cyan-400">{stats.accuracy}%</div>
             </div>
         </div>
      </div>

      {/* TYPING STREAM (Horizontal) */}
      <div className="relative w-full h-32 flex items-center justify-center perspective-1000">
         <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-r from-[#030005] via-transparent to-[#030005] z-20 pointer-events-none" />
         
         <div className="flex items-center gap-4 transition-all duration-300 ease-out"
              style={{ transform: `translateX(0px)` }}> 
              {/* Note: In a real infinite scroll, we'd offset X based on word widths. 
                  For simplicity, we render a window centered on the active word. */}
              
              {visibleWords.map((word, i) => {
                  const globalIndex = Math.max(0, currentWordIndex - 1) + i;
                  const isActive = globalIndex === currentWordIndex;
                  const isPast = globalIndex < currentWordIndex;
                  
                  return (
                      <div 
                        key={globalIndex}
                        className={`
                            font-mono text-3xl md:text-5xl transition-all duration-300
                            ${isActive ? 'text-white scale-110 blur-none opacity-100' : 'text-gray-600 blur-[1px] opacity-40 scale-90'}
                            ${isPast ? 'opacity-20 blur-[2px]' : ''}
                        `}
                      >
                          {isActive ? (
                              <span className="relative">
                                  {/* Render typed part */}
                                  <span className="text-purple-400 border-b-2 border-purple-500">
                                      {currentInput}
                                  </span>
                                  {/* Render untyped part */}
                                  <span className="text-white/50">
                                      {word.slice(currentInput.length)}
                                  </span>
                                  {/* Cursor */}
                                  <motion.span 
                                     layoutId="caret"
                                     className="absolute -right-1 top-0 bottom-0 w-[2px] bg-purple-400"
                                     transition={{ duration: 0.1 }}
                                  />
                              </span>
                          ) : (
                              word
                          )}
                      </div>
                  );
              })}
         </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 font-mono text-xs text-gray-600 tracking-[0.2em] animate-pulse">
          {phase === GamePhase.IDLE ? "INITIATE NEURAL LINK [TYPE]" : "MAINTAIN SYNC"}
      </div>

      {/* RESULTS MODAL */}
      <AnimatePresence>
        {phase === GamePhase.COMPLETED && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center"
            >
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl shadow-purple-900/40 max-w-md w-full text-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">SESSION TERMINATED</h2>
                    <p className="text-gray-400 font-mono text-xs mb-8">DATA UPLOAD COMPLETE</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">NET WPM</div>
                            <div className="text-3xl font-bold text-purple-400">{stats.wpm}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">ACCURACY</div>
                            <div className="text-3xl font-bold text-cyan-400">{stats.accuracy}%</div>
                        </div>
                    </div>

                    <a 
                        href={`https://twitter.com/intent/tweet?text=I%20just%20synced%20with%20TypeFlow%20at%20${stats.wpm}%20WPM.%20Can%20you%20beat%20the%20machine?%20%23TypeFlow%20%23TouchTyping`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-4 bg-white text-black font-bold font-display hover:bg-gray-200 transition-colors rounded-lg mb-4"
                    >
                        SHARE ON X
                    </a>
                    <button 
                        onClick={reset}
                        className="block w-full py-4 border border-white/20 text-white font-mono text-xs hover:bg-white/10 transition-colors rounded-lg"
                    >
                        RESTART PROTOCOL
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TypingHud;
