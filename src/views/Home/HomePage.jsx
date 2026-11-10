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
import styles from './HomePage.module.css';
import {
  simplifyPoints,
  roundedPath,
  smoothDamp,
  buildTipTable,
  tailFromVelocity,
} from './trailSmoothing';

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
/** Stroke widths in viewBox units so dasharray stays in the same space as the path. */
const TRAIL_BASE_W = 0.42;
/** Capas cercanas en ancho para evitar escalones visibles. */
const TRAIL_LAYERS = [
  { k: 1.0, o: 0.22, w: 0.46 },
  { k: 0.62, o: 0.5, w: 0.54 },
  { k: 0.3, o: 0.9, w: 0.66 },
];
/** Tip sits in the upper half of the viewport (fraction of window height). */
const TIP_VIEW_ANCHOR = 0.38;
const TIP_SAMPLE_N = 320;
/** Projection samples — built once per path, then reused for every waypoint. */
const META_SAMPLE_N = 180;

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

const VIEW_H = 1200;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/** Soft lateral S with sinusoidal envelope (no hard sign flips). */
function snakeLateral(points) {
  if (points.length < 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = ((b.y - a.y) / VIEW_H) * 100;
    const len = Math.hypot(dx, dy);
    if (len >= 14 && !a.id && !b.id) {
      const inv = len || 1;
      const env = Math.sin(Math.PI * 0.5);
      const amp = 1.2 * env * (i % 2 === 0 ? 1 : -1);
      out.push({
        x: clamp((a.x + b.x) / 2 + (-dy / inv) * amp, 8, 92),
        y: (a.y + b.y) / 2 + ((dx / inv) * amp * VIEW_H) / 100,
        layer: b.layer || a.layer || 'back',
      });
    }
    out.push(b);
  }
  return out;
}

function buildRibbonD(points) {
  if (points.length < 2) return '';
  const waved = snakeLateral(points);
  return roundedPath(simplifyPoints(waved, 28), { maxFrac: 0.5 });
}

/** Sample path once; nearest-u queries become cheap distance checks. */
function buildPathSampleTable(pathEl, samples = META_SAMPLE_N) {
  let total = 0;
  try {
    total = pathEl.getTotalLength();
  } catch {
    return null;
  }
  if (!total) return null;
  const xs = new Float32Array(samples + 1);
  const ys = new Float32Array(samples + 1);
  for (let i = 0; i <= samples; i += 1) {
    const p = pathEl.getPointAtLength((total * i) / samples);
    xs[i] = p.x;
    ys[i] = p.y;
  }
  return { total, samples, xs, ys };
}

