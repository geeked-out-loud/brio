'use client';

import { useState, useEffect, useRef } from 'react';
import { keyToDot, keysToDots, dotsToCharacter } from '@/utils/brailleMapping';
import { keyToNote, playNote, triggerHaptic } from '@/utils/piano';
import { SPECIAL_KEYS } from '@/utils/constants';
import type { UseBrailleInputReturn } from '@/types/braille';

export function useBrailleInput(): UseBrailleInputReturn {
  const [input, setInput] = useState('');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentDots, setCurrentDots] = useState<number[]>([]);
  const activeChordRef = useRef<Set<string>>(new Set());
  const maxChordRef = useRef<Set<string>>(new Set());
  const playedNotesRef = useRef<Set<string>>(new Set()); // Track which notes have been played
  const stopFunctionsRef = useRef<Map<string, () => void>>(new Map()); // Track stop functions for each note

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key in keyToDot && !e.repeat) {
        e.preventDefault();
        
        // Play piano note if not already played
        if (!playedNotesRef.current.has(key) && keyToNote[key]) {
          const stopFn = playNote(keyToNote[key].frequency, 2500, true); // Hold mode with 2.5s resonance
          stopFunctionsRef.current.set(key, stopFn);
          // Trigger haptic feedback based on which dot (1-6)
          triggerHaptic(keyToDot[key]);
          playedNotesRef.current.add(key);
        }
        
        // Add to active chord
        activeChordRef.current.add(key);
        
        // Update max chord (track the largest chord during this press)
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
        
        // Stop the note when key is released
        const stopFn = stopFunctionsRef.current.get(key);
        if (stopFn) {
          stopFn();
          stopFunctionsRef.current.delete(key);
        }
        
        // Remove from active chord
        activeChordRef.current.delete(key);
        playedNotesRef.current.delete(key); // Reset played state
        setPressedKeys(new Set(activeChordRef.current));
        
        // If ALL keys are now released, process the max chord
        if (activeChordRef.current.size === 0 && maxChordRef.current.size > 0) {
          const chordToProcess = new Set(maxChordRef.current);
          
          // Convert to Braille
          const dots = keysToDots(chordToProcess);
          const char = dotsToCharacter(dots);
          
          setInput(prev => prev + char);
          
          // Reset max chord for next character
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
  }, []);

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
