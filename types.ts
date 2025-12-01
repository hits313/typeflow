export type CharStatus = 'pending' | 'correct' | 'incorrect';

export interface LetterState {
  char: string;
  status: CharStatus;
  id: string; // Unique ID for Framer Motion layoutId
}

export type AgentMood = 'idle' | 'focus' | 'streak' | 'error';

export interface GameStats {
  wpm: number;
  accuracy: number;
  streak: number;
  progress: number; // 0 to 1
}

export enum GamePhase {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
}

export interface Snippet {
  id: string;
  title: string;
  category: 'CODE' | 'LORE' | 'BIO';
  text: string;
  difficulty: 'Easy' | 'Med' | 'Hard';
}