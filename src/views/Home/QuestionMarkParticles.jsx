import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import styles from './QuestionMarkParticles.module.css';

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const rng = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const mixHex = (h, t) => {
  const n = parseInt(h.slice(1), 16);
  return `rgb(${[(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => Math.round(v + (255 - v) * t))
    .join(',')})`;
};

function distanceTransform(mask, S) {
  const d = new Float32Array(S * S);
  for (let i = 0; i < d.length; i += 1) d[i] = mask[i] ? 1e9 : 0;
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      const i = y * S + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - S] + 1);
        if (x > 0) v = Math.min(v, d[i - S - 1] + 1.414);
        if (x < S - 1) v = Math.min(v, d[i - S + 1] + 1.414);
      }
      d[i] = v;
    }
  }
  for (let y = S - 1; y >= 0; y -= 1) {
    for (let x = S - 1; x >= 0; x -= 1) {
      const i = y * S + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x < S - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < S - 1) {
        v = Math.min(v, d[i + S] + 1);
        if (x < S - 1) v = Math.min(v, d[i + S + 1] + 1.414);
        if (x > 0) v = Math.min(v, d[i + S - 1] + 1.414);
      }
      d[i] = v;
    }
  }
  return d;
}

/**
 * Pack goo blobs for the HOOK only. The period is a separate bolita (trail tip).
 * Returns { blobs, dot: { u, v, r } } in units of full-glyph height, origin at glyph center.
 */
