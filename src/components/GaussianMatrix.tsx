'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Row = {
  id: string;
  values: number[];
};

type Operation =
  | { type: 'init' }
  | { type: 'swap'; fromIndex: number; toIndex: number }
  | { type: 'add'; sourceIndex: number; targetIndex: number; factor: number; isAddition: boolean }
  | { type: 'done' };

type Step = {
  matrix: Row[];
  op: Operation;
};

const ROW_HEIGHT = 32; // h-8
const ROW_GAP = 8;     // gap-2
const CONTAINER_PY = 8; // py-2
const Y_OFFSET = ROW_HEIGHT / 2;

function getRowY(index: number) {
  return CONTAINER_PY + index * (ROW_HEIGHT + ROW_GAP) + Y_OFFSET;
}

// Generates steps by starting from a solved state (Row Echelon Form)
// and applying random reverse operations. This guarantees the matrix is
// solvable back to REF using integers. Then we reverse the steps to show solving.
function generateIntegerSteps(rows: number, cols: number, existingRowIds?: string[]): Step[] {
  const initialRowIds = existingRowIds || Array.from({ length: rows }, (_, i) => `r${i}`);

  const cloneM = (m: Row[]) => m.map((r) => ({ ...r, values: [...r.values] }));

  // Start with a randomized pseudo-Row-Echelon-Form matrix
  // Row 1: X X X | X
  // Row 2: 0 X X | X
  // Row 3: 0 0 X | X   (or 0 0 0 | 0)
  const m: Row[] = Array.from({ length: rows }, (_, i) => ({
    id: initialRowIds[i],
    values: Array.from({ length: cols }, (_, j) => {
      if (j < i) return 0; // Forced zeros for REF
      return Math.floor(Math.random() * 9) + 1; // 1 to 9
    })
  }));

  // We want the final "solved" state to be in our steps list at the end
  const reverseSteps: { matrix: Row[]; op: Operation }[] = [];
  reverseSteps.push({ matrix: cloneM(m), op: { type: 'done' } });

  const numOperations = 5 + Math.floor(Math.random() * 4); // 5 to 8 operations

  // Apply backward operations to scramble the matrix
  for (let i = 0; i < numOperations; i++) {
    const opType = Math.random() > 0.8 ? 'swap' : 'add';

    if (opType === 'swap') {
      const r1 = Math.floor(Math.random() * rows);
      let r2 = Math.floor(Math.random() * rows);
      while (r2 === r1) {
        r2 = Math.floor(Math.random() * rows);
      }
      
      const temp = m[r1];
      m[r1] = m[r2];
      m[r2] = temp;
      
      // The forward operation to undo this swap is just swapping back
      reverseSteps.push({
        matrix: cloneM(m),
        op: { type: 'swap', fromIndex: r2, toIndex: r1 } // Notice reversed indices for forward replay
      });
    } else {
      const source = Math.floor(Math.random() * rows);
      let target = Math.floor(Math.random() * rows);
      while (target === source) {
        target = Math.floor(Math.random() * rows);
      }
      
      const factors = [-2, -1, 1, 2];
      const factor = factors[Math.floor(Math.random() * factors.length)];
      
      // In reverse, we add factor * source to target
      m[target] = { ...m[target], values: [...m[target].values] };
      for (let j = 0; j < cols; j++) {
        m[target].values[j] = m[target].values[j] + m[source].values[j] * factor;
      }

      // The forward operation to undo this reverse is subtracting factor * source (i.e. adding -factor)
      const forwardFactor = -factor;
      const isAddition = forwardFactor > 0;
      
      reverseSteps.push({
        matrix: cloneM(m),
        op: { type: 'add', sourceIndex: source, targetIndex: target, factor: forwardFactor, isAddition }
      });
    }
  }

  // Right now reverseSteps goes from Solved -> Scrambled.
  // We want to return Scrambled -> Solved.
  const steps: Step[] = [];
  
  // The last element in reverseSteps is the most scrambled state. It serves as our 'init' matrix.
  const scrambledStart = reverseSteps[reverseSteps.length - 1].matrix;
  steps.push({ matrix: cloneM(scrambledStart), op: { type: 'init' } });

  // Now replay the forward operations, applying them to the current matrix state to reach solved
  let currentM = cloneM(scrambledStart);
  for (let i = reverseSteps.length - 1; i > 0; i--) {
    const forwardOp = reverseSteps[i].op;
    
    // Apply forward op to currentM to get the next state
    if (forwardOp.type === 'swap') {
      const temp = currentM[forwardOp.fromIndex];
      currentM[forwardOp.fromIndex] = currentM[forwardOp.toIndex];
      currentM[forwardOp.toIndex] = temp;
    } else if (forwardOp.type === 'add') {
      currentM[forwardOp.targetIndex] = { ...currentM[forwardOp.targetIndex], values: [...currentM[forwardOp.targetIndex].values] };
      for (let j = 0; j < cols; j++) {
        currentM[forwardOp.targetIndex].values[j] += currentM[forwardOp.sourceIndex].values[j] * forwardOp.factor;
      }
    }
    
    // Push the state AFTER the operation, but associate it with the operation that got us there.
    // Wait, the way GaussianMatrix is written:
    // `currentStep.matrix` is the current numbers visible.
    // `currentStep.op` is the operation happening *to* that matrix to get to the next one?
    // Let's modify the component to separate the currently visible matrix from the pending operation arrow.
    steps.push({ matrix: cloneM(currentM), op: forwardOp });
  }

  steps.push({ matrix: cloneM(currentM), op: { type: 'done' } });

  return steps;
}

