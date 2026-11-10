// Helpers para que la estela sea suave: geometría sin picos y movimiento sin tirones.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const f = (n) => Math.round(n * 100) / 100;

/**
 * 1) Quita waypoints demasiado juntos. Menos puntos = curvas más largas y limpias.
 *    Conserva el primero, el último y cualquier campo extra (layer, id...).
 */
export function simplifyPoints(points, minDist = 28) {
  if (points.length < 3) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (dist(out[out.length - 1], points[i]) >= minDist) out.push(points[i]);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * 2) Path con esquinas redondeadas (reemplaza limitTurnAngle + catmullRomPath).
 *    Cada vértice se convierte en una curva cuadrática tangente a los dos tramos,
 *    así que NUNCA hay picos, y no hay sobreimpulsos como en Catmull-Rom.
 *    maxFrac 0.5 = curva total (sin tramos rectos); baja a 0.35 para dejar rectas.
 */
export function roundedPath(points, { radius = Infinity, maxFrac = 0.5 } = {}) {
  const n = points.length;
  if (n < 2) return '';
  if (n === 2) {
    return `M ${f(points[0].x)} ${f(points[0].y)} L ${f(points[1].x)} ${f(points[1].y)}`;
  }
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < n - 1; i++) {
    const a = points[i - 1];
    const v = points[i];
    const b = points[i + 1];
    const la = dist(a, v);
    const lb = dist(v, b);
    if (!la || !lb) continue;
    const r = Math.min(radius, la * maxFrac, lb * maxFrac);
    const inX = v.x + ((a.x - v.x) / la) * r;
    const inY = v.y + ((a.y - v.y) / la) * r;
    const outX = v.x + ((b.x - v.x) / lb) * r;
    const outY = v.y + ((b.y - v.y) / lb) * r;
    d += ` L ${f(inX)} ${f(inY)} Q ${f(v.x)} ${f(v.y)} ${f(outX)} ${f(outY)}`;
  }
  const last = points[n - 1];
  return `${d} L ${f(last.x)} ${f(last.y)}`;
}

/**
 * 3) Muelle críticamente amortiguado (smoothDamp).
 *    Arranca y frena con aceleración suave, no depende de los FPS y,
 *    con maxSpeed, la punta nunca "salta" aunque el path tenga tramos planos.
 *    Uso: const s = smoothDamp(cur, target, vel, 0.35, dt, 0.9); cur = s.value; vel = s.velocity;
 */
export function smoothDamp(current, target, velocity, smoothTime, dt, maxSpeed = Infinity) {
  smoothTime = Math.max(0.0001, smoothTime);
  dt = Math.min(dt, 1 / 30); // evita saltos al volver de otra pestaña
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const originalTo = target;
  const maxChange = maxSpeed * smoothTime;
  let change = clamp(current - target, -maxChange, maxChange);
  target = current - change;
  const temp = (velocity + omega * change) * dt;
  let vel = (velocity - omega * temp) * e;
  let value = target + (change + temp) * e;
  if (originalTo - current > 0 === value > originalTo) {
    value = originalTo;
    vel = (value - originalTo) / dt;
  }
  return { value, velocity: vel };
}

/**
 * 4) Tabla scroll -> progreso del path, monótona.
 *    La y de la punta nunca retrocede, así que cuando el path sube o hace bucles
 *    la punta espera en vez de saltar hacia atrás o adelante.
 *    Con preserveAspectRatio="none" hay que usar scaleX y scaleY por separado
 *    (viewBox 0 0 100 VIEW_H → scaleX = width/100, scaleY = height/VIEW_H).
 *    top = offsetTop del SVG en la página. Reconstruir en resize.
 */
export function buildTipTable(
  pathEl,
  { scaleX = 1, scaleY = 1, scale = null, top = 0, samples = 320, flatRate = 0.05 } = {}
) {
  // Back-compat: single `scale` treated as uniform (prefer scaleX/scaleY).
  if (scale != null) {
    scaleX = scale;
    scaleY = scale;
  }
  const total = pathEl.getTotalLength();
  const keys = new Float32Array(samples + 1);
  const xs = new Float32Array(samples + 1);
  const ys = new Float32Array(samples + 1);
  let maxY = -Infinity;
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i <= samples; i++) {
    const p = pathEl.getPointAtLength((total * i) / samples);
    xs[i] = p.x;
    ys[i] = p.y;
    const pageY = top + p.y * scaleY;
    maxY = Math.max(maxY, pageY);
    if (i === 0) {
      keys[i] = maxY;
    } else {
      const segPx = Math.hypot((p.x - prevX) * scaleX, (p.y - prevY) * scaleY);
      keys[i] = Math.max(maxY, keys[i - 1] + flatRate * segPx + 1e-3);
    }
    prevX = p.x;
    prevY = p.y;
  }
  return {
    total,
    /** key = window.scrollY + anchor * innerHeight  (anchor ~0.38). Devuelve 0..1 */
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
      const t = (key - keys[lo]) / (keys[hi] - keys[lo] || 1);
      return (lo + t) / samples;
    },
    /** ViewBox point at progress 0..1 (linear between samples — no getPointAtLength). */
    pointAt(u) {
      const t = Math.min(Math.max(u, 0), 1) * samples;
      const i = Math.min(Math.floor(t), samples - 1);
      const f = t - i;
      return {
        x: xs[i] + (xs[i + 1] - xs[i]) * f,
        y: ys[i] + (ys[i + 1] - ys[i]) * f,
      };
    },
  };
}

/** 5) Largo de estela según velocidad del muelle (progreso/seg). Suavizar el resultado. */
export function tailFromVelocity(velocity, { min = 0.035, max = 0.16, gain = 5 } = {}) {
  return min + clamp(Math.abs(velocity) * gain) * (max - min);
}