function packHook(text, count, dotFrom) {
  const S = 240;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${S * 0.92}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, S / 2, S / 2 + S * 0.02);
  const data = ctx.getImageData(0, 0, S, S).data;

  const mask = new Uint8Array(S * S);
  const inside = [];
  let minX = S;
  let maxX = 0;
  let minY = S;
  let maxY = 0;
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      if (data[(y * S + x) * 4 + 3] > 128) {
        mask[y * S + x] = 1;
        inside.push(y * S + x);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (!inside.length) return { blobs: [], dot: { u: 0, v: 0.42, r: 0.09 } };

  const H = Math.max(maxY - minY, 1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const splitY = minY + dotFrom * H;

  // Period centroid + radius from lower glyph pixels
  let dsx = 0;
  let dsy = 0;
  let dn = 0;
  let dMinX = S;
  let dMaxX = 0;
  let dMinY = S;
  let dMaxY = 0;
  for (const i of inside) {
    const y = (i / S) | 0;
    if (y < splitY) continue;
    const x = i % S;
    dsx += x;
    dsy += y;
    dn += 1;
    dMinX = Math.min(dMinX, x);
    dMaxX = Math.max(dMaxX, x);
    dMinY = Math.min(dMinY, y);
    dMaxY = Math.max(dMaxY, y);
  }

  const dot =
    dn > 0
      ? {
          u: (dsx / dn - cx) / H,
          v: (dsy / dn - cy) / H,
          r: Math.max((dMaxX - dMinX), (dMaxY - dMinY)) / 2 / H,
        }
      : { u: 0, v: 0.42, r: 0.09 };

  // Hook mask only (exclude period)
  const hookMask = new Uint8Array(S * S);
  const hookInside = [];
  for (const i of inside) {
    const y = (i / S) | 0;
    if (y >= splitY) continue;
    hookMask[i] = 1;
    hookInside.push(i);
  }
  if (!hookInside.length) return { blobs: [], dot };

  const dt = distanceTransform(hookMask, S);
  let rmax = 0;
  for (const i of hookInside) rmax = Math.max(rmax, dt[i]);

  const rand = rng(11);
  const placed = [];
  for (let k = 0; k < count; k += 1) {
    const u = k / Math.max(1, count - 1);
    const rt = rmax * (1.05 - 0.78 * u ** 0.7) * (0.92 + rand() * 0.16);
    const pool = hookInside.filter((i) => dt[i] >= rt * 0.55);
    if (!pool.length) continue;
    let best = null;
    let bs = -Infinity;
    for (let m = 0; m < 80; m += 1) {
      const i = pool[(rand() * pool.length) | 0];
      const x = i % S;
      const y = (i / S) | 0;
      const r = Math.min(rt, dt[i] * 1.1);
      let score = Infinity;
      for (const p of placed) {
        score = Math.min(score, Math.hypot(p.x - x, p.y - y) - 0.55 * (r + p.r));
      }
      if (score > bs) {
        bs = score;
        best = { x, y, r };
      }
    }
    if (best) placed.push(best);
  }

  const blobs = placed.map((p) => ({
    u: (p.x - cx) / H,
    v: (p.y - cy) / H,
    r: p.r / H,
  }));

  return { blobs, dot };
}

/**
 * Gooey "?" hook that assembles with scroll/tip.
 * The orange bolita (trail tip) is the period — same scale, centered under the hook.
 */
const QuestionMarkParticles = forwardRef(function QuestionMarkParticles(
  {
    progress = 0,
    tipArrived = false,
    reduce = false,
    text = '?',
    count = 30,
    base = '#f2efe8',
    dotFrom = 0.78,
    viscosity = 0.95,
    goo = 0.85,
  },
  ref
) {
  const stageRef = useRef(null);
  const mountRef = useRef(null);
  const gRef = useRef(null);
  const svgRef = useRef(null);
  const filterRef = useRef(null);
  const blurRef = useRef(null);
  const tipProgressRef = useRef(progress);
  const reduceRef = useRef(reduce);
  const [dotSize, setDotSize] = useState(28);
  const uid = useId().replace(/:/g, '');
  const fid = `goo-${uid}`;

  tipProgressRef.current = progress;
  reduceRef.current = reduce;

  useEffect(() => {
    const stage = stageRef.current;
    const mount = mountRef.current;
    const g = gRef.current;
    const svg = svgRef.current;
    if (!stage || !mount || !g || !svg) return undefined;

    const { blobs, dot } = packHook(text, count, dotFrom);
    const N = blobs.length;
    if (!N) return undefined;

    const rand = rng(99);
    const rMax = Math.max(...blobs.map((b) => b.r), 0.01);

    const circles = blobs.map(() => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('fill', mixHex(base, 0.05 + rand() * 0.18));
      g.appendChild(c);
      return c;
    });

    const fx = blobs.map(() => 0.1 + rand() * 0.8);
    const fy = blobs.map(() => 0.08 + rand() * 0.55);
    const ph = blobs.map(() => rand() * Math.PI * 2);
    const delay = blobs.map((b) =>
      clamp(0.5 * rand() + 0.5 * (1 - b.r / rMax))
    );
    const omega = blobs.map(
      (b) => (1.7 + 3.2 * (1 - b.r / rMax)) / viscosity
    );

    let W = 1;
    let H = 1;
    let gh = 1;
    let cx = 0;
    let cy = 0;
    const x = new Float32Array(N);
    const y = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);
    let scrollTarget = 0;
    let cur = 0;
    let last = performance.now();
    let visible = true;
    let dirty = true;
    let settled = false;
    let raf = 0;
    let first = true;

    const scatter = (i, t) => [
      fx[i] * W + Math.sin(t * 0.35 + ph[i]) * W * 0.04,
      fy[i] * H + Math.cos(t * 0.28 + ph[i] * 1.3) * H * 0.04,
    ];

    const syncDot = () => {
      const el = typeof ref === 'function' ? null : ref?.current;
      if (!el) return;
      // Period sits under the hook — fixed glyph slot, not a goo blob
      el.style.left = `${cx + dot.u * gh}px`;
      el.style.top = `${cy + dot.v * gh}px`;
    };

    const readScrollAssemble = () => {
      const band = stage.closest('[class*="contactBand"]') || stage;
      const r = band.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.92;
      const end = vh * 0.38;
      return clamp((start - r.top) / Math.max(start - end, 1));
    };

    const resize = () => {
      W = Math.max(mount.clientWidth, 1);
      H = Math.max(mount.clientHeight, 1);
      // Leave room under the hook for the bolita so the full "?" is centered
      gh = Math.min(H * 0.78, W * 0.9);
      cx = W / 2;
      cy = H * 0.48;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const f = filterRef.current;
      if (f) {
        f.setAttribute('x', String(-W * 0.25));
        f.setAttribute('y', String(-H * 0.25));
        f.setAttribute('width', String(W * 1.5));
        f.setAttribute('height', String(H * 1.5));
      }
      if (blurRef.current) {
        blurRef.current.setAttribute(
          'stdDeviation',
          Math.max(4, gh * 0.02 * goo).toFixed(2)
        );
      }
      // Bolita diameter matches the glyph period (~same visual weight as the hook)
      const px = Math.round(Math.max(22, Math.min(44, dot.r * gh * 2.35)));
      setDotSize(px);
      if (first) {
        for (let i = 0; i < N; i += 1) {
          [x[i], y[i]] = scatter(i, 0);
        }
        first = false;
      }
      syncDot();
      dirty = true;
    };

    const onScroll = () => {
      scrollTarget = readScrollAssemble();
      dirty = true;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const target = Math.max(clamp(tipProgressRef.current), clamp(scrollTarget));
      const reduceMotion = reduceRef.current;
      cur += (target - cur) * (1 - Math.exp(-dt * 5.5));
      const a = reduceMotion ? 1 : smoothstep(0.02, 0.88, cur);
      const floating = a < 0.999;
      if (!floating && settled && !dirty) {
        syncDot();
        return;
      }
      dirty = false;

      const t = now / 1000;
      let energy = 0;
      for (let i = 0; i < N; i += 1) {
        const e = reduceMotion
          ? 1
          : smoothstep(delay[i] * 0.35, delay[i] * 0.35 + 0.55, a);
        const [sx, sy] = scatter(i, t);
        const tx = sx + (cx + blobs[i].u * gh - sx) * e;
        const ty = sy + (cy + blobs[i].v * gh - sy) * e;
        if (reduceMotion) {
          x[i] = tx;
          y[i] = ty;
        } else {
          const w = omega[i];
          vx[i] += ((tx - x[i]) * w * w - 2 * w * vx[i]) * dt;
          vy[i] += ((ty - y[i]) * w * w - 2 * w * vy[i]) * dt;
          x[i] += vx[i] * dt;
          y[i] += vy[i] * dt;
          energy += Math.abs(vx[i]) + Math.abs(vy[i]);
        }
        const breathe = 1 + (1 - e) * 0.1 * Math.sin(t * 1.6 + ph[i]);
        const c = circles[i];
        c.setAttribute('cx', x[i].toFixed(1));
        c.setAttribute('cy', y[i].toFixed(1));
        c.setAttribute(
          'r',
          (blobs[i].r * gh * (0.82 + 0.22 * e) * breathe).toFixed(1)
        );
      }
      settled = energy < 0.05;
      syncDot();
    };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) dirty = true;
    });
    io.observe(mount);
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    onScroll();
    cur = Math.max(tipProgressRef.current, scrollTarget);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      circles.forEach((c) => c.remove());
    };
  }, [text, count, base, dotFrom, viscosity, goo, ref]);

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${tipArrived ? styles.stageLit : ''}`}
      aria-hidden
    >
      <div ref={mountRef} className={styles.mount}>
        <svg ref={svgRef} className={styles.svg} width="100%" height="100%">
          <defs>
            <filter
              ref={filterRef}
              id={fid}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                ref={blurRef}
                in="SourceGraphic"
                stdDeviation="8"
                result="b"
              />
              <feColorMatrix
                in="b"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              />
            </filter>
          </defs>
          <g ref={gRef} filter={`url(#${fid})`} />
        </svg>
        {/* Bolita = period of the "?" — trail tip lands on its center */}
        <span
          ref={ref}
          className={`${styles.punto} ${tipArrived ? styles.puntoLit : styles.puntoWait}`}
          style={{ width: dotSize, height: dotSize }}
        />
      </div>
    </div>
  );
});

export default QuestionMarkParticles;