function nearestUFromTable(table, pt, fromIndex = 0) {
  if (!table) return 0;
  const { samples, xs, ys } = table;
  let bestI = fromIndex;
  let bestD = Infinity;
  for (let i = Math.max(0, fromIndex); i <= samples; i += 1) {
    const d = Math.hypot(xs[i] - pt.x, ((ys[i] - pt.y) / VIEW_H) * 100);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  return bestI / samples;
}

/** Project hard waypoints onto final SVG path for markers + frontRanges. */
function projectMetaOntoPath(pathEl, waypoints) {
  const markers = {
    projectsTitle: 0.2,
    projectsZone: 0.28,
    stackTitle: 0.4,
    stackChips: [],
    expTitle: 0.55,
    expItems: [],
    contact: 0.85,
    contactHot: 0.93,
  };
  const frontRanges = [];
  if (!pathEl || !waypoints.length) return { markers, frontRanges };

  const table = buildPathSampleTable(pathEl, META_SAMPLE_N);
  if (!table) return { markers, frontRanges };

  let frontStart = null;
  let prevI = 0;
  waypoints.forEach((wp) => {
    const u = nearestUFromTable(table, wp, prevI);
    const ordered = Math.max(prevI / table.samples, u);
    prevI = Math.floor(ordered * table.samples);

    if (wp.id === 'projectsTitle') markers.projectsTitle = ordered;
    if (wp.id === 'projectsZone') markers.projectsZone = ordered;
    if (wp.id === 'stackTitle') markers.stackTitle = ordered;
    if (wp.id === 'expTitle') markers.expTitle = ordered;
    if (wp.id === 'contact') markers.contact = ordered;
    if (wp.id === 'contactHot') markers.contactHot = ordered;
    if (wp.id?.startsWith('chip:')) {
      markers.stackChips[Number(wp.id.slice(5))] = ordered;
    }
    if (wp.id?.startsWith('exp:')) {
      markers.expItems[Number(wp.id.slice(4))] = ordered;
    }

    if (wp.layer === 'front') {
      if (frontStart == null) frontStart = Math.max(0, ordered - 0.004);
    } else if (frontStart != null) {
      frontRanges.push([frontStart, Math.min(1, ordered + 0.004)]);
      frontStart = null;
    }
  });
  if (frontStart != null) frontRanges.push([frontStart, 1]);
  return { markers, frontRanges };
}

/** Logo (or any el) as ellipse center/radii in path viewBox units. */
function ellipseFromEl(pageEl, el, pad = 1.12) {
  if (!pageEl || !el) return null;
  const pageRect = pageEl.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const pageTop = pageRect.top + window.scrollY;
  const pageLeft = pageRect.left + window.scrollX;
  const width = Math.max(pageEl.offsetWidth, 1);
  const height = Math.max(pageEl.offsetHeight, 1);
  const cx = (((r.left + r.right) / 2 + window.scrollX - pageLeft) / width) * 100;
  const cy = (((r.top + r.bottom) / 2 + window.scrollY - pageTop) / height) * VIEW_H;
  const rx = ((r.width / 2) / width) * 100 * pad;
  const ry = ((r.height / 2) / height) * VIEW_H * pad;
  return { cx: clamp(cx, 12, 88), cy, rx: Math.max(rx, 6), ry: Math.max(ry, 40) };
}

/** Sample Catmull-Rom between controls so logo weave stays smooth (no elbows). */
function densifyControls(controls, stepsPerSeg = 10) {
  if (controls.length < 2) return controls;
  const out = [];
  for (let i = 0; i < controls.length - 1; i += 1) {
    const p0 = controls[i - 1] || controls[i];
    const p1 = controls[i];
    const p2 = controls[i + 1];
    const p3 = controls[i + 2] || p2;
    for (let s = 0; s < stepsPerSeg; s += 1) {
      const t = s / stepsPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      // Layer blends at segment start; flips with the destination control
      const layer = t < 0.5 ? p1.layer : p2.layer;
      out.push({ x: clamp(x, 8, 92), y, layer });
    }
  }
  out.push(controls[controls.length - 1]);
  return out;
}

/**
 * Wide S behind the card — always back, headings stay under ~60°.
 */
function pushLogoWeave(list, ellipse) {
  if (!ellipse) return;
  const { cx, cy, rx, ry } = ellipse;
  const at = (nx, ny) => ({
    x: clamp(cx + nx * rx, 8, 92),
    y: cy + ny * ry,
    layer: 'back',
  });

  const controls = [
    at(-1.15, 0.0),
    at(-0.35, 0.22),
    at(0.45, 0.42),
    at(1.05, 0.62),
    at(0.45, 0.82),
    at(-0.25, 1.02),
    at(-0.7, 1.28),
    at(-0.35, 1.58),
  ];

  densifyControls(controls, 4).forEach((p) => pushWp(list, p, 'back'));
}

function fallbackPathFromOrigin(origin) {
  const x = clamp(origin?.x ?? 28, 10, 70);
  const y = origin?.y ?? 160;
  return buildRibbonD([
    { x, y },
    { x: x + 14, y: y + 160 },
    { x: 62, y: y + 300 },
    { x: 48, y: y + 440 },
    { x: 28, y: y + 580 },
    { x: 58, y: y + 720 },
    { x: 42, y: y + 860 },
    { x: 55, y: y + 1000 },
    { x: 46, y: 1185 },
  ]);
}

function pointFromEl(pageEl, el, anchor = 'center', nudge = null) {
  if (!pageEl || !el) return null;
  const pageRect = pageEl.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const pageTop = pageRect.top + window.scrollY;
  const pageLeft = pageRect.left + window.scrollX;
  const width = Math.max(pageEl.offsetWidth, 1);
  const height = Math.max(pageEl.offsetHeight, 1);

  let ox;
  let oy;
  if (anchor === 'right') {
    ox = r.right + window.scrollX - pageLeft - 12;
    oy = r.top + window.scrollY + r.height * 0.45 - pageTop;
  } else if (anchor === 'left') {
    ox = r.left + window.scrollX - pageLeft + 12;
    oy = r.top + window.scrollY + r.height * 0.5 - pageTop;
  } else if (anchor === 'top') {
    ox = r.left + window.scrollX + r.width * 0.5 - pageLeft;
    oy = r.top + window.scrollY - pageTop + 8;
  } else if (anchor === 'bottom') {
    ox = r.left + window.scrollX + r.width * 0.5 - pageLeft;
    oy = r.bottom + window.scrollY - pageTop - 8;
  } else if (anchor === 'topLeft') {
    ox = r.left + window.scrollX - pageLeft + 8;
    oy = r.top + window.scrollY - pageTop + 8;
  } else if (anchor === 'topRight') {
    ox = r.right + window.scrollX - pageLeft - 8;
    oy = r.top + window.scrollY - pageTop + 8;
  } else if (anchor === 'bottomRight') {
    ox = r.right + window.scrollX - pageLeft - 8;
    oy = r.bottom + window.scrollY - pageTop - 8;
  } else if (anchor === 'bottomLeft') {
    ox = r.left + window.scrollX - pageLeft + 8;
    oy = r.bottom + window.scrollY - pageTop - 8;
  } else {
    ox = r.left + window.scrollX + r.width * 0.5 - pageLeft;
    oy = r.top + window.scrollY + r.height * 0.5 - pageTop;
  }

  const pt = {
    x: (ox / width) * 100,
    y: (oy / height) * VIEW_H,
  };
  if (nudge) {
    pt.x += nudge.x || 0;
    pt.y += nudge.y || 0;
  }
  pt.x = clamp(pt.x, 8, 92);
  return pt;
}

function pushWp(list, pt, layer = 'back', id = null) {
  if (!pt) return;
  list.push({ x: pt.x, y: pt.y, layer, id });
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

function ScrollAtmosphere({ pageRef, refs, onProgress, expCount, skillCount }) {
  const reduce = useReducedMotion();
  const baseRef = useRef(null);
  const layerRefs = useRef([]);
  const frontBaseRef = useRef(null);
  const frontLayerRefs = useRef([]);
  const headBackRef = useRef(null);
  const headFrontRef = useRef(null);
  const tipProgressRef = useRef(0);
  const tipVelRef = useRef(0);
  const tipTableRef = useRef(null);
  const litEmitAtRef = useRef(0);
  const pendingMetaRef = useRef([]);
  const pathMetaRef = useRef({
    markers: {
      projectsTitle: 0.2,
      projectsZone: 0.28,
      stackTitle: 0.4,
      stackChips: [],
      expTitle: 0.55,
      expItems: [],
      contact: 0.85,
      contactHot: 0.93,
    },
    frontRanges: [],
  });
  const [ribbonPath, setRibbonPath] = useState(() => fallbackPathFromOrigin({ x: 28, y: 180 }));

  const measure = useCallback(() => {
    const page = pageRef.current;
    if (!page) return;

    const originEl = refs.origin.current;
    const logoEl = refs.logo.current;
    const projectsEl = refs.projects.current;
    const projectsTitleEl = refs.projectsTitle.current;
    const stackEl = refs.stack.current;
    const stackTitleEl = refs.stackTitle.current;
    const expTitleEl = refs.expTitle.current;
    const contactEl = refs.contact.current;
    const contactMarkEl = refs.contactMark.current;
    const expItems = (refs.expItems.current || []).filter(Boolean);
    const skillChips = (refs.skillChips.current || []).filter(Boolean);

    const hard = [];
    const start = pointFromEl(page, originEl, 'center');
    pushWp(hard, start, 'back', 'origin');

    // Hero: weave through logo like annotation (behind → across face → loop → out)
    const logoEllipse = ellipseFromEl(page, logoEl, 1.0);
    if (logoEllipse && start) {
      // Flat approach: keep Y near the name-dot → logo mid (no upward spike)
      const targetY = logoEllipse.cy + logoEllipse.ry * 0.12;
      pushWp(
        hard,
        {
          x: start.x * 0.55 + (logoEllipse.cx - logoEllipse.rx * 1.2) * 0.45,
          y: start.y * 0.7 + targetY * 0.3,
        },
        'back'
      );
      pushWp(
        hard,
        {
          x: clamp(logoEllipse.cx - logoEllipse.rx * 1.15, 8, 92),
          y: start.y * 0.25 + targetY * 0.75,
        },
        'back'
      );
      pushLogoWeave(hard, logoEllipse);
    } else if (start) {
      pushWp(hard, { x: start.x + 18, y: start.y + 80 }, 'back');
      pushWp(hard, { x: start.x + 28, y: start.y + 140 }, 'back');
    }

    // Soft bridge into Proyectos — carry the exit tangent, then ease (no V)
    const logoExit = hard[hard.length - 1];
    const titleP = pointFromEl(page, projectsTitleEl, 'left', { x: -2, y: 0 });
    if (logoExit && titleP) {
      const prev = hard[hard.length - 2] || logoExit;
      const tx = logoExit.x - prev.x;
      const ty = Math.max(logoExit.y - prev.y, 0.4);
      const span = Math.max(titleP.y - logoExit.y, 1);
      const steps = 6;
      for (let s = 1; s <= steps; s += 1) {
        const t = s / (steps + 1);
        const ease = t * t * (3 - 2 * t);
        pushWp(
          hard,
          {
            x: logoExit.x + tx * (1 - t) * 2.2 + (titleP.x - logoExit.x) * ease,
            y: logoExit.y + ty * (1 - t) * 0.6 + span * t,
          },
          'back'
        );
      }
    }
    pushWp(hard, titleP, 'back', 'projectsTitle');
    if (titleP) {
      pushWp(hard, { x: clamp(titleP.x + 14, 20, 70), y: titleP.y + 10 }, 'back');
      pushWp(hard, { x: clamp(titleP.x + 28, 40, 82), y: titleP.y + 28 }, 'back');
    }

    const proj = pointFromEl(page, projectsEl, 'center');
    if (proj) {
      pushWp(hard, { x: clamp(proj.x + 22, 55, 86), y: proj.y - 40 }, 'back', 'projectsZone');
      pushWp(hard, { x: clamp(proj.x + 28, 58, 88), y: proj.y }, 'back');
      pushWp(hard, { x: clamp(proj.x + 18, 50, 84), y: proj.y + 50 }, 'back');
      pushWp(hard, { x: clamp(proj.x + 8, 40, 72), y: proj.y + 95 }, 'back');
    }

    // Stack: title then weave across chips
    const stackTitle = pointFromEl(page, stackTitleEl, 'left', { x: -2 });
    pushWp(hard, stackTitle, 'back', 'stackTitle');
    if (stackTitle) {
      pushWp(hard, { x: clamp(stackTitle.x + 14, 18, 50), y: stackTitle.y + 28 }, 'back');
    }

    // Stack: one soft diagonal per row (entry → exit), not one point per chip
    const chipMarkers = [];
    if (skillChips.length) {
      const rows = new Map();
      skillChips.forEach((el, i) => {
        const row = Math.floor(i / 6);
        if (!rows.has(row)) rows.set(row, []);
        rows.get(row).push({ el, i });
        const c = pointFromEl(page, el, 'center');
        if (c) chipMarkers.push({ ...c, layer: 'back', id: `chip:${i}` });
      });
      rows.forEach((items) => {
        const first = items[0];
        const last = items[items.length - 1];
        pushWp(
          hard,
          pointFromEl(page, first.el, 'left', { x: -2, y: -6 }),
          'back'
        );
        pushWp(
          hard,
          pointFromEl(page, last.el, 'right', { x: 2, y: 8 }),
          'back'
        );
      });
    } else {
      const stk = pointFromEl(page, stackEl, 'left', { x: 10 });
      pushWp(hard, stk, 'back');
    }

    // Experiencia: one smooth vertical flow down the right (no zig-zag cuts)
    const expTitle = pointFromEl(page, expTitleEl, 'left', { x: -2 });
    pushWp(hard, expTitle, 'back', 'expTitle');
    if (expTitle) {
      pushWp(hard, { x: clamp(expTitle.x + 28, 48, 82), y: expTitle.y + 20 }, 'back');
    }

    expItems.forEach((el, i) => {
      const sway = (i % 2 === 0 ? 1 : -1) * 3;
      pushWp(
        hard,
        pointFromEl(page, el, 'right', { x: 8 + sway, y: 0 }),
        'back',
        `exp:${i}`
      );
    });

    // Contacto: soft approach → period mark (still one continuous ribbon)
    const contact = pointFromEl(page, contactEl, 'top', { y: -8 });
    pushWp(hard, contact, 'back', 'contact');
    if (contact) {
      pushWp(hard, { x: clamp(contact.x + 12, 36, 78), y: contact.y + 40 }, 'back');
      pushWp(hard, { x: clamp(contact.x + 8, 32, 72), y: contact.y + 90 }, 'front');
      pushWp(hard, { x: clamp(contact.x + 4, 30, 68), y: contact.y + 130 }, 'front');
    }

    const mark = pointFromEl(page, contactMarkEl, 'center');
    pushWp(hard, mark || (contact ? { x: contact.x + 10, y: contact.y + 165 } : null), 'front', 'contactHot');

    const coords = hard.map(({ x, y, layer, id }) => ({ x, y, layer, id }));
    const next =
      coords.length >= 2
        ? buildRibbonD(coords)
        : fallbackPathFromOrigin(start || { x: 28, y: 180 });

    // Path geometry + markers for later projection onto the live SVG path
    pendingMetaRef.current = [...coords, ...chipMarkers];
    setRibbonPath((prev) => {
      if (prev === next) {
        // Layout shifted but d-string identical — cheap table-based reproject
        if (baseRef.current) {
          pathMetaRef.current = projectMetaOntoPath(
            baseRef.current,
            pendingMetaRef.current
          );
        }
        return prev;
      }
      return next;
    });
  }, [pageRef, refs]);

  useEffect(() => {
    measure();
    const id = requestAnimationFrame(measure);
    const timers = [120, 500].map((ms) => window.setTimeout(measure, ms));
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    document.fonts?.ready?.then?.(measure);
    return () => {
      cancelAnimationFrame(id);
      timers.forEach(clearTimeout);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [measure]);

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
      const m = pathMetaRef.current.markers;
      const count = Math.max(expCount, 1);
      const skills = Math.max(skillCount, 1);

      const projects = tipP >= m.projectsTitle - 0.02;
      const projectsHot = tipP >= m.projectsTitle && tipP < (m.stackTitle || 0.4);
      const projectsTitle = tipP >= m.projectsTitle - 0.01 && tipP < m.projectsZone + 0.08;

      const stack = tipP >= m.stackTitle - 0.02;
      const stackHot = tipP >= m.stackTitle && tipP < (m.expTitle || 0.55);
      const stackTitle = tipP >= m.stackTitle - 0.01 && tipP < (m.stackChips[0] ?? m.stackTitle + 0.08);

      const skillActive = [];
      let skillHot = -1;
      for (let i = 0; i < skills; i += 1) {
        const u = m.stackChips[i];
        if (u == null) continue;
        if (tipP >= u - 0.005) skillActive.push(i);
        if (tipP >= u - 0.01 && tipP < u + 0.04) skillHot = i;
      }

      const expTitle = tipP >= m.expTitle - 0.01 && tipP < (m.expItems[0] ?? m.expTitle + 0.08);
      const expActive = [];
      let expHot = -1;
      for (let i = 0; i < count; i += 1) {
        const u = m.expItems[i] ?? m.expTitle + ((i + 1) / (count + 1)) * (m.contact - m.expTitle);
        if (tipP >= u - 0.01) expActive.push(i);
        if (tipP >= u - 0.015 && tipP < u + 0.05) expHot = i;
      }

      const contact = tipP >= m.contact - 0.02;
      const contactHot = tipP >= m.contactHot - 0.02;

      onProgress?.({
        projects,
        projectsHot,
        projectsTitle,
        stack,
        stackHot,
        stackTitle,
        skillActive,
        skillHot,
        expTitle,
        expActive,
        expHot,
        contact,
        contactHot,
      });
    },
    [expCount, skillCount, onProgress]
  );

  useEffect(() => {
    const base = baseRef.current;
    const layers = layerRefs.current;
    const frontBase = frontBaseRef.current;
    const frontLayers = frontLayerRefs.current;
    const headBack = headBackRef.current;
    const headFront = headFrontRef.current;
    const svg = base?.ownerSVGElement;
    if (!base || !ribbonPath || !svg) return;

    let total = 0;
    try {
      total = base.getTotalLength();
    } catch {
      return;
    }
    if (!total) return;

    // Project section markers / frontRanges onto the live path
    pathMetaRef.current = projectMetaOntoPath(base, pendingMetaRef.current);

    const rebuildTipTable = () => {
      const rect = svg.getBoundingClientRect();
      const page = pageRef.current;
      const pageTop = page
        ? page.getBoundingClientRect().top + window.scrollY
        : 0;
      // preserveAspectRatio="none" → independent X/Y scale into page px
      const scaleX = rect.width / 100;
      const scaleY = rect.height / VIEW_H;
      const top = rect.top + window.scrollY - pageTop;
      tipTableRef.current = buildTipTable(base, {
        scaleX,
        scaleY,
        top,
        samples: TIP_SAMPLE_N,
      });
      try {
        total = base.getTotalLength();
      } catch {
        /* keep previous */
      }
    };
    rebuildTipTable();

    const readTarget = () => {
      const originEl = refs.origin?.current;
      const originRect = originEl?.getBoundingClientRect();
      const releaseY = window.innerHeight * 0.22;
      if (!originRect || originRect.top + originRect.height / 2 >= releaseY) {
        return 0;
      }
      const table = tipTableRef.current;
      if (!table) return tipProgressRef.current;
      const key = window.scrollY + TIP_VIEW_ANCHOR * window.innerHeight;
      let u = table.progressForKey(key);
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const scrollP = clamp(window.scrollY / maxScroll, 0, 1);
      if (scrollP > 0.92) u = Math.max(u, (scrollP - 0.92) / 0.08);
      return clamp(u, 0, 1);
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

    let pageW = Math.max(pageRef.current?.offsetWidth || 0, 1);
    let pageH = Math.max(pageRef.current?.offsetHeight || 0, 1);
    const refreshPageSize = () => {
      pageW = Math.max(pageRef.current?.offsetWidth || 0, 1);
      pageH = Math.max(pageRef.current?.offsetHeight || 0, 1);
    };

    const placeHead = (el, xPct, yPct, on) => {
      if (!el) return;
      el.style.left = '0';
      el.style.top = '0';
      el.style.margin = '0';
      el.style.transform = `translate3d(${(xPct / 100) * pageW}px, ${(yPct / 100) * pageH}px, 0) translate(-50%, -50%)`;
      setVis(el, on);
    };

    const headFromOrigin = () => {
      const page = pageRef.current;
      const originEl = refs.origin?.current;
      if (!page || !originEl) return null;
      const pageRect = page.getBoundingClientRect();
      const r = originEl.getBoundingClientRect();
      const pageW = Math.max(page.offsetWidth, 1);
      const pageH = Math.max(page.offsetHeight, 1);
      const x =
        (((r.left + r.right) / 2 + window.scrollX - (pageRect.left + window.scrollX)) /
          pageW) *
        100;
      const y =
        (((r.top + r.bottom) / 2 + window.scrollY - (pageRect.top + window.scrollY)) /
          pageH) *
        100;
      return { x, y };
    };

    const render = () => {
      const atOrigin = current < 0.0015;
      const u = atOrigin ? 0 : current;
      const frontRanges = pathMetaRef.current.frontRanges || [];
      const tipOnFront = !atOrigin && frontRanges.some(([a, b]) => current >= a && current <= b);

      base.setAttribute('stroke-dasharray', `${Math.max(u, 0.0004)} 1`);
      setVis(base, true);

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

      let headPct = atOrigin ? headFromOrigin() : null;
      if (!headPct) {
        const table = tipTableRef.current;
        const p = table?.pointAt?.(u) || { x: 0, y: 0 };
        headPct = { x: p.x, y: (p.y / VIEW_H) * 100 };
      }

      placeHead(headBack, headPct.x, headPct.y, atOrigin || !tipOnFront);
      placeHead(headFront, headPct.x, headPct.y, tipOnFront);

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
        const s = smoothDamp(current, target, vel, 0.35, dt, 0.9);
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

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        refreshPageSize();
        rebuildTipTable();
        kick();
      }, 100);
    };

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

    window.addEventListener('resize', onResize);
    return () => {
      unsub();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [ribbonPath, reduce, scrollYProgress, emitProgress, pageRef, refs]);

  const trailSvgProps = {
    className: styles.trailSvg,
    viewBox: `0 0 100 ${VIEW_H}`,
    preserveAspectRatio: 'none',
    'aria-hidden': true,
  };

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
            d={ribbonPath}
            pathLength={1}
            fill="none"
            stroke={TRAIL_COLOR}
            strokeOpacity="0.5"
            strokeWidth={TRAIL_BASE_W}
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
                d={ribbonPath}
                pathLength={1}
                fill="none"
                stroke={TRAIL_COLOR}
                strokeOpacity={l.o}
                strokeWidth={l.w}
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
            d={ribbonPath}
            pathLength={1}
            fill="none"
            stroke={TRAIL_COLOR}
            strokeOpacity="0.7"
            strokeWidth={TRAIL_BASE_W}
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
                d={ribbonPath}
                pathLength={1}
                fill="none"
                stroke={TRAIL_COLOR}
                strokeOpacity={l.o}
                strokeWidth={l.w}
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
        expCount={profile.experience.length}
        skillCount={profile.skills.length}
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
            className={`${styles.contactBand} ${lit.contact ? styles.lit : ''} ${lit.contactHot ? styles.litHot : ''} ${lit.contactHot ? styles.litSurround : ''} ${lit.contactHot ? styles.contactWave : ''}`}
          >
            <h2 className={styles.contactHeadline}>
              ¿Hablamos de tu próximo producto?
              <span
                ref={contactMarkRef}
                className={`${styles.questionMark} ${lit.contactHot ? styles.questionMarkLit : ''}`}
                aria-hidden
              />
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
        </MotionBlock>
      </Section>
    </div>
  );
}
