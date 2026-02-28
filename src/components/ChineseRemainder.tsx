'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to calculate GCD
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Check if array of numbers are pairwise coprime
function isPairwiseCoprime(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (gcd(arr[i], arr[j]) !== 1) return false;
    }
  }
  return true;
}

type Congruence = {
  modulus: number;
  remainder: number;
};

type State = {
  congruences: Congruence[];
  solution: number;
  currentX: number;
  isSolved: boolean;
};

export const ChineseRemainder = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState<State | null>(null);
  
  // We use a ref for the interval so we can clear it if needed
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 3500); // Appear slightly after matrix
    return () => clearTimeout(t);
  }, []);

  const initProblem = useCallback(() => {
    // Generate 3 pairwise coprime moduli
    const possibleModuli = [3, 4, 5, 7, 8, 9, 11, 13, 17];
    let selectedModuli: number[] = [];
    
    while (selectedModuli.length < 3) {
      // Shuffle and pick 3
      const shuffled = [...possibleModuli].sort(() => 0.5 - Math.random());
      const candidate = shuffled.slice(0, 3);
      if (isPairwiseCoprime(candidate)) {
        selectedModuli = candidate;
      }
    }

    selectedModuli.sort((a, b) => a - b);

    // Generate random remainders
    const congruences = selectedModuli.map(m => ({
      modulus: m,
      remainder: Math.floor(Math.random() * m)
    }));

    // Find solution (dumb search is fine here since max N is ~ 17*13*11 = 2431)
    const N = congruences.reduce((acc, c) => acc * c.modulus, 1);
    let solution = 0;
    for (let i = 0; i < N; i++) {
      if (congruences.every(c => i % c.modulus === c.remainder)) {
        solution = i;
        break;
      }
    }

    // Start currentX somewhere reasonably close so the animation doesn't take 5 minutes
    // Let's make it start 30-50 steps away from the solution
    const stepsAway = Math.floor(Math.random() * 20) + 30;
    let startX = solution - stepsAway;
    if (startX < 0) startX = 0; // fallback if solution is very small

    setState({
      congruences,
      solution,
      currentX: startX,
      isSolved: false
    });

  }, []);

  useEffect(() => {
    initProblem();
  }, [initProblem]);

  useEffect(() => {
    if (!state || !isMounted) return;

    if (state.currentX < state.solution) {
      intervalRef.current = setTimeout(() => {
        setState(s => s ? { ...s, currentX: s.currentX + 1 } : null);
      }, 80); // Fast tick
    } else if (state.currentX === state.solution && !state.isSolved) {
      // Mark as solved to trigger green pulse
      setState(s => s ? { ...s, isSolved: true } : null);
    } else if (state.isSolved) {
      // Wait a few seconds, then restart
      intervalRef.current = setTimeout(() => {
        initProblem();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [state, isMounted, initProblem]);

  if (!state) return null;

  return (
    // Positioned in the left empty space. 
    // Container right edge is at: 50vw - 24rem.
    // Screen left edge is at: 0vw.
    // So center of left space is (50vw - 24rem) / 2 = 25vw - 12rem
    <div 
      className={`absolute top-64 right-[calc(75vw+12rem)] translate-x-1/2 hidden xl:flex flex-col items-start z-0 pointer-events-none font-mono text-sm text-zinc-100 transition-opacity duration-1000 ${
        isMounted ? 'opacity-40 hover:opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col gap-3 border-l-2 border-zinc-500 pl-4 py-2">
        <div className="text-xs text-zinc-500 mb-2">Chinese Remainder Thm.</div>
        
        {/* Equations */}
        <div className="flex flex-col gap-2">
          {state.congruences.map((c, i) => {
            const isMatch = state.currentX % c.modulus === c.remainder;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-28">
                  <span>x ≡</span>
                  <span className={`tabular-nums ${state.isSolved ? 'text-green-400 font-bold' : ''}`}>
                    {c.remainder}
                  </span>
                  <span className="text-zinc-500">(mod {c.modulus})</span>
                </div>
                {/* Visual checkmark or current remainder */}
                <div className="flex items-center gap-1 w-16">
                  {state.isSolved ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <span className={`text-xs tabular-nums ${isMatch ? 'text-green-400' : 'text-zinc-600'}`}>
                      {state.currentX} % {c.modulus} = {state.currentX % c.modulus}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* The target X ticking up */}
        <div className="mt-4 border-t border-zinc-800 pt-3 flex items-center gap-4">
          <span className="text-zinc-400">Testing x =</span>
          <motion.span 
            key={state.currentX}
            initial={state.isSolved ? { scale: 1.2, color: '#4ade80' } : { y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className={`tabular-nums text-lg font-bold min-w-12 tracking-wider ${
              state.isSolved ? 'text-green-400' : 'text-zinc-200'
            }`}
          >
            {state.currentX}
          </motion.span>
        </div>
      </div>
    </div>
  );
};
