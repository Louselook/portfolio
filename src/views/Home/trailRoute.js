// Geometría de la estela en píxeles de página: curvas continuas (sin esquinas),
// lazos detrás→delante alrededor de elementos y una tabla scroll → progreso.

const TAU = Math.PI * 2;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const f = (n) => Math.round(n * 10) / 10;

export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Parámetros por tamaño de pantalla (todo en px). */
export function trailParams(viewportW) {
  if (viewportW < 720) {
    return {
      margin: 12,
      ringPad: 14,
      snakeAmp: Math.min(viewportW * 0.1, 36),
      snakeWave: 420,
      logoA: 1.18,
      expOut: 0,
      hook: 0.75,
      litRadius: 34,
      strokeScale: 0.85,
    };
  }
  if (viewportW < 980) {
    return {
      margin: 20,
      ringPad: 20,
      snakeAmp: 56,
      snakeWave: 520,
      logoA: 1.3,
      expOut: 28,
      hook: 0.9,
      litRadius: 44,
      strokeScale: 1,
    };
  }
  return {
    margin: 28,
    ringPad: 28,
    snakeAmp: 84,
    snakeWave: 620,
    logoA: 1.36,
    expOut: 56,
    hook: 1,
    litRadius: 56,
    strokeScale: 1,
  };
}

const makeRect = (left, top, w, h) => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
  w,
  h,
  cx: left + w / 2,
  cy: top + h / 2,
});

/**
 * Rect de un elemento en px relativos a la página, según el layout (offsets),
 * ignorando transforms de animaciones de entrada (fade-up, scale) que todavía
 * no han terminado cuando medimos.
 */
export function rectInPage(pageEl, el) {
  if (!pageEl || !el) return null;
  if (el.offsetParent === undefined || el.offsetWidth === undefined) {
    const p = pageEl.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.width || r.height ? makeRect(r.left - p.left, r.top - p.top, r.width, r.height) : null;
  }
  if (!el.offsetWidth && !el.offsetHeight) return null;
  let left = 0;
  let top = 0;
  let node = el;
  while (node && node !== pageEl) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent;
  }
  if (node !== pageEl) {
    const p = pageEl.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return makeRect(r.left - p.left, r.top - p.top, r.width, r.height);
  }
  return makeRect(left, top, el.offsetWidth, el.offsetHeight);
}

/** Caja del texto real (no del bloque completo) — para rodear títulos. */
export function textRectInPage(pageEl, el) {
  const box = rectInPage(pageEl, el);
  if (!box) return null;
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    if (r.width && r.height && e.width) {
      // Text box relative to its element, re-based onto the layout rect
      const sx = box.w / e.width;
      const sy = box.h / (e.height || 1);
      return makeRect(
        box.left + (r.left - e.left) * sx,
        box.top + (r.top - e.top) * sy,
        r.width * sx,
        r.height * sy
      );
    }
  } catch {
    /* fall back to the element box */
  }
  return box;
}

export function cubicPoints(p0, p1, p2, p3, n, layer = 'back') {
  const out = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      layer,
    });
  }
  return out;
}

/**
 * Espiral de una vuelta (sentido horario en pantalla):
 * derecha bajando → abajo R→L (detrás) → izquierda subiendo → arriba L→R (delante)
 * → derecha bajando. `drift` desplaza hacia abajo para que entrada y salida no
 * se toquen y ambas tangentes apunten hacia abajo.
 */
export function coil({
  cx,
  cy,
  a,
  b,
  drift,
  steps = 56,
  frontFrom = 1.08,
  frontTo = 1.95,
  roundness = 1,
}) {
  // roundness < 1 → superellipse: blunter ends, so wide/flat boxes (titles)
  // get a soft U at the sides instead of a pinched tip.
  const pw = (v) => Math.sign(v) * Math.abs(v) ** roundness;
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const th = (TAU * i) / steps;
    out.push({
      x: cx + a * pw(Math.cos(th)),
      y: cy + b * pw(Math.sin(th)) + (drift * i) / steps,
      layer: th > Math.PI * frontFrom && th < Math.PI * frontTo ? 'front' : 'back',
    });
  }
  return out;
}

function dedupe(points, minD) {
  const out = [];
  points.forEach((p) => {
    if (!out.length || dist(out[out.length - 1], p) >= minD) out.push(p);
    else if (p.layer === 'front') out[out.length - 1].layer = 'front';
  });
  return out;
}

