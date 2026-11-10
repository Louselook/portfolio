import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import { getStackIcon } from '../../data/stackIcons';
import ProjectsCarousel from '../../components/projects/ProjectsCarousel';
import QuestionMarkParticles from './QuestionMarkParticles';
import styles from './HomePage.module.css';
import { smoothDamp, tailFromVelocity } from './trailSmoothing';
import {
  buildSpline,
  buildTrack,
  clamp,
  coil,
  cubicPoints,
  frontRangesOf,
  passU,
  rectInPage,
  smoothstep,
  textRectInPage,
  trailParams,
} from './trailRoute';

const BUBBLE_NAMES = ['Flutter', 'FastAPI', 'React', 'Python', 'Supabase', 'Firebase'];
const BUBBLE_SIZES = ['sm', 'md', 'lg'];
/** Wordmark logos need a bigger bubble so the text stays readable. */
const BUBBLE_WORDMARKS = new Set(['FastAPI', 'Firebase']);

function shuffleList(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

/**
 * Corner cluster: half out / half in, compact but with clear gaps (~15% centers).
 */
function clusterCorner(count, corner) {
  const templates = {
    1: [{ u: -7, v: -7 }],
    2: [
      { u: -9, v: 1 },
      { u: 2, v: -9 },
    ],
    3: [
      { u: -9, v: -5 },
      { u: -7, v: 10 },
      { u: 10, v: -8 },
    ],
    4: [
      { u: -10, v: -6 },
      { u: -8, v: 10 },
      { u: 10, v: -9 },
      { u: 8, v: 8 },
    ],
    5: [
      { u: -10, v: -7 },
      { u: -9, v: 9 },
      { u: 9, v: -10 },
      { u: 0, v: 18 },
      { u: 18, v: 0 },
    ],
  };
  const base = templates[clamp(count, 1, 5)] || templates[3];
  const jitter = () => Math.random() * 1.6 - 0.8;

  return base.map(({ u, v }) => {
    const a = u + jitter();
    const b = v + jitter();
    if (corner === 'tl') {
      return { top: `${a}%`, left: `${b}%` };
    }
    return { bottom: `${a}%`, right: `${b}%` };
  });
}

/**
 * On each load: 1–5 bubbles in the top-left, the rest in the opposite
 * bottom-right corner (also 1–5). Names/sizes shuffled.
 */
function pickCornerSplit() {
  // Prefer 3–3 and 2–4 over 1–5
  const weighted = [2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 1, 5];
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function buildHeroBubbles() {
  const names = shuffleList(BUBBLE_NAMES);
  const topLeftCount = pickCornerSplit();
  const tlNames = names.slice(0, topLeftCount);
  const brNames = names.slice(topLeftCount);
  const tlSlots = clusterCorner(tlNames.length, 'tl');
  const brSlots = clusterCorner(brNames.length, 'br');
  const sizes = shuffleList([
    ...Array.from({ length: names.length }, (_, i) => BUBBLE_SIZES[i % BUBBLE_SIZES.length]),
  ]);

  const make = (name, slot, i) => ({
    name,
    ...slot,
    size: BUBBLE_WORDMARKS.has(name) ? 'xl' : sizes[i % sizes.length],
    wordmark: BUBBLE_WORDMARKS.has(name),
    delay: i * 0.18,
    dur: 4.2 + (i % 3) * 0.45,
  });

  return [
    ...tlNames.map((name, i) => make(name, tlSlots[i], i)),
    ...brNames.map((name, i) => make(name, brSlots[i], i + tlNames.length)),
  ];
}

const TRAIL_COLOR = '#FF6A3D';
/** Stroke widths in page px (the SVG viewBox matches the page size 1:1). */
const TRAIL_BASE_W = 2;
/** Capas cercanas en ancho para evitar escalones visibles. */
const TRAIL_LAYERS = [
  { k: 1.0, o: 0.22, w: 2.4 },
  { k: 0.62, o: 0.5, w: 2.9 },
  { k: 0.3, o: 0.9, w: 3.6 },
];
/** Tip sits in the upper half of the viewport mid-page (fraction of window height). */
const TIP_VIEW_ANCHOR = 0.38;
/** Path length (px) an element stays "hot" after the tip passes it. */
const HOT_SPAN_PX = 360;

const DEFAULT_MARKERS = {
  projectsTitle: 0.2,
  projectsZone: 0.26,
  stackTitle: 0.4,
  stackChips: [],
  expTitle: 0.6,
  expItems: [],
  contact: 0.88,
  contactHot: 1,
};

/** Dash pattern (pathLength=1) that only paints frontRanges up to tip progress. */
function frontStrokeDash(tipU, frontRanges) {
  const tip = clamp(tipU, 0, 1);
  const dash = [];
  let pos = 0;
  let painted = false;

  for (let i = 0; i < frontRanges.length; i += 1) {
    const start = Math.max(0, frontRanges[i][0]);
    const end = Math.min(tip, frontRanges[i][1]);
    if (end <= start) continue;

    if (!painted) {
      if (start > 0) dash.push(0, start);
      dash.push(end - start);
      painted = true;
    } else {
      dash.push(Math.max(0, start - pos), end - start);
    }
    pos = end;
  }

  if (!painted) return { dasharray: '0 2', visible: false };
  if (dash.length % 2 === 1) dash.push(2);
  return { dasharray: dash.join(' '), visible: true };
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

/**
 * Whole-page route in page px:
 *  name dot → coil around the logo card (right, behind R→L, front L→R)
 *  → coil around "Proyectos" → snake past the carousel → coil around "Stack"
 *  → serpentine through the chip rows → coil around "Experiencia"
 *  → wave beside the timeline → contact card → hook up into the "?" dot.
 */
function buildRoute(page, refs) {
  const W = page.offsetWidth;
  const H = page.offsetHeight;
  if (!W || !H) return null;
  const P = trailParams(W);
  const xMin = P.margin;
  const xMax = W - P.margin;

  const dot = rectInPage(page, refs.origin.current);
  if (!dot) return null;

  const pts = [{ x: dot.cx, y: dot.cy, layer: 'back' }];
  const add = (list) =>
    list.forEach((p) => pts.push({ x: clamp(p.x, 4, W - 4), y: p.y, layer: p.layer || 'back' }));
  const last = () => pts[pts.length - 1];

  const coilAround = (
    r,
    { aScale = 1, pad = 0, bFrac, minB = 0, driftFrac, steps, roundness, edge = P.margin }
  ) => {
    const lo = edge;
    const hi = W - edge;
    const maxHalf = (hi - lo) / 2;
    const half = Math.min(Math.max((r.w / 2) * aScale + pad, r.w / 2 + 8), maxHalf);
    const cx = clamp(r.cx, lo + half, hi - half);
    const drift = r.h * driftFrac;
    const b = Math.max(r.h * bFrac, minB);
    return coil({ cx, cy: r.cy - drift / 2, a: half, b, drift, steps, roundness });
  };

  // Vertical-tangent cubic from the last point to `to` (leave down, arrive down),
  // with a sinusoidal sideways sway on long gaps.
  const connect = (to, { snake = true } = {}) => {
    const from = last();
    const gap = to.y - from.y;
    if (gap < 30) return;
    const n = Math.max(6, Math.round(gap / 40));
    const curve = cubicPoints(
      from,
      { x: from.x, y: from.y + gap * 0.42 },
      { x: to.x, y: to.y - gap * 0.42 },
      to,
      n
    );
    const waves = Math.max(1, Math.round(gap / P.snakeWave));
    const sway = snake && gap > P.snakeWave * 0.6 ? P.snakeAmp : 0;
    add(
      curve.slice(1, -1).map((p, i) => {
        const t = (i + 1) / n;
        return { ...p, x: p.x + sway * Math.sin(Math.PI * waves * t) * Math.sin(Math.PI * t) };
      })
    );
  };

  const ringTitle = (el) => {
    const t = textRectInPage(page, el);
    if (!t) return null;
    const ring = coilAround(t, {
      pad: P.ringPad,
      bFrac: 0.62,
      minB: 22,
      driftFrac: 0.7,
      steps: 64,
      roundness: 0.72,
      edge: 4,
    });
    connect(ring[0]);
    add(ring);
    return t;
  };

  // Hero: over the top of the card, down its right side, then one coil
  const logo = rectInPage(page, refs.logo.current);
  if (logo) {
    const ring = coilAround(logo, { aScale: P.logoA, bFrac: 0.38, driftFrac: 0.28, steps: 72 });
    const r0 = ring[0];
    const start = pts[0];
    add(
      cubicPoints(
        start,
        { x: start.x + (r0.x - start.x) * 0.5, y: Math.min(start.y, logo.top - logo.h * 0.18) },
        { x: r0.x, y: r0.y - logo.h * 0.55 },
        r0,
        18
      ).slice(1, -1)
    );
    add(ring);
  }

  const targets = {};
  targets.projectsTitle = ringTitle(refs.projectsTitle.current);
  targets.projectsZone = rectInPage(page, refs.projects.current);
  targets.stackTitle = ringTitle(refs.stackTitle.current);

  // Stack: horizontal passes through the gutters between chip rows,
  // joined by round U-turns at the sides (boustrophedon snake).
  const chipEls = refs.skillChips.current || [];
  targets.chips = chipEls.map((el) => rectInPage(page, el));
  const chipRects = targets.chips.filter(Boolean);
  if (chipRects.length) {
    const rows = [];
    [...chipRects]
      .sort((m, n) => m.top - n.top)
      .forEach((r) => {
        const row = rows.find((x) => Math.abs(x.top - r.top) < 12);
        if (row) {
          row.left = Math.min(row.left, r.left);
          row.right = Math.max(row.right, r.right);
          row.bottom = Math.max(row.bottom, r.bottom);
        } else {
          rows.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
        }
      });
    const gl = Math.min(...rows.map((r) => r.left));
    const gr = Math.max(...rows.map((r) => r.right));
    const gutters = [rows[0].top - 12];
    for (let i = 0; i < rows.length - 1; i += 1) {
      gutters.push((rows[i].bottom + rows[i + 1].top) / 2);
    }
    gutters.push(rows[rows.length - 1].bottom + 14);

    let ltr = last().x < (gl + gr) / 2;
    gutters.forEach((gy, i) => {
      const next = gutters[i + 1];
      const turnR = next != null ? (next - gy) / 2 : 0;
      const left = gl + turnR;
      const right = gr - turnR;
      const xa = i === 0 ? clamp(last().x, left, right) : ltr ? left : right;
      const xb = ltr ? right : left;
      add([
        { x: xa, y: gy },
        { x: (xa + xb) / 2, y: gy },
        { x: xb, y: gy },
      ]);
      if (next != null) {
        const dir = ltr ? 1 : -1;
        const cy = gy + turnR;
        for (let k = 1; k < 8; k += 1) {
          const phi = (Math.PI * k) / 8;
          add([{ x: xb + dir * turnR * Math.sin(phi), y: cy - turnR * Math.cos(phi) }]);
        }
      }
      ltr = !ltr;
    });
  }

  targets.expTitle = ringTitle(refs.expTitle.current);

  // Experiencia: gentle wave beside the cards (out ↔ in on the right edge)
  const expEls = refs.expItems.current || [];
  targets.expItems = expEls.map((el) => rectInPage(page, el));
  targets.expItems.filter(Boolean).forEach((r, i) => {
    const out = Math.min(r.right + P.expOut, xMax);
    const inn = r.right - r.w * 0.16;
    const x = i % 2 === 0 ? out : inn;
    if (i === 0) connect({ x, y: r.top }, { snake: false });
    add([{ x, y: r.cy }]);
  });

  // Contacto: down the card's right side, under the "?", up into the dot
  const card = rectInPage(page, refs.contact.current);
  const markR = rectInPage(page, refs.contactMark.current);
  targets.contact = card;
  if (card && markR) {
    const mark = { x: markR.cx, y: markR.cy };
    const depth = clamp(card.bottom - 14 - mark.y, 30, 120) * P.hook;
    const side = Math.min(card.right - card.w * 0.04, xMax);
    const entry = { x: side, y: card.top + card.h * 0.12 };
    connect(entry, { snake: false });
    add([entry]);
    // One J-curve: down the side, under the "?", rising vertically into the dot
    const hook = cubicPoints(
      entry,
      { x: side, y: mark.y + depth * 0.9 },
      { x: mark.x, y: mark.y + depth * 1.35 },
      mark,
      28
    );
    add(hook.slice(1).map((p, i) => ({ ...p, layer: i > 14 ? 'front' : 'back' })));
  } else if (card) {
    connect({ x: card.right, y: card.cy });
  }

  return { points: pts, targets, W, H, P };
}

function Section({ children, className = '', id, tone = 'light', sectionRef }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      ref={sectionRef}
      className={`section ${styles.zone} ${tone === 'deep' ? styles.zoneDeep : ''} ${className}`}
      initial={reduce ? false : 'hidden'}
      whileInView={reduce ? undefined : 'show'}
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      <div className="container">{children}</div>
    </motion.section>
  );
}

function MotionBlock({ children, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : fadeUp}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ScrollAtmosphere({ pageRef, refs, onProgress }) {
  const reduce = useReducedMotion();
  const baseRef = useRef(null);
  const layerRefs = useRef([]);
  const frontBaseRef = useRef(null);
  const frontLayerRefs = useRef([]);
  const headBackRef = useRef(null);
  const headFrontRef = useRef(null);
  const tipProgressRef = useRef(0);
  const tipVelRef = useRef(0);
  const trackRef = useRef(null);
  const kickRef = useRef(null);
  const litEmitAtRef = useRef(0);
  const metaRef = useRef({ markers: DEFAULT_MARKERS, frontRanges: [], hotDu: 0.03 });
  const [ribbon, setRibbon] = useState({ d: '', w: 100, h: 100, stroke: 1 });

  const measure = useCallback(() => {
    const page = pageRef.current;
    if (!page) return;
    const route = buildRoute(page, refs);
    if (!route) return;
    const spline = buildSpline(route.points);
    if (!spline) return;
    const track = buildTrack(spline);
    const passed = (r) => passU(track, r, route.P.litRadius);
    const t = route.targets;

    trackRef.current = track;
    metaRef.current = {
      frontRanges: frontRangesOf(spline),
      hotDu: HOT_SPAN_PX / Math.max(spline.total, 1),
      markers: {
        projectsTitle: passed(t.projectsTitle),
        projectsZone: passed(t.projectsZone),
        stackTitle: passed(t.stackTitle),
        stackChips: t.chips.map((r) => (r ? passed(r) : null)),
        expTitle: passed(t.expTitle),
        expItems: t.expItems.map((r) => (r ? passed(r) : null)),
        contact: passed(t.contact),
        contactHot: 1,
      },
    };

    setRibbon((prev) =>
      prev.d === spline.d && prev.w === route.W && prev.h === route.H
        ? prev
        : { d: spline.d, w: route.W, h: route.H, stroke: route.P.strokeScale }
    );
    kickRef.current?.();
  }, [pageRef, refs]);

  // Re-measure on resize, font load and any page height change (images, carousel)
  useEffect(() => {
    measure();
    const id = requestAnimationFrame(measure);
    const timers = [120, 500, 1200].map((ms) => window.setTimeout(measure, ms));
    let resizeTimer = 0;
    const later = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    };
    window.addEventListener('resize', later);
    window.addEventListener('orientationchange', later);
    document.fonts?.ready?.then?.(measure);

    const page = pageRef.current;
    let lastW = page?.offsetWidth || 0;
    let lastH = page?.offsetHeight || 0;
    const ro =
      typeof ResizeObserver !== 'undefined' && page
        ? new ResizeObserver(() => {
            const w = page.offsetWidth;
            const h = page.offsetHeight;
            if (Math.abs(h - lastH) < 2 && Math.abs(w - lastW) < 2) return;
            lastW = w;
            lastH = h;
            later();
          })
        : null;
    if (ro && page) ro.observe(page);

    return () => {
      cancelAnimationFrame(id);
      timers.forEach(clearTimeout);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', later);
      window.removeEventListener('orientationchange', later);
      ro?.disconnect();
    };
  }, [measure, pageRef]);

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end end'],
    layoutEffect: false,
  });

  const veilOpacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.42, 0.7, 1],
    [0.06, 0.2, 0.38, 0.58, 0.78]
  );

  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const orbY3 = useTransform(scrollYProgress, [0, 1], [40, 220]);

  const emitProgress = useCallback(
    (tipP) => {
      const { markers: m, hotDu } = metaRef.current;
      const passedAll = (list) =>
        list.reduce((acc, u, i) => (u != null && tipP >= u ? [...acc, i] : acc), []);
      const hottest = (list) => {
        let best = -1;
        list.forEach((u, i) => {
          if (u != null && tipP >= u && tipP < u + hotDu) best = i;
        });
        return best;
      };

      const contactSpan = Math.max(m.contactHot - m.contact, 0.01);

      onProgress?.({
        projects: tipP >= m.projectsTitle,
        projectsHot: tipP >= m.projectsZone && tipP < m.stackTitle,
        projectsTitle: tipP >= m.projectsTitle && tipP < m.stackTitle,
        stack: tipP >= m.stackTitle,
        stackHot: tipP >= m.stackTitle && tipP < m.expTitle,
        stackTitle: tipP >= m.stackTitle && tipP < m.expTitle,
        skillActive: passedAll(m.stackChips),
        skillHot: hottest(m.stackChips),
        expTitle: tipP >= m.expTitle && tipP < m.contact,
        expActive: passedAll(m.expItems),
        expHot: hottest(m.expItems),
        contact: tipP >= m.contact,
        contactHot: tipP >= m.contactHot - 0.002,
        qMarkAssemble: clamp((tipP - m.contact) / contactSpan, 0, 1),
      });
    },
    [onProgress]
  );

  useEffect(() => {
    const base = baseRef.current;
    const layers = layerRefs.current;
    const frontBase = frontBaseRef.current;
    const frontLayers = frontLayerRefs.current;
    const headBack = headBackRef.current;
    const headFront = headFrontRef.current;
    if (!base) return undefined;

    // Scroll → path progress. The viewport anchor starts at the name dot,
    // settles at TIP_VIEW_ANCHOR and slides lower near the end so the tip
    // reaches the "?" exactly when the page bottoms out.
    const readTarget = () => {
      const track = trackRef.current;
      const page = pageRef.current;
      if (!track || !page) return 0;
      const vh = Math.max(window.innerHeight, 1);
      const s = window.scrollY;
      const pageTop = page.getBoundingClientRect().top + s;
      const maxScroll = Math.max(document.documentElement.scrollHeight - vh, 1);
      if (s >= maxScroll - 2) return 1;
      const k0 = track.keys[0] + pageTop;
      const kN = track.keys[track.samples] + pageTop;
      const aStart = clamp(k0 / vh - 0.02, 0.05, TIP_VIEW_ANCHOR);
      const aEnd = clamp((kN - maxScroll) / vh + 0.02, TIP_VIEW_ANCHOR, 0.98);
      const mid = aStart + (TIP_VIEW_ANCHOR - aStart) * smoothstep(0, vh * 0.5, s);
      const anchor = mid + (aEnd - mid) * smoothstep(maxScroll - vh * 1.5, maxScroll, s);
      return track.progressForKey(s + anchor * vh - pageTop);
    };

    let target = readTarget();
    let current = tipProgressRef.current || target;
    let vel = tipVelRef.current || 0;
    let tail = 0.035;
    let raf = null;
    let lastT = performance.now();

    const setVis = (el, on) => {
      if (!el) return;
      el.style.visibility = on ? 'visible' : 'hidden';
    };

    const placeHead = (el, x, y, on) => {
      if (!el) return;
      el.style.left = '0';
      el.style.top = '0';
      el.style.margin = '0';
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      setVis(el, on);
    };

    const originPoint = () => {
      const r = rectInPage(pageRef.current, refs.origin?.current);
      return r ? { x: r.cx, y: r.cy } : null;
    };

    const render = () => {
      const track = trackRef.current;
      const { frontRanges, markers } = metaRef.current;
      const atOrigin = !track || current < 0.0015;
      const u = atOrigin ? 0 : current;
      const tipOnFront = !atOrigin && frontRanges.some(([a, b]) => current >= a && current <= b);

      base.setAttribute('stroke-dasharray', `${Math.max(u, 0.0004)} 1`);
      setVis(base, !atOrigin);

      const tailLen = atOrigin ? 0 : Math.min(tail, u);
      layers.forEach((el, i) => {
        if (!el) return;
        if (atOrigin) {
          setVis(el, false);
          return;
        }
        const l = Math.max(tailLen * TRAIL_LAYERS[i].k, 0);
        el.setAttribute('stroke-dasharray', `${l} 1`);
        el.setAttribute('stroke-dashoffset', `${-(u - l)}`);
        setVis(el, true);
      });

      const front = frontStrokeDash(current, frontRanges);
      if (frontBase) {
        frontBase.setAttribute('stroke-dasharray', front.dasharray);
        setVis(frontBase, front.visible && !atOrigin);
      }

      frontLayers.forEach((el, i) => {
        if (!el) return;
        if (!tipOnFront) {
          setVis(el, false);
          return;
        }
        const l = Math.max(tailLen * TRAIL_LAYERS[i].k, 0);
        el.setAttribute('stroke-dasharray', `${l} 1`);
        el.setAttribute('stroke-dashoffset', `${-(u - l)}`);
        setVis(el, true);
      });

      const head = (atOrigin ? originPoint() : track.pointAt(u)) || { x: 0, y: 0 };

      // When the tip reaches the period slot, the local bolita takes over
      const tipBecomesDot = current >= (markers.contactHot ?? 1) - 0.004;
      placeHead(headBack, head.x, head.y, !tipBecomesDot && (atOrigin || !tipOnFront));
      placeHead(headFront, head.x, head.y, tipOnFront && !tipBecomesDot);

      tipProgressRef.current = current;
      tipVelRef.current = vel;
    };

    const tick = (now) => {
      const dt = Math.max(0.001, Math.min((now - lastT) / 1000, 1 / 30));
      lastT = now;
      target = readTarget();

      if (reduce) {
        current = target;
        vel = 0;
      } else {
        const s = smoothDamp(current, target, vel, 0.22, dt, 1.6);
        current = s.value;
        vel = s.velocity;
      }

      const tailTarget = tailFromVelocity(vel);
      tail += (tailTarget - tail) * 0.12;

      render();

      if (Math.abs(target - current) > 0.00005 || Math.abs(vel) > 0.0005) {
        if (now - litEmitAtRef.current > 50) {
          litEmitAtRef.current = now;
          emitProgress(current);
        }
        raf = requestAnimationFrame(tick);
      } else {
        current = target;
        vel = 0;
        render();
        emitProgress(current);
        raf = null;
      }
    };

    const kick = () => {
      target = readTarget();
      lastT = performance.now();
      if (raf === null) raf = requestAnimationFrame(tick);
    };
    kickRef.current = kick;

    render();
    emitProgress(current);
    kick();

    const unsub = scrollYProgress.on('change', (v) => {
      const root = pageRef.current;
      if (root) {
        root.dataset.depth = v > 0.48 ? 'deep' : v > 0.28 ? 'mid' : 'top';
      }
      kick();
    });
    window.addEventListener('scroll', kick, { passive: true });

    return () => {
      unsub();
      window.removeEventListener('scroll', kick);
      kickRef.current = null;
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [reduce, scrollYProgress, emitProgress, pageRef, refs]);

  const trailSvgProps = {
    className: styles.trailSvg,
    viewBox: `0 0 ${ribbon.w} ${ribbon.h}`,
    preserveAspectRatio: 'none',
    'aria-hidden': true,
  };
  const sw = (w) => w * ribbon.stroke;

  return (
    <>
      <div className={styles.atmosphere} aria-hidden>
        <motion.div className={styles.veil} style={{ opacity: veilOpacity }} />

        <motion.div
          className={`${styles.orb} ${styles.orbAccent}`}
          style={reduce ? undefined : { y: orbY1 }}
        />
        <motion.div
          className={`${styles.orb} ${styles.orbInk}`}
          style={reduce ? undefined : { y: orbY2 }}
        />
        <motion.div
          className={`${styles.orb} ${styles.orbSoft}`}
          style={reduce ? undefined : { y: orbY3 }}
        />

        <svg {...trailSvgProps}>
          <path
            ref={baseRef}
            d={ribbon.d}
            pathLength={1}
            fill="none"
            stroke={TRAIL_COLOR}
            strokeOpacity="0.5"
            strokeWidth={sw(TRAIL_BASE_W)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g style={{ filter: `drop-shadow(0 0 4px ${TRAIL_COLOR})` }}>
            {TRAIL_LAYERS.map((l, i) => (
              <path
                key={`back-${i}`}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                d={ribbon.d}
                pathLength={1}
                fill="none"
                stroke={TRAIL_COLOR}
                strokeOpacity={l.o}
                strokeWidth={sw(l.w)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
        <div ref={headBackRef} className={styles.beacon} style={{ visibility: 'hidden' }} />
      </div>

      <div className={styles.trailFront} aria-hidden>
        <svg {...trailSvgProps} className={`${styles.trailSvg} ${styles.trailSvgFront}`}>
          <path
            ref={frontBaseRef}
            d={ribbon.d}
            pathLength={1}
            fill="none"
            stroke={TRAIL_COLOR}
            strokeOpacity="0.7"
            strokeWidth={sw(TRAIL_BASE_W)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g style={{ filter: `drop-shadow(0 0 4px ${TRAIL_COLOR})` }}>
            {TRAIL_LAYERS.map((l, i) => (
              <path
                key={`front-${i}`}
                ref={(el) => {
                  frontLayerRefs.current[i] = el;
                }}
                d={ribbon.d}
                pathLength={1}
                fill="none"
                stroke={TRAIL_COLOR}
                strokeOpacity={l.o}
                strokeWidth={sw(l.w)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
        <div ref={headFrontRef} className={styles.beacon} style={{ visibility: 'hidden' }} />
      </div>
    </>
  );
}

export default function HomePage() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [heroBubbles] = useState(buildHeroBubbles);
  const pageRef = useRef(null);
  const nameDotRef = useRef(null);
  const logoMarkRef = useRef(null);
  const projectsRef = useRef(null);
  const projectsTitleRef = useRef(null);
  const stackRef = useRef(null);
  const stackTitleRef = useRef(null);
  const expTitleRef = useRef(null);
  const timelineRef = useRef(null);
  const contactRef = useRef(null);
  const contactMarkRef = useRef(null);
  const expItemRefs = useRef([]);
  const skillChipRefs = useRef([]);

  const refs = useRef({
    origin: nameDotRef,
    logo: logoMarkRef,
    projects: projectsRef,
    projectsTitle: projectsTitleRef,
    stack: stackRef,
    stackTitle: stackTitleRef,
    expTitle: expTitleRef,
    timeline: timelineRef,
    contact: contactRef,
    contactMark: contactMarkRef,
    expItems: expItemRefs,
    skillChips: skillChipRefs,
  }).current;

  const [lit, setLit] = useState({
    projects: false,
    projectsHot: false,
    projectsTitle: false,
    stack: false,
    stackHot: false,
    stackTitle: false,
    skillActive: [],
    skillHot: -1,
    expTitle: false,
    expActive: [],
    expHot: -1,
    contact: false,
    contactHot: false,
    qMarkAssemble: 0,
  });

  const onProgress = useCallback((next) => {
    setLit((prev) => {
      const same =
        prev.projects === next.projects &&
        prev.projectsHot === next.projectsHot &&
        prev.projectsTitle === next.projectsTitle &&
        prev.stack === next.stack &&
        prev.stackHot === next.stackHot &&
        prev.stackTitle === next.stackTitle &&
        prev.expTitle === next.expTitle &&
        prev.expHot === next.expHot &&
        prev.skillHot === next.skillHot &&
        prev.contact === next.contact &&
        prev.contactHot === next.contactHot &&
        Math.abs((prev.qMarkAssemble || 0) - (next.qMarkAssemble || 0)) < 0.008 &&
        prev.expActive.length === next.expActive.length &&
        prev.expActive.every((v, i) => v === next.expActive[i]) &&
        prev.skillActive.length === next.skillActive.length &&
        prev.skillActive.every((v, i) => v === next.skillActive[i]);
      return same ? prev : next;
    });
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location.hash]);

  const litClass = (on, hot) =>
    `${on ? styles.lit : ''} ${hot ? styles.litHot : ''}`.trim();

  return (
    <div className={styles.page} ref={pageRef} data-depth="top">
      <ScrollAtmosphere
        pageRef={pageRef}
        refs={refs}
        onProgress={onProgress}
      />

      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <motion.div
            className={styles.heroCopy}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1>
              Juan Esteban
              <br />
              <em>
                Arenill Buendia
                <span ref={nameDotRef} className={styles.nameDot} aria-hidden />
              </em>
            </h1>
            <p className={styles.lead}>{profile.headline}</p>
            <div className={styles.ctaRow}>
              <a className="btn btn-primary" href="#proyectos">
                Ver proyectos <ArrowDownRight size={18} />
              </a>
              <Link className="btn btn-ghost" to="/about">
                Sobre mí
              </Link>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.08 }}
          >
            <div ref={logoMarkRef} className={styles.logoMark}>
              <img
                src="/brand/imagotipo-vertical-color.svg"
                alt="Juan Esteban Arenill Buendia"
              />
              <div className={styles.logoBubbles} aria-hidden>
                {heroBubbles.map((bubble) => (
                  <motion.span
                    key={bubble.name}
                    className={`${styles.techBubble} ${styles[`bubble${bubble.size}`]}${
                      bubble.wordmark ? ` ${styles.bubbleWordmark}` : ''
                    }`}
                    style={{
                      top: bubble.top,
                      left: bubble.left,
                      right: bubble.right,
                      bottom: bubble.bottom,
                    }}
                    animate={
                      reduce
                        ? undefined
                        : { y: [0, -6, 0], x: [0, 3, 0] }
                    }
                    transition={{
                      duration: bubble.dur,
                      delay: bubble.delay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <img src={getStackIcon(bubble.name)} alt="" />
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="proyectos"
        ref={projectsRef}
        className={`${styles.projectsBlock} ${litClass(lit.projects, lit.projectsHot)}`}
      >
        <div className="container">
          <div className={styles.head}>
            <h2
              ref={projectsTitleRef}
              className={`section-title ${lit.projectsTitle ? styles.titleLit : ''}`}
            >
              Proyectos
            </h2>
            <p className="section-lead">
              Desliza el carrusel. En hover ves las tecnologías; entra para la landing completa.
            </p>
          </div>

          <ProjectsCarousel items={projects} />
        </div>
      </section>

      <Section
        tone="deep"
        sectionRef={stackRef}
        className={litClass(lit.stack, lit.stackHot)}
      >
        <MotionBlock>
          <h2
            ref={stackTitleRef}
            className={`section-title ${lit.stackTitle ? styles.titleLit : ''}`}
          >
            Stack
          </h2>
          <p className="section-lead">
            Mobile, backend, web, datos e IA — lo mismo que uso en mis productos.
          </p>
        </MotionBlock>
        <div className={styles.skillsGrid}>
          {profile.skills.map((skill, index) => {
            const on = lit.skillActive.includes(index);
            const hot = lit.skillHot === index;
            return (
              <MotionBlock key={skill.name}>
                <div
                  ref={(el) => {
                    skillChipRefs.current[index] = el;
                  }}
                  className={`${styles.skillChip} ${on ? styles.lit : ''} ${hot ? styles.litHot : ''}`}
                >
                  <strong>{skill.name}</strong>
                  <span>{skill.category}</span>
                </div>
              </MotionBlock>
            );
          })}
        </div>
      </Section>

      <Section tone="deep">
        <MotionBlock>
          <h2
            ref={expTitleRef}
            className={`section-title ${lit.expTitle ? styles.titleLit : ''}`}
          >
            Experiencia
          </h2>
          <p className="section-lead">
            Resumen desde mi hoja de vida: APIs, datos, apps y automatización.
          </p>
        </MotionBlock>
        <div className={styles.timeline} ref={timelineRef}>
          {profile.experience.map((item, index) => {
            const on = lit.expActive.includes(index);
            const hot = lit.expHot === index;
            return (
              <MotionBlock key={item.title}>
                <article
                  ref={(el) => {
                    expItemRefs.current[index] = el;
                  }}
                  className={`${styles.expItem} ${on ? styles.lit : ''} ${hot ? styles.litHot : ''}`}
                >
                  <span className={styles.expIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.expCopy}>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              </MotionBlock>
            );
          })}
      </div>
      </Section>

      <Section id="contacto" tone="deep">
        <MotionBlock>
          <div
            ref={contactRef}
            className={`${styles.contactBand} ${lit.contact ? styles.lit : ''} ${
              lit.contactHot || (lit.qMarkAssemble || 0) > 0.55 ? styles.litHot : ''
            }`}
          >
            <div className={styles.contactCopy}>
              <h2 className={styles.contactHeadline}>
                ¿Hablamos de tu próximo producto?
              </h2>
              <p>
                Escríbeme por WhatsApp o LinkedIn. También puedes revisar mi CV y el código en GitHub.
              </p>
              <div className={styles.ctaRow}>
                <a className="btn btn-primary" href={profile.links.whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                <a className="btn btn-ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <Link className="btn btn-ghost" to="/about">
                  Más sobre mí <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
            <div className={styles.qMarkCol}>
              <QuestionMarkParticles
                ref={contactMarkRef}
                progress={lit.qMarkAssemble || 0}
                tipArrived={lit.contactHot}
                reduce={reduce}
                base="#f2efe8"
              />
          </div>         
          </div>
        </MotionBlock>
      </Section>
      </div>
  );
}
