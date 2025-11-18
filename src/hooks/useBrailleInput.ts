'use client';

import { useState, useEffect, useRef } from 'react';
import { keyToDot, keysToDots, dotsToCharacter } from '@/utils/brailleMapping';
import { keyToNote, playPianoNote, playMechanicalClick, playMechanicalRelease, triggerHaptic, unlockAudio, type AudioMode } from '@/utils/audioFeedback';
import { SPECIAL_KEYS } from '@/utils/constants';
import type { UseBrailleInputReturn } from '@/types/braille';

export function useBrailleInput(audioMode: AudioMode = 'piano'): UseBrailleInputReturn {
  const [input, setInput] = useState('');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentDots, setCurrentDots] = useState<number[]>([]);
  const activeChordRef = useRef<Set<string>>(new Set());
  const maxChordRef = useRef<Set<string>>(new Set());
  const playedNotesRef = useRef<Set<string>>(new Set());
  const stopFunctionsRef = useRef<Map<string, () => void>>(new Map());
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key in keyToDot && !e.repeat) {
        e.preventDefault();
        
        // Unlock audio on first interaction (mobile requirement)
        if (!audioUnlockedRef.current) {
          await unlockAudio();
          audioUnlockedRef.current = true;
        }
        
        if (audioMode === 'piano') {
          if (!playedNotesRef.current.has(key) && keyToNote[key]) {
            const stopFn = playPianoNote(keyToNote[key].frequency, 2500, true);
            stopFunctionsRef.current.set(key, stopFn);
            triggerHaptic(keyToDot[key]);
            playedNotesRef.current.add(key);
          }
        } else {
          if (!playedNotesRef.current.has(key)) {
            const stopFn = playMechanicalClick(key);
            stopFunctionsRef.current.set(key, stopFn);
            triggerHaptic(keyToDot[key]);
            playedNotesRef.current.add(key);
          }
        }
        
        activeChordRef.current.add(key);
        
        if (activeChordRef.current.size > maxChordRef.current.size) {
          maxChordRef.current = new Set(activeChordRef.current);
        }
        
        setPressedKeys(new Set(activeChordRef.current));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key in keyToDot) {
        e.preventDefault();
        
        if (audioMode === 'piano') {
          const stopFn = stopFunctionsRef.current.get(key);
          if (stopFn) {
            stopFn();
            stopFunctionsRef.current.delete(key);
          }
        } else {
          playMechanicalRelease(key);
        }
        
        activeChordRef.current.delete(key);
        playedNotesRef.current.delete(key);
        setPressedKeys(new Set(activeChordRef.current));
        
        if (activeChordRef.current.size === 0 && maxChordRef.current.size > 0) {
          const chordToProcess = new Set(maxChordRef.current);
          
          const dots = keysToDots(chordToProcess);
          const char = dotsToCharacter(dots);
          
          setInput(prev => prev + char);
          
          maxChordRef.current = new Set();
        }
        
      } else if (e.key === SPECIAL_KEYS.BACKSPACE) {
        e.preventDefault();
        setInput(prev => prev.slice(0, -1));
      } else if (e.key === SPECIAL_KEYS.SPACE) {
        e.preventDefault();
        setInput(prev => prev + ' ');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [audioMode]);

  useEffect(() => {
    const dots = keysToDots(pressedKeys);
    setCurrentDots(dots);
  }, [pressedKeys]);

  return {
    input,
    pressedKeys,
    currentDots,
  };
}