function bezierAt(s, t) {
  const [p0, p1, p2, p3] = s;
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/**
 * Catmull-Rom centrípeta (α = 0.5) → cúbicas de Bézier. Continua en posición y
 * tangente, sin bucles ni sobreimpulsos. Devuelve el `d`, el progreso (0..1 por
 * longitud de arco) de cada punto, y muestras densas para la tabla de scroll.
 */
export function buildSpline(input, alpha = 0.5) {
  const P = dedupe(input, 2);
  const n = P.length;
  if (n < 2) return null;

  const segs = [];
  for (let i = 0; i < n - 1; i += 1) {
    const p1 = P[i];
    const p2 = P[i + 1];
    const p0 = P[i - 1] || { x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y };
    const p3 = P[i + 2] || { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };
    const d1 = Math.max(dist(p0, p1) ** alpha, 1e-4);
    const d2 = Math.max(dist(p1, p2) ** alpha, 1e-4);
    const d3 = Math.max(dist(p2, p3) ** alpha, 1e-4);
    const k1 = 2 * d1 * d1 + 3 * d1 * d2 + d2 * d2;
    const k2 = 2 * d3 * d3 + 3 * d3 * d2 + d2 * d2;
    const c1 = {
      x: (d1 * d1 * p2.x - d2 * d2 * p0.x + k1 * p1.x) / (3 * d1 * (d1 + d2)),
      y: (d1 * d1 * p2.y - d2 * d2 * p0.y + k1 * p1.y) / (3 * d1 * (d1 + d2)),
    };
    const c2 = {
      x: (d3 * d3 * p1.x - d2 * d2 * p3.x + k2 * p2.x) / (3 * d3 * (d3 + d2)),
      y: (d3 * d3 * p1.y - d2 * d2 * p3.y + k2 * p2.y) / (3 * d3 * (d3 + d2)),
    };
    segs.push([p1, c1, c2, p2]);
  }

  let d = `M ${f(P[0].x)} ${f(P[0].y)}`;
  const xs = [P[0].x];
  const ys = [P[0].y];
  const cum = [0];
  const anchorLen = [0];
  let total = 0;
  segs.forEach((s) => {
    d += ` C ${f(s[1].x)} ${f(s[1].y)} ${f(s[2].x)} ${f(s[2].y)} ${f(s[3].x)} ${f(s[3].y)}`;
    const sub = Math.max(4, Math.ceil(dist(s[0], s[3]) / 6));
    let prev = s[0];
    for (let k = 1; k <= sub; k += 1) {
      const p = bezierAt(s, k / sub);
      total += dist(prev, p);
      xs.push(p.x);
      ys.push(p.y);
      cum.push(total);
      prev = p;
    }
    anchorLen.push(total);
  });

  const anchorU = anchorLen.map((l) => (total ? l / total : 0));
  return { d, points: P, anchorU, total, xs, ys, cum };
}

/** Rangos [u0, u1] donde la estela va por delante del contenido. */
export function frontRangesOf(spline) {
  const ranges = [];
  let start = null;
  spline.points.forEach((p, i) => {
    const u = spline.anchorU[i];
    if (p.layer === 'front') {
      if (start == null) start = spline.anchorU[Math.max(0, i - 1)];
    } else if (start != null) {
      ranges.push([start, u]);
      start = null;
    }
  });
  if (start != null) ranges.push([start, 1]);
  return ranges;
}

/**
 * Tabla uniforme por longitud de arco + llaves monótonas en Y para scroll.
 * key = Y de página donde está el ancla del viewport; la punta nunca retrocede
 * cuando el path sube (lazos): avanza a ritmo `flatRate` por px de recorrido.
 */
export function buildTrack(spline, { samples = 1600, flatRate = 0.06 } = {}) {
  const { xs: sx, ys: sy, cum, total } = spline;
  const xs = new Float32Array(samples + 1);
  const ys = new Float32Array(samples + 1);
  const keys = new Float32Array(samples + 1);
  let j = 0;
  for (let i = 0; i <= samples; i += 1) {
    const L = (total * i) / samples;
    while (j < cum.length - 2 && cum[j + 1] < L) j += 1;
    const span = cum[j + 1] - cum[j] || 1;
    const t = clamp((L - cum[j]) / span, 0, 1);
    xs[i] = sx[j] + (sx[j + 1] - sx[j]) * t;
    ys[i] = sy[j] + (sy[j + 1] - sy[j]) * t;
  }
  const step = total / samples;
  let maxY = ys[0];
  keys[0] = ys[0];
  for (let i = 1; i <= samples; i += 1) {
    maxY = Math.max(maxY, ys[i]);
    keys[i] = Math.max(maxY, keys[i - 1] + flatRate * step + 1e-3);
  }

  return {
    total,
    samples,
    xs,
    ys,
    keys,
    progressForKey(key) {
      if (key <= keys[0]) return 0;
      if (key >= keys[samples]) return 1;
      let lo = 0;
      let hi = samples;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (keys[mid] <= key) lo = mid;
        else hi = mid;
      }
      return (lo + (key - keys[lo]) / (keys[hi] - keys[lo] || 1)) / samples;
    },
    pointAt(u) {
      const t = clamp(u, 0, 1) * samples;
      const i = Math.min(Math.floor(t), samples - 1);
      const k = t - i;
      return { x: xs[i] + (xs[i + 1] - xs[i]) * k, y: ys[i] + (ys[i + 1] - ys[i]) * k };
    },
  };
}

/**
 * Progreso en el que la punta "pasa" un elemento: el primero entre
 * (a) acercarse a menos de `radius` px de su caja, o (b) bajar más allá de su centro.
 */
export function passU(track, rect, radius) {
  if (!rect) return 1;
  const { xs, ys, samples } = track;
  let maxY = -Infinity;
  for (let i = 0; i <= samples; i += 1) {
    const x = xs[i];
    const y = ys[i];
    maxY = Math.max(maxY, y);
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    if (Math.hypot(dx, dy) <= radius || maxY >= rect.cy) return i / samples;
  }
  return 1;
}
