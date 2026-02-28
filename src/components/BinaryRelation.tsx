'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
};

type Edge = {
  id: string;
  from: string;
  to: string;
  type: 'reflexive' | 'symmetric' | 'transitive';
};

type State = {
  nodes: Node[];
  allEdges: Edge[];
  visibleEdgeCount: number;
  stage: 'idle' | 'building' | 'done';
  relationType: 'Equivalence Relation' | 'Partial Order';
};

const NODE_RADIUS = 16; // for centering lines

// Generate 3-6 nodes in a rough circle/polygon to make the graph look nice
function generateNodes(count: number): Node[] {
  const nodes: Node[] = [];
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // start from top
    nodes.push({
      id: `n${i}`,
      label: String.fromCharCode(97 + i), // a, b, c, d...
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  return nodes;
}

// Generate edges for Equivalence (Reflexive, Symmetric, Transitive)
function generateEquivalenceEdges(nodes: Node[]): Edge[] {
  let edges: Edge[] = [];

  // Reflexivity
  for (const n of nodes) {
    edges.push({ id: `e-${n.id}-${n.id}`, from: n.id, to: n.id, type: 'reflexive' });
  }

  const numClasses = Math.max(1, Math.min(3, Math.floor(Math.random() * nodes.length)));
  const classes: string[][] = Array.from({ length: numClasses }, () => []);
  
  for (const n of nodes) {
    const classIdx = Math.floor(Math.random() * numClasses);
    classes[classIdx].push(n.id);
  }

  for (const eqClass of classes) {
    if (eqClass.length < 2) continue;
    for (let i = 0; i < eqClass.length; i++) {
      for (let j = i + 1; j < eqClass.length; j++) {
        edges.push({ id: `e-${eqClass[i]}-${eqClass[j]}`, from: eqClass[i], to: eqClass[j], type: 'symmetric' });
        edges.push({ id: `e-${eqClass[j]}-${eqClass[i]}`, from: eqClass[j], to: eqClass[i], type: 'symmetric' });

        for (let k = j + 1; k < eqClass.length; k++) {
          edges.push({ id: `e-${eqClass[i]}-${eqClass[k]}`, from: eqClass[i], to: eqClass[k], type: 'transitive' });
          edges.push({ id: `e-${eqClass[k]}-${eqClass[i]}`, from: eqClass[k], to: eqClass[i], type: 'transitive' });
        }
      }
    }
  }

  const uniqueEdges = [];
  const seen = new Set();
  for (const e of edges) {
    if (!seen.has(e.id)) { seen.add(e.id); uniqueEdges.push(e); }
  }
  return uniqueEdges.sort(() => Math.random() - 0.5);
}

// Generate edges for Partial Order (Reflexive, Antisymmetric, Transitive)
// This is the underlying structure of a Hasse diagram.
function generatePartialOrderEdges(nodes: Node[]): Edge[] {
  let edges: Edge[] = [];

  // Reflexivity
  for (const n of nodes) {
    edges.push({ id: `e-${n.id}-${n.id}`, from: n.id, to: n.id, type: 'reflexive' });
  }

  // To guarantee Antisymmetry and Transitivity, we generate a Directed Acyclic Graph (DAG)
  // and then compute its transitive closure.
  // Easiest DAG: edges only go from nodes[i] to nodes[j] where i < j.
  
  // Decide some base relation edges
  const adjMatrix: boolean[][] = Array.from({ length: nodes.length }, () => Array(nodes.length).fill(false));
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      // 50% chance of an edge from i to j to keep the graph from being a total order or entirely disconnected
      if (Math.random() > 0.5) {
        adjMatrix[i][j] = true;
      }
    }
  }

  // Floyd-Warshall for Transitive Closure
  for (let k = 0; k < nodes.length; k++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (adjMatrix[i][k] && adjMatrix[k][j]) {
          adjMatrix[i][j] = true;
        }
      }
    }
  }

  // Build the edge list
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (adjMatrix[i][j]) {
        // Technically these are a mix of base edges and transitive edges, but we'll label them transitive
        edges.push({ id: `e-${nodes[i].id}-${nodes[j].id}`, from: nodes[i].id, to: nodes[j].id, type: 'transitive' });
      }
    }
  }

  // Shuffle visible edges
  return edges.sort(() => Math.random() - 0.5);
}

