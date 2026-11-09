import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import ProjectsCarousel from '../../components/projects/ProjectsCarousel';
import styles from './HomePage.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const VIEW_H = 1200;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/** Catmull-Rom → cubic Bézier. Lower tension = softer curves. */
function catmullRomPath(points, tension = 0.5) {
  if (!points.length) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} L ${p.x.toFixed(2)} ${(p.y + 40).toFixed(2)}`;
  }

  const cx = (v) => clamp(v, 8, 92);
  let d = `M ${cx(points[0].x).toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = cx(p1.x + ((p2.x - p0.x) / 6) * tension);
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = cx(p2.x - ((p3.x - p1.x) / 6) * tension);
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${cx(p2.x).toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

/** Insert midpoints so S-curves stay fluid instead of sharp zigzags. */
function withSoftMids(points) {
  if (points.length < 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    // Two eased midpoints → gentler bends (less “broken stick” look)
    out.push({
      x: a.x * 0.72 + b.x * 0.28,
      y: a.y * 0.68 + b.y * 0.32,
    });
    out.push({
      x: a.x * 0.35 + b.x * 0.65,
      y: a.y * 0.38 + b.y * 0.62,
    });
    out.push(b);
  }
  return out;
}

function fallbackPathFromOrigin(origin) {
  const x = clamp(origin?.x ?? 28, 10, 70);
  const y = origin?.y ?? 160;
  return catmullRomPath(
    withSoftMids([
      { x, y },
      { x: x + 14, y: y + 160 },
      { x: 62, y: y + 300 },
      { x: 48, y: y + 440 },
      { x: 28, y: y + 580 },
      { x: 58, y: y + 720 },
      { x: 42, y: y + 860 },
      { x: 55, y: y + 1000 },
      { x: 46, y: 1185 },
    ]),
    0.48
  );
}

function pointFromEl(pageEl, el, anchor = 'center') {
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
  } else {
    ox = r.left + window.scrollX + r.width * 0.5 - pageLeft;
    oy = r.top + window.scrollY + r.height * 0.5 - pageTop;
  }

  return {
    x: (ox / width) * 100,
    y: (oy / height) * VIEW_H,
  };
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

function ScrollAtmosphere({ pageRef, refs, onProgress, expCount }) {
  const reduce = useReducedMotion();
  const pathRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const progressRef = useRef(0);
  const pointsCacheRef = useRef([]);
  const tipPxRef = useRef({ x: 0, y: 0 });
  const [ribbonPath, setRibbonPath] = useState(() => fallbackPathFromOrigin({ x: 28, y: 180 }));
  const tipLeft = useMotionValue('28%');
  const tipTop = useMotionValue('15%');
  const tipOpacity = useMotionValue(0);

  const measure = useCallback(() => {
    const page = pageRef.current;
    if (!page) return;

    // Always read .current at measure-time (never snapshot nulls during render)
    const originEl = refs.origin.current;
    const projectsEl = refs.projects.current;
    const stackEl = refs.stack.current;
    const timelineEl = refs.timeline.current;
    const contactEl = refs.contact.current;
    const expItems = (refs.expItems.current || []).filter(Boolean);

    const pts = [];
    const start = pointFromEl(page, originEl, 'center');
    if (start) pts.push(start);

    const proj = pointFromEl(page, projectsEl, 'right');
    if (proj) {
      pts.push({ x: clamp(proj.x - 2, 54, 82), y: proj.y - 70 });
      pts.push({ x: clamp(proj.x + 1, 56, 84), y: proj.y });
      pts.push({ x: clamp(proj.x - 2, 52, 80), y: proj.y + 70 });
    }

    const stk = pointFromEl(page, stackEl, 'left');
    if (stk) {
      pts.push({ x: clamp(stk.x + 10, 18, 42), y: stk.y });
    }

    expItems.forEach((el, i) => {
      const p = pointFromEl(page, el, 'right');
      if (!p) return;
      const sway = i % 2 === 0 ? 1.6 : -1.6;
      pts.push({ x: clamp(p.x + sway, 50, 86), y: p.y });
    });

    if (!expItems.length) {
      const tl = pointFromEl(page, timelineEl, 'right');
      if (tl) pts.push({ x: clamp(tl.x + 2, 50, 86), y: tl.y });
    }

    const end = pointFromEl(page, contactEl, 'top');
    if (end) {
      pts.push({ x: clamp(end.x + 8, 28, 72), y: end.y - 20 });
      pts.push({ x: clamp(end.x + 14, 34, 80), y: end.y + 45 });
      pts.push({ x: clamp(end.x - 6, 24, 68), y: end.y + 95 });
      pts.push({ x: end.x, y: end.y + 140 });
    }

    const next =
      pts.length >= 2
        ? catmullRomPath(withSoftMids(pts), 0.28)
        : fallbackPathFromOrigin(start || { x: 28, y: 180 });

    setRibbonPath((prev) => (prev === next ? prev : next));
  }, [pageRef, refs]);

  useEffect(() => {
    measure();
    const id = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    const timers = [80, 200, 600, 1200].map((ms) => window.setTimeout(measure, ms));
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then?.(measure);
    return () => {
      cancelAnimationFrame(id);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Whole-document progress is reliable for this long homepage
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

  // Continuous wand trail (canvas) + spark particles — YouTube short style,
  // permanent from origin → tip, brand orange.
  const STEP_PX = 2.5;
  const PARTICLE_CAP = 120;

  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const orbY3 = useTransform(scrollYProgress, [0, 1], [40, 220]);

  const syncCanvasSize = useCallback(() => {
    const page = pageRef.current;
    const canvas = canvasRef.current;
    if (!page || !canvas) return null;
    const w = page.offsetWidth;
    const h = page.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }, [pageRef]);

  const samplePath = useCallback(
    (progress, w, h) => {
      const path = pathRef.current;
      if (!path || !ribbonPath) return null;
      try {
        const len = path.getTotalLength();
        if (!len) return null;
        const t = clamp(progress, 0, 0.9999);
        const tipVB = path.getPointAtLength(t * len);
        tipLeft.set(`${tipVB.x}%`);
        tipTop.set(`${(tipVB.y / VIEW_H) * 100}%`);
        tipOpacity.set(progress < 0.002 ? 0.85 : 1);

        const toPx = (pt) => ({
          x: (pt.x / 100) * w,
          y: (pt.y / VIEW_H) * h,
        });

        const tip = toPx(tipVB);
        // Walk the drawn portion to estimate CSS-pixel length for dense sampling
        let approxPx = 0;
        const probes = 48;
        let prevPt = toPx(path.getPointAtLength(0));
        for (let i = 1; i <= probes; i += 1) {
          const p = toPx(path.getPointAtLength(((t * len) * i) / probes));
          approxPx += Math.hypot(p.x - prevPt.x, p.y - prevPt.y);
          prevPt = p;
        }
        const count = Math.max(8, Math.ceil(approxPx / STEP_PX));
        const points = [];
        for (let i = 0; i <= count; i += 1) {
          const u = t * (i / count);
          points.push(toPx(path.getPointAtLength(u * len)));
        }
        pointsCacheRef.current = points;
        tipPxRef.current = tip;
        return { t, tip, points };
      } catch {
        return null;
      }
    },
    [ribbonPath, tipLeft, tipTop, tipOpacity]
  );

  const paintFrame = useCallback(
    (spawn) => {
      const sized = syncCanvasSize();
      if (!sized) return;
      const { ctx, w, h } = sized;
      const sampled = samplePath(progressRef.current, w, h);
      if (!sampled) return;
      const { t, tip, points } = sampled;

      ctx.clearRect(0, 0, w, h);
      if (t < 0.001 || points.length < 2) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 106, 61, 0.9)';
        ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      const last = points.length - 1;

      const strokeFull = () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < last; i += 1) {
          const mx = (points[i].x + points[i + 1].x) * 0.5;
          const my = (points[i].y + points[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
        }
        ctx.lineTo(points[last].x, points[last].y);
      };

      // Tapered body: ONE filled ribbon (origin thin → tip thick). No mid-path
      // round-cap layers (those read as sausages).
      {
        const left = [];
        const right = [];
        for (let i = 0; i <= last; i += 1) {
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(last, i + 1)];
          let dx = next.x - prev.x;
          let dy = next.y - prev.y;
          const dist = Math.hypot(dx, dy) || 1;
          const nx = -dy / dist;
          const ny = dx / dist;
          const ease = (i / last) ** 2.1;
          const half = 0.7 + 7.5 * ease;
          left.push({ x: points[i].x + nx * half, y: points[i].y + ny * half });
          right.push({ x: points[i].x - nx * half, y: points[i].y - ny * half });
        }

        // Chaikin-ish pass for softer edges
        const soften = (arr) => {
          if (arr.length < 3) return arr;
          const out = [arr[0]];
          for (let i = 0; i < arr.length - 1; i += 1) {
            const a = arr[i];
            const b = arr[i + 1];
            out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
            out.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
          }
          out.push(arr[arr.length - 1]);
          return out;
        };
        const L = soften(left);
        const R = soften(right);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(L[0].x, L[0].y);
        for (let i = 1; i < L.length; i += 1) ctx.lineTo(L[i].x, L[i].y);
        for (let i = R.length - 1; i >= 0; i -= 1) ctx.lineTo(R[i].x, R[i].y);
        ctx.closePath();
        const band = ctx.createLinearGradient(
          points[0].x,
          points[0].y,
          tip.x,
          tip.y
        );
        band.addColorStop(0, 'rgba(255, 106, 61, 0.15)');
        band.addColorStop(0.55, 'rgba(255, 106, 61, 0.45)');
        band.addColorStop(1, 'rgba(255, 140, 90, 0.8)');
        ctx.fillStyle = band;
        ctx.fill();
        ctx.restore();
      }

      // Permanent continuous core (full origin → tip, single stroke)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255, 106, 61, 0.85)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(255, 106, 61, 0.55)';
      ctx.lineWidth = 5;
      strokeFull();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#FF6A3D';
      ctx.lineWidth = 2;
      strokeFull();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 230, 200, 0.95)';
      ctx.lineWidth = 1;
      strokeFull();
      ctx.stroke();
      ctx.restore();

      // Particle wake near tip (YouTube short style — sparks, not the body)
      if (!reduce && t > 0.008 && spawn) {
        const burst = spawn === 'scroll' ? 14 : 5;
        for (let n = 0; n < burst; n += 1) {
          if (particlesRef.current.length >= PARTICLE_CAP) break;
          const bias = 0.7 + Math.random() * 0.3;
          const idx = Math.min(last, Math.floor(bias * last));
          const p = points[idx];
          particlesRef.current.push({
            x: p.x + (Math.random() - 0.5) * 28,
            y: p.y + (Math.random() - 0.5) * 28,
            vx: (Math.random() - 0.5) * 2.2,
            vy: (Math.random() - 0.5) * 2.2 - 0.25,
            life: 0.65 + Math.random() * 0.35,
            size: 0.5 + Math.random() * 1.4,
          });
        }
      }

      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.97,
          vy: p.vy * 0.97 + 0.01,
          life: p.life - 0.015,
        }))
        .filter((p) => p.life > 0);

      particlesRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 170, 120, ${p.life * 0.9})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const head = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 34);
      head.addColorStop(0, 'rgba(255,255,255,1)');
      head.addColorStop(0.18, 'rgba(255,210,160,0.95)');
      head.addColorStop(0.45, 'rgba(255,106,61,0.7)');
      head.addColorStop(1, 'rgba(255,106,61,0)');
      ctx.beginPath();
      ctx.fillStyle = head;
      ctx.arc(tip.x, tip.y, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#FF6A3D';
      ctx.shadowBlur = 20;
      ctx.arc(tip.x, tip.y, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    },
    [syncCanvasSize, samplePath, reduce]
  );

  useEffect(() => {
    progressRef.current = scrollYProgress.get();
  }, [ribbonPath, scrollYProgress]);

  useEffect(() => {
    let raf = 0;
    let lastProgress = -1;
    const tick = () => {
      const p = progressRef.current;
      const moving = Math.abs(p - lastProgress) > 0.00005;
      lastProgress = p;
      paintFrame(reduce ? false : moving ? 'scroll' : 'idle');
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paintFrame, reduce]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v;
    const root = pageRef.current;
    if (root) {
      root.dataset.depth = v > 0.48 ? 'deep' : v > 0.28 ? 'mid' : 'top';
    }

    if (v > 0 && v < 0.05) measure();

    const count = Math.max(expCount, 1);
    const expStep = 0.28 / count;
    const expActive = [];
    for (let i = 0; i < count; i += 1) {
      if (v >= 0.52 + i * expStep) expActive.push(i);
    }

    onProgress?.({
      projects: v >= 0.18,
      projectsHot: v >= 0.18 && v < 0.4,
      stack: v >= 0.38,
      stackHot: v >= 0.38 && v < 0.55,
      expActive,
      expHot: v >= 0.52 && v < 0.86 ? Math.min(count - 1, Math.floor((v - 0.52) / expStep)) : -1,
      contact: v >= 0.82,
      contactHot: v >= 0.88,
    });
  });

  return (
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

      {/* Hidden SVG only for path geometry / sampling */}
      <svg
        className={styles.ribbonMeasure}
        viewBox={`0 0 100 ${VIEW_H}`}
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path ref={pathRef} d={ribbonPath} fill="none" stroke="transparent" />
      </svg>

      <canvas ref={canvasRef} className={styles.wandCanvas} />

      {!reduce && (
        <motion.div
          className={styles.beacon}
          style={{ left: tipLeft, top: tipTop, opacity: tipOpacity }}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const pageRef = useRef(null);
  const nameDotRef = useRef(null);
  const projectsRef = useRef(null);
  const stackRef = useRef(null);
  const timelineRef = useRef(null);
  const contactRef = useRef(null);
  const expItemRefs = useRef([]);

  // Stable bag of ref objects — measure always reads .current live
  const refs = useRef({
    origin: nameDotRef,
    projects: projectsRef,
    stack: stackRef,
    timeline: timelineRef,
    contact: contactRef,
    expItems: expItemRefs,
  }).current;

  const [lit, setLit] = useState({
    projects: false,
    projectsHot: false,
    stack: false,
    stackHot: false,
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
        prev.stack === next.stack &&
        prev.stackHot === next.stackHot &&
        prev.expHot === next.expHot &&
        prev.contact === next.contact &&
        prev.contactHot === next.contactHot &&
        prev.expActive.length === next.expActive.length &&
        prev.expActive.every((v, i) => v === next.expActive[i]);
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
            <div className={styles.logoMark}>
              <img
                src="/brand/imagotipo-vertical-color.svg"
                alt="Juan Esteban Arenill Buendia"
              />
            </div>
            <motion.div
              className={`${styles.floatChip} ${styles.chip1}`}
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Flutter + FastAPI
            </motion.div>
            <motion.div
              className={`${styles.floatChip} ${styles.chip2}`}
              animate={reduce ? undefined : { y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              React · Python
            </motion.div>
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
            <h2 className="section-title">Proyectos</h2>
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
          <h2 className="section-title">Stack</h2>
          <p className="section-lead">
            Mobile, backend, web, datos e IA — lo mismo que uso en mis productos.
          </p>
        </MotionBlock>
        <div className={styles.skillsGrid}>
          {profile.skills.map((skill) => (
            <MotionBlock key={skill.name}>
              <div
                className={`${styles.skillChip} ${lit.stack ? styles.lit : ''} ${lit.stackHot ? styles.litHot : ''}`}
              >
                <strong>{skill.name}</strong>
                <span>{skill.category}</span>
              </div>
            </MotionBlock>
          ))}
        </div>
      </Section>

      <Section tone="deep">
        <MotionBlock>
          <h2 className="section-title">Experiencia</h2>
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
            className={`${styles.contactBand} ${lit.contact ? styles.lit : ''} ${lit.contactHot ? styles.litHot : ''} ${lit.contactHot ? styles.litSurround : ''}`}
          >
            <h2>¿Hablamos de tu próximo producto?</h2>
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
