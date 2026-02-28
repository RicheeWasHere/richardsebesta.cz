'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Vector = {
  id: string;
  values: number[];
  isDependent: boolean;
  dependentOn?: number[]; // indices of vectors it depends on (for visual connection/highlighting later maybe)
};

type State = {
  vectors: Vector[];
  stage: 'idle' | 'testing' | 'fading' | 'done';
  currentIndex: number; // which vector we are currently testing
  dimension: number | null;
};

// We generate 5 vectors in R^3. This guarantees at least 2 are linearly dependent.
// To keep math simple and integer-based, we'll explicitly construct a basis of 3 vectors,
// and then 2 vectors that are random linear combinations of those 3.
function generateVectors(): Vector[] {
  // 3 random base vectors in Z^3 (small values)
  const v1 = [
    Math.floor(Math.random() * 5) - 2,
    Math.floor(Math.random() * 5) - 2,
    Math.floor(Math.random() * 5) - 2,
  ];
  const v2 = [
    Math.floor(Math.random() * 5) - 2,
    Math.floor(Math.random() * 5) - 2,
    Math.floor(Math.random() * 5) - 2,
  ];
  const v3 = [
    Math.floor(Math.random() * 5) - 2,
    Math.floor(Math.random() * 5) - 2,
    Math.floor(Math.random() * 5) - 2,
  ];

  // Random dependent vector 1: a*v1 + b*v2
  const a1 = Math.floor(Math.random() * 3) - 1;
  const b1 = Math.floor(Math.random() * 3) - 1;
  const dep1 = [
    a1 * v1[0] + b1 * v2[0],
    a1 * v1[1] + b1 * v2[1],
    a1 * v1[2] + b1 * v2[2],
  ];

  // Random dependent vector 2: c*v2 + d*v3
  const c2 = Math.floor(Math.random() * 3) - 1;
  const d2 = Math.floor(Math.random() * 3) - 1;
  const dep2 = [
    c2 * v2[0] + d2 * v3[0],
    c2 * v2[1] + d2 * v3[1],
    c2 * v2[2] + d2 * v3[2],
  ];

  const rawVectors = [
    { values: v1, isDependent: false },
    { values: v2, isDependent: false },
    { values: dep1, isDependent: true },
    { values: v3, isDependent: false },
    { values: dep2, isDependent: true },
  ];

  // Randomly shuffle them
  const shuffled = rawVectors
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled.map((v, i) => ({
    ...v,
    id: `vec-${i}-${Math.random().toString(36).slice(2, 7)}`
  }));
}


export const VectorBase = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 3500); // Appear slightly after matrix
    return () => clearTimeout(t);
  }, []);

  const initProblem = useCallback(() => {
    setState({
      vectors: generateVectors(),
      stage: 'idle',
      currentIndex: 0,
      dimension: null,
    });
  }, []);

  useEffect(() => {
    initProblem();
  }, [initProblem]);

  useEffect(() => {
    if (!state || !isMounted) return;

    let timer: NodeJS.Timeout;

    if (state.stage === 'idle') {
      timer = setTimeout(() => {
        setState({ ...state, stage: 'testing' });
      }, 1500);
    } 
    else if (state.stage === 'testing') {
      if (state.currentIndex < state.vectors.length) {
        // Look at current vector
        const currentVec = state.vectors[state.currentIndex];
        
        if (currentVec.isDependent) {
          // It's dependent! We show it fading out shortly
          timer = setTimeout(() => {
            setState({ ...state, stage: 'fading' });
          }, 1500);
        } else {
          // Independent, move to next
          timer = setTimeout(() => {
            setState({ ...state, currentIndex: state.currentIndex + 1 });
          }, 1000);
        }
      } else {
        // Finished testing all
        const indepCount = state.vectors.filter(v => !v.isDependent).length;
        timer = setTimeout(() => {
          setState({ ...state, stage: 'done', dimension: indepCount });
        }, 500);
      }
    }
    else if (state.stage === 'fading') {
      // Remove the dependent vector
      timer = setTimeout(() => {
        const newVectors = [...state.vectors];
        newVectors.splice(state.currentIndex, 1);
        
        setState({ 
          ...state, 
          vectors: newVectors,
          stage: 'testing' // don't increment index, because array shifted
        });
      }, 800);
    }
    else if (state.stage === 'done') {
      timer = setTimeout(() => {
        initProblem();
      }, 6000); // stay on 'done' for 6 seconds
    }

    return () => clearTimeout(timer);
  }, [state, isMounted, initProblem]);

  if (!state) return null;

  return (
    // Centered in left gutter
    <div 
      className={`absolute top-64 right-[calc(75vw+12rem)] translate-x-1/2 hidden xl:flex flex-col items-center justify-center z-0 pointer-events-none font-mono text-sm text-zinc-100 transition-opacity duration-1000 ${
        isMounted ? 'opacity-40 hover:opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col gap-4 border-l-2 border-r-2 border-zinc-500 px-4 py-3 min-h-[220px]">
        <div className="text-xs text-zinc-500 mb-2 text-center">Basis & Dimension</div>
        
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {state.vectors.map((vec, idx) => {
              const isBeingTested = state.stage === 'testing' && idx === state.currentIndex;
              const isFading = state.stage === 'fading' && idx === state.currentIndex;
              
              return (
                <motion.div
                  key={vec.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isFading ? 0 : isBeingTested ? 1 : 0.7,
                    x: isBeingTested ? 10 : 0,
                    color: isFading ? '#ef4444' : isBeingTested ? '#e4e4e7' : '#a1a1aa'
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-3 tabular-nums font-bold tracking-widest text-[#a1a1aa]"
                >
                  [{' '}
                  {vec.values.map((v, i) => (
                    <span key={i} className="w-6 text-right inline-block">
                      {v}
                    </span>
                  ))}
                  {' '}]
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dimension readout at bottom */}
        <div className="mt-auto pt-4 flex justify-center h-8">
          <AnimatePresence>
            {state.stage === 'done' && state.dimension !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-400 font-bold"
              >
                dim(V) = {state.dimension}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