export const BinaryRelation = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const initProblem = useCallback(() => {
    const nodeCount = Math.floor(Math.random() * 4) + 3;
    const nodes = generateNodes(nodeCount);
    
    // 50/50 split between Equivalence and Partial Order
    const isEquivalence = Math.random() > 0.5;
    const relationType = isEquivalence ? 'Equivalence Relation' : 'Partial Order';
    const allEdges = isEquivalence ? generateEquivalenceEdges(nodes) : generatePartialOrderEdges(nodes);

    setState({
      nodes,
      allEdges,
      visibleEdgeCount: 0,
      stage: 'idle',
      relationType,
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
        setState({ ...state, stage: 'building' });
      }, 1500);
    } else if (state.stage === 'building') {
      if (state.visibleEdgeCount < state.allEdges.length) {
        timer = setTimeout(() => {
          setState({ ...state, visibleEdgeCount: state.visibleEdgeCount + 1 });
        }, 800); // Slower line drawing (was 300)
      } else {
        timer = setTimeout(() => {
          setState({ ...state, stage: 'done' });
        }, 2000);
      }
    } else if (state.stage === 'done') {
      timer = setTimeout(() => {
        initProblem();
      }, 5000); // 5s reset
    }

    return () => clearTimeout(timer);
  }, [state, isMounted, initProblem]);

  if (!state) return null;

  const currentEdges = state.allEdges.slice(0, state.visibleEdgeCount);

  // Helper to render lines between nodes
  const renderEdge = (e: Edge, i: number) => {
    const fromNode = state.nodes.find((n) => n.id === e.from);
    const toNode = state.nodes.find((n) => n.id === e.to);
    
    if (!fromNode || !toNode) return null;

    if (e.from === e.to) {
      // Loop: rendering a small circle offset from the node
      // Use the center of 150 for math
      const angle = Math.atan2(fromNode.y - 150, fromNode.x - 150);
      const loopX = fromNode.x + Math.cos(angle) * 22;
      const loopY = fromNode.y + Math.sin(angle) * 22;

      // We want the circle to start drawing exactly from where it touches the node.
      // An SVG <circle> natively starts its stroke at 3 o'clock (0 radians).
      // The node is sitting at angle + Math.PI relative to the center of this new loop.
      // So we rotate the circle so its 0-radian start point faces the node.
      const rotationDeg = ((angle + Math.PI) * 180) / Math.PI;

      return (
        <motion.circle
          key={e.id}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5 }} // Slower animation
          cx={loopX}
          cy={loopY}
          r={10}
          fill="none"
          className="stroke-zinc-500/60"
          strokeWidth="1.5"
          style={{
            transformOrigin: `${loopX}px ${loopY}px`,
            rotate: rotationDeg
          }}
        />
      );
    } else {
      // Curve between nodes
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const offsetX = (dx / dist) * NODE_RADIUS;
      const offsetY = (dy / dist) * NODE_RADIUS;

      const sx = fromNode.x + offsetX;
      const sy = fromNode.y + offsetY;
      const tx = toNode.x - offsetX;
      const ty = toNode.y - offsetY;

      const mX = (sx + tx) / 2;
      const mY = (sy + ty) / 2;
      
      const bow = e.from < e.to ? 16 : -16; // increased bow slightly for larger scale
      
      const nx = -dy / dist;
      const ny = dx / dist;

      const cpX = mX + nx * bow;
      const cpY = mY + ny * bow;

      // Calculate the angle of the curve at the end point for the arrowhead
      // Derivative of quadratic bezier at t=1 is proportional to End - Control
      const dirX = tx - cpX;
      const dirY = ty - cpY;
      const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
      const normDirX = dirX / dirLen;
      const normDirY = dirY / dirLen;
      
      // Arrowhead points
      const arrowSize = 6;
      const arrowPt1X = tx - normDirX * arrowSize - normDirY * arrowSize * 0.6;
      const arrowPt1Y = ty - normDirY * arrowSize + normDirX * arrowSize * 0.6;
      const arrowPt2X = tx - normDirX * arrowSize + normDirY * arrowSize * 0.6;
      const arrowPt2Y = ty - normDirY * arrowSize - normDirX * arrowSize * 0.6;

      return (
        <g key={e.id}>
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "linear" }}
            d={`M ${sx},${sy} Q ${cpX},${cpY} ${tx},${ty}`}
            fill="none"
            className="stroke-zinc-400/50"
            strokeWidth="1.5"
          />
          {/* Arrowhead rendering separately, fading in precisely after the line finishes drawing */}
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.45, duration: 0.2 }}
            points={`${tx},${ty} ${arrowPt1X},${arrowPt1Y} ${arrowPt2X},${arrowPt2Y}`}
            className="fill-zinc-400/50"
          />
        </g>
      );
    }
  };

  return (
    <div 
      className={`absolute top-[1600px] left-[calc(25vw-12rem)] -translate-x-1/2 hidden xl:flex flex-col items-center justify-center z-0 pointer-events-none font-mono text-sm text-zinc-100 transition-opacity duration-1000 ${
        isMounted ? 'opacity-40 hover:opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-2 px-4 py-3 min-h-[340px]">
        
        <motion.div 
          className="relative w-[300px] h-[300px]"
          animate={{ opacity: state.stage === 'done' ? 0 : 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
            <AnimatePresence>
              {currentEdges.map(renderEdge)}
            </AnimatePresence>
          </svg>
          
          {/* Nodes */}
          {state.nodes.map(n => (
            <div
              key={n.id}
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border border-zinc-500 bg-zinc-950 flex items-center justify-center text-zinc-300 pointer-events-none z-10 shadow-[0_0_10px_rgba(0,0,0,0.8)]"
              style={{ left: n.x, top: n.y }}
            >
              {n.label}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