const numberVariants = {
  initial: (y: number) => ({
    y,
    opacity: 0,
  }),
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: (y: number) => ({
    y: -y,
    opacity: 0,
  }),
};

const AnimatedCell = ({ value, isAddition, isLast }: { value: number, isAddition: boolean | null, isLast: boolean }) => {
  // If isAddition is true, slides up (from below). If false, slides down (from above).
  // If null (e.g. reshuffle/init), default to sliding up.
  const yOffset = isAddition === true ? 15 : isAddition === false ? -15 : 15;
  
  return (
    <div className={`relative flex items-center overflow-hidden h-8 ${isLast ? 'border-l border-zinc-700/50 pl-4 w-12' : 'w-8'}`}>
      <AnimatePresence custom={yOffset}>
        <motion.span
          key={value}
          custom={yOffset}
          variants={numberVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "backOut" }}
          className="absolute right-0 tabular-nums"
        >
          {value === 0 ? '0' : value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const GaussianMatrix = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // We introduce an intermediate state to show the arrow BEFORE updating the numbers
  const [showingArrow, setShowingArrow] = useState(false);

  // Delay the initial appearance
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 3000); // Appear 3s after load
    return () => clearTimeout(t);
  }, []);

  const initMatrix = useCallback(() => {
    setSteps((prevSteps) => {
      // If we already have a matrix visible on screen, we want to extract its current row IDs
      // so we can reuse them. This prevents React from completely unmounting the rows and 
      // instead just animates the value changes like a slot machine.
      let existingIds: string[] | undefined;
      if (prevSteps.length > 0) {
        // The last visible state is the 'done' state or the current state.
        const lastMatrix = prevSteps[prevSteps.length - 1].matrix;
        existingIds = lastMatrix.map(r => r.id);
      }

      const newSteps = generateIntegerSteps(3, 4, existingIds);
      setCurrentStepIndex(0);
      setShowingArrow(false);
      return newSteps;
    });
  }, []);

  useEffect(() => {
    initMatrix();
  }, [initMatrix]);

  useEffect(() => {
    if (steps.length === 0 || !isMounted) return;

    let arrowTimerId: NodeJS.Timeout;
    let stepTimerId: NodeJS.Timeout;

    if (currentStepIndex < steps.length - 1) {
      if (!showingArrow) {
        // Step 1: Show the arrow/operation for the NEXT step
        arrowTimerId = setTimeout(() => {
          setShowingArrow(true);
        }, 800);
      } else {
        // Step 2: Actually advance to the next step, updating numbers and hiding arrow
        stepTimerId = setTimeout(() => {
          setShowingArrow(false);
          setCurrentStepIndex((prev) => prev + 1);
        }, 1200); // time the arrow is visible before numbers change
      }
    } else {
      // Done. Wait a bit, then restart.
      stepTimerId = setTimeout(() => {
        initMatrix();
      }, 4000); // Wait 4s before restarting
    }

    return () => {
      clearTimeout(arrowTimerId);
      clearTimeout(stepTimerId);
    };
  }, [currentStepIndex, steps.length, initMatrix, isMounted, showingArrow]);

  if (steps.length === 0) return null;

  const currentMatrix = steps[currentStepIndex].matrix;
  
  // The operation is what we are *about to do* (the next step's operation)
  // If we are showing the arrow, we peek at the next step's operation
  let nextOp: Operation = { type: 'init' };
  if (showingArrow && currentStepIndex < steps.length - 1) {
    nextOp = steps[currentStepIndex + 1].op;
  }

  const renderPath = (sourceY: number, targetY: number, colorClass: string) => {
    const cpX = -25;
    return (
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        d={`M 10,${sourceY} C ${cpX},${sourceY} ${cpX},${targetY} 10,${targetY}`}
        fill="none"
        className={colorClass}
        strokeWidth="1.5"
      />
    );
  };

  return (
    // The main container has max-w-4xl (48rem) and is centered.
    // So its right edge is at: 50vw + 24rem.
    // The right edge of the screen is at: 100vw.
    // The center of the empty space on the right is exactly halfway between them:
    // (50vw + 24rem + 100vw) / 2 = 75vw + 12rem
    // We position the left edge there, and then use -translate-x-1/2 to perfectly center the component itself.
    <div 
      className={`absolute top-125 left-[calc(75vw+12rem)] -translate-x-1/2 hidden xl:flex flex-col items-center z-0 pointer-events-none font-mono text-sm text-zinc-100 transition-opacity duration-1000 ${
        isMounted ? 'opacity-40 hover:opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative border-l-2 border-r-2 border-zinc-500 px-4 py-2 flex flex-col gap-2">
        {/* SVG overlay for addition arrows - NO triangle, colored lines */}
        <AnimatePresence>
          {showingArrow && nextOp.type === 'add' && (
            <svg 
              key={`arrow-${currentStepIndex}`} // Re-render arrow per operation
              className="absolute -left-10 top-0 w-10 h-full pointer-events-none overflow-visible"
            >
              {renderPath(
                getRowY(nextOp.sourceIndex), 
                getRowY(nextOp.targetIndex), 
                nextOp.isAddition ? "stroke-green-500/50" : "stroke-red-500/50"
              )}
            </svg>
          )}
        </AnimatePresence>

        {/* Matrix Rows */}
        <AnimatePresence>
          {currentMatrix.map((row, i) => {
            let rowIsAddition: boolean | null = null;
            const currentOp = steps[currentStepIndex].op;
            if (currentOp.type === 'add' && i === currentOp.targetIndex) {
              rowIsAddition = currentOp.isAddition;
            }

            return (
              <motion.div 
                key={row.id}
                layout="position" // Animates DOM re-ordering
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex gap-4 w-full h-8 items-center"
              >
                {row.values.map((val, j) => (
                  <AnimatedCell 
                    key={j} 
                    value={val} 
                    isAddition={rowIsAddition} 
                    isLast={j === row.values.length - 1} 
                  />
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
