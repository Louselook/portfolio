import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import styles from './PuzzlePhoto.module.css';

const COLS = 3;
const ROWS = 3;

const f = (n) => Number(n.toFixed(3));

function pieceOffset(index, seed) {
  const angle = ((index * 137.5 + seed * 47) % 360) * (Math.PI / 180);
  const distance = 48 + ((index * 29 + seed * 13) % 80);
  const rotate = (index % 2 === 0 ? 1 : -1) * (8 + ((index * 7 + seed) % 16));
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotate,
  };
}

/** Cubic segments along an edge. bulgeSign +1 = tab toward CCW side of travel. */
function makeKnobCubics(x0, y0, x1, y1, bulgeSign, tabSize) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // CCW normal from travel direction
  const nx = -uy * bulgeSign;
  const ny = ux * bulgeSign;

  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const t = tabSize;

  const p = (along, out) => ({
    x: mx + ux * along + nx * out,
    y: my + uy * along + ny * out,
  });

  const a = t * 0.52;

  const b0 = p(-a * 1.35, 0);
  const n0 = p(-a * 0.5, t * 0.28);
  const h0 = p(-a * 0.92, t * 0.74);
  const tip = p(0, t * 1.02);
  const h1 = p(a * 0.92, t * 0.74);
  const n1 = p(a * 0.5, t * 0.28);
  const b1 = p(a * 1.35, 0);

  return [
    { p0: { x: x0, y: y0 }, c1: { x: x0, y: y0 }, c2: b0, p1: b0 },
    { p0: b0, c1: p(-a * 1.05, t * 0.06), c2: p(-a * 0.72, t * 0.12), p1: n0 },
    { p0: n0, c1: p(-a * 0.28, t * 0.45), c2: p(-a * 1.05, t * 0.5), p1: h0 },
    { p0: h0, c1: p(-a * 0.72, t * 0.98), c2: p(-a * 0.28, t * 1.02), p1: tip },
    { p0: tip, c1: p(a * 0.28, t * 1.02), c2: p(a * 0.72, t * 0.98), p1: h1 },
    { p0: h1, c1: p(a * 1.05, t * 0.5), c2: p(a * 0.28, t * 0.45), p1: n1 },
    { p0: n1, c1: p(a * 0.72, t * 0.12), c2: p(a * 1.05, t * 0.06), p1: b1 },
    { p0: b1, c1: b1, c2: { x: x1, y: y1 }, p1: { x: x1, y: y1 } },
  ];
}

function reverseCubics(cubics) {
  return cubics
    .slice()
    .reverse()
    .map((c) => ({
      p0: c.p1,
      c1: c.c2,
      c2: c.c1,
      p1: c.p0,
    }));
}

function cubicsToPath(cubics) {
  return cubics
    .map((c) => `C ${f(c.c1.x)} ${f(c.c1.y)} ${f(c.c2.x)} ${f(c.c2.y)} ${f(c.p1.x)} ${f(c.p1.y)}`)
    .join(' ');
}

function flatTo(x, y) {
  return `L ${f(x)} ${f(y)}`;
}

/**
 * Shared edges so tab of one piece === blank of the neighbor.
 * hEdges[r][c]: left→right, bulge +1 into lower row
 * vEdges[r][c]: top→bottom, bulge +1 into right column
 */
function buildSharedEdges(rows, cols, width, height) {
  const cellW = width / cols;
  const cellH = height / rows;
  const tabSize = Math.min(cellW, cellH) * 0.22;

  const hEdges = [];
  for (let r = 0; r < rows - 1; r += 1) {
    hEdges[r] = [];
    for (let c = 0; c < cols; c += 1) {
      const bulge = (r + c) % 2 === 0 ? 1 : -1;
      const x0 = c * cellW;
      const x1 = (c + 1) * cellW;
      const y = (r + 1) * cellH;
      hEdges[r][c] = makeKnobCubics(x0, y, x1, y, bulge, tabSize);
    }
  }

  const vEdges = [];
  for (let r = 0; r < rows; r += 1) {
    vEdges[r] = [];
    for (let c = 0; c < cols - 1; c += 1) {
      const bulge = (r + c) % 2 === 0 ? -1 : 1;
      const y0 = r * cellH;
      const y1 = (r + 1) * cellH;
      const x = (c + 1) * cellW;
      vEdges[r][c] = makeKnobCubics(x, y0, x, y1, bulge, tabSize);
    }
  }

  return { hEdges, vEdges, cellW, cellH };
}

