
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { LetterState, GameStats, GamePhase } from '../types';
import { WORD_BANK } from '../constants';

const GAME_DURATION = 60; // seconds

export const useTypingEngine = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.IDLE);
  
  // Word Management
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  
  // Stats
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  // Initialize Words
  useEffect(() => {
    // Fill initial buffer
    const initialWords = Array.from({ length: 50 }, () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
    setWords(initialWords);
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (phase === GamePhase.RUNNING && startTime) {
      interval = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, GAME_DURATION - elapsed);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          setPhase(GamePhase.COMPLETED);
          clearInterval(interval);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [phase, startTime]);

  // Derived Stats
  const stats = useMemo<GameStats>(() => {
    const timeElapsed = GAME_DURATION - timeLeft;
    const minutes = timeElapsed / 60;
    
    // WPM = (All Correct Characters / 5) / Time in Minutes
    const wpm = minutes > 0 ? Math.round((correctCharCount / 5) / minutes) : 0;
    const totalEntries = correctCharCount + errorCount;
    const accuracy = totalEntries > 0 ? Math.round((correctCharCount / totalEntries) * 100) : 100;

    return {
      wpm,
      accuracy,
      streak,
      progress: (GAME_DURATION - timeLeft) / GAME_DURATION,
    };
  }, [correctCharCount, errorCount, streak, timeLeft]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase === GamePhase.COMPLETED) return;

    // Start Game
    if (phase === GamePhase.IDLE && /^[a-zA-Z]$/.test(e.key)) {
      setPhase(GamePhase.RUNNING);
      setStartTime(Date.now());
    }

    const targetWord = words[currentWordIndex];

    // Handle Backspace
    if (e.key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1));
      return;
    }

    // Handle Space (Word Submission)
    if (e.key === ' ') {
      e.preventDefault();
      // Only allow submit if something was typed
      if (currentInput.length > 0) {
        // Check if word matches exactly
        if (currentInput === targetWord) {
          setCorrectCharCount(prev => prev + targetWord.length + 1); // +1 for space
          setStreak(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
          setStreak(0);
        }

        // Move to next word
        setCurrentWordIndex(prev => prev + 1);
        setCurrentInput('');

        // Append new word to infinite buffer to ensure we never run out
        if (words.length - currentWordIndex < 20) {
             setWords(prev => [...prev, ...Array.from({ length: 10 }, () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)])]);
        }
      }
      return;
    }

    // Handle Character Input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setCurrentInput(prev => {
        const nextInput = prev + e.key;
        // Immediate char feedback checks can go here if needed
        return nextInput;
      });
    }
  }, [phase, words, currentWordIndex, currentInput]);

  const reset = useCallback(() => {
    setPhase(GamePhase.IDLE);
    setWords(Array.from({ length: 50 }, () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setStartTime(null);
    setCorrectCharCount(0);
    setErrorCount(0);
    setStreak(0);
    setTimeLeft(GAME_DURATION);
  }, []);

  return {
    phase,
    words,
    currentWordIndex,
    currentInput,
    stats,
    timeLeft,
    handleKeyDown,
    reset,
  };
};