function piecePath(row, col, rows, cols, shared) {
  const { hEdges, vEdges, cellW, cellH } = shared;
  const x0 = col * cellW;
  const y0 = row * cellH;
  const x1 = x0 + cellW;
  const y1 = y0 + cellH;

  const parts = [`M ${f(x0)} ${f(y0)}`];

  // Top L→R
  if (row === 0) parts.push(flatTo(x1, y0));
  else parts.push(cubicsToPath(hEdges[row - 1][col]));

  // Right T→B
  if (col === cols - 1) parts.push(flatTo(x1, y1));
  else parts.push(cubicsToPath(vEdges[row][col]));

  // Bottom R→L (reverse shared horizontal)
  if (row === rows - 1) parts.push(flatTo(x0, y1));
  else parts.push(cubicsToPath(reverseCubics(hEdges[row][col])));

  // Left B→T (reverse shared vertical)
  if (col === 0) parts.push(flatTo(x0, y0));
  else parts.push(cubicsToPath(reverseCubics(vEdges[row][col - 1])));

  parts.push('Z');
  return `path("${parts.join(' ')}")`;
}

export default function PuzzlePhoto({ src, alt }) {
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pieces = useMemo(() => {
    if (!size.width || !size.height) return [];
    const shared = buildSharedEdges(ROWS, COLS, size.width, size.height);
    const list = [];
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const index = row * COLS + col;
        list.push({
          index,
          clipPath: piecePath(row, col, ROWS, COLS, shared),
          offset: pieceOffset(index, 11),
        });
      }
    }
    return list;
  }, [size.height, size.width]);

  const lastDelay = 0.12 + (COLS * ROWS - 1) * 0.065;

  useEffect(() => {
    if (reduce) {
      setAssembled(true);
      return undefined;
    }
    if (!pieces.length) return undefined;

    setAssembled(false);
    const timer = window.setTimeout(() => setAssembled(true), (lastDelay + 0.95) * 1000);
    return () => window.clearTimeout(timer);
  }, [reduce, lastDelay, src, pieces.length]);

  if (reduce) {
    return (
      <div className={styles.frame} ref={frameRef}>
        <img className={`${styles.clean} ${styles.cleanVisible}`} src={src} alt={alt} />
      </div>
    );
  }

  return (
    <div
      ref={frameRef}
      className={`${styles.frame} ${assembled ? styles.assembled : styles.assembling}`}
      role="img"
      aria-label={alt}
    >
      <img
        className={`${styles.clean} ${assembled ? styles.cleanVisible : ''}`}
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className={styles.pieces} aria-hidden="true">
        {pieces.map((piece) => (
          <motion.div
            key={`${piece.index}-${size.width}x${size.height}`}
            className={styles.piece}
            style={{ clipPath: piece.clipPath }}
            initial={{
              opacity: 0,
              x: piece.offset.x,
              y: piece.offset.y,
              rotate: piece.offset.rotate,
              scale: 0.9,
            }}
            animate={{
              opacity: assembled ? 0 : 1,
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 18,
              mass: 0.8,
              delay: assembled ? 0 : 0.12 + piece.index * 0.065,
              opacity: {
                duration: assembled ? 0.3 : 0.2,
                delay: assembled ? 0 : 0.12 + piece.index * 0.065,
              },
            }}
          >
            <img className={styles.pieceImg} src={src} alt="" draggable={false} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
